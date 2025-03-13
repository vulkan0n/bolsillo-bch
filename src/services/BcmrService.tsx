/* eslint-disable */
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { DateTime } from "luxon";
import {
  importMetadataRegistry,
  MetadataRegistry,
  IdentitySnapshot,
  IdentityHistory,
  RegistryTimestampKeyedValues,
} from "@bitauth/libauth";
import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import TransactionManagerService from "@/services/TransactionManagerService";
import DatabaseService from "@/services/DatabaseService";

import { sha256 } from "@/util/hash";

import bcmrLocal from "@/assets/bcmr-selene-local.json";

const Log = LogService("BcmrService");

interface LocalMetadataRegistry extends MetadataRegistry {
  identities: RegistryTimestampKeyedValues<IdentityHistory>;
}

const _bcmr = importMetadataRegistry(bcmrLocal) as LocalMetadataRegistry;

interface BcmrMeta extends MetadataRegistry {
  authbase: string;
  registryUri: string;
  lastFetch: string;
}

interface IdentityRegistry {
  registry: MetadataRegistry;
  registryHash: string;
  registryMeta: BcmrMeta;
}

function getDefaultRegistryUri(authbase: string): string {
  const registryUri = `https://bcmr.paytaca.com/api/registries/${authbase}/latest`;
  return registryUri;
}

export default function BcmrService() {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();

  return {
    extractIdentity,
    resolveIdentityRegistry,
    resolveAuthChain,
    resolveIcon,
    getCategoryAuthbase,
    purgeBcmrData,
    exportLocalBcmr,
  };

  // --------------------------------

  async function _importBcmrFile(
    bcmrId = "selene-local"
  ): Promise<MetadataRegistry> {
    const bcmrFile = await Filesystem.readFile({
      path: `/selene/bcmr/bcmr-${bcmrId}.json`,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });

    const bcmr = importMetadataRegistry(bcmrFile.data);

    if (typeof bcmr === "string") {
      throw new Error(bcmr);
    }

    Log.debug("importBcmrFile", bcmr);
    return bcmr;
  }

  async function _writeBcmrFile(
    bcmrId = "selene-local",
    bcmr: MetadataRegistry = _bcmr
  ): Promise<void> {
    const result = await Filesystem.writeFile({
      path: `/selene/bcmr/bcmr-${bcmrId}.json`,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      data: JSON.stringify(bcmr),
    });

    Log.debug("writeBcmrFile", result, bcmr);
  }

  // --------------------------------

  // extractIdentity: get the current IdentitySnapshot for an authbase from a Registry
  function extractIdentity(
    authbase: string,
    bcmr: MetadataRegistry = _bcmr
  ): IdentitySnapshot {
    const snapshots = bcmr.identities ? bcmr.identities[authbase] : null;

    if (snapshots === null) {
      throw new Error(`No identity for authbase ${authbase}`);
    }

    const kSnapshots = Object.keys(snapshots).sort().reverse();
    const latestSnapshotTimestamp = kSnapshots.shift();

    if (!latestSnapshotTimestamp) {
      throw new Error(`No identity for authbase ${authbase}`);
    }

    const latestSnapshot = snapshots[latestSnapshotTimestamp];
    const now = DateTime.now();
    let migrated = latestSnapshot.migrated
      ? DateTime.fromISO(latestSnapshot.migrated)
      : DateTime.fromISO(latestSnapshotTimestamp);

    let currentSnapshot: IdentitySnapshot = latestSnapshot;
    let currentSnapshotTimestamp = latestSnapshotTimestamp;

    // if an identity is scheduled to migrate, make sure we return the current data, not latest
    while (migrated > now) {
      currentSnapshotTimestamp = kSnapshots.shift() || currentSnapshotTimestamp;
      currentSnapshot = snapshots[currentSnapshotTimestamp];

      if (!currentSnapshot.migrated) {
        break;
      }

      migrated = DateTime.fromISO(currentSnapshot.migrated);
    }

    //Log.debug("extractIdentity", authbase, currentSnapshot);
    return currentSnapshot;
  }

  // --------------------------------

  // loadIdentityRegistry: reads identity data from filesystem and app database
  async function loadIdentityRegistry(
    authbase: string
  ): Promise<IdentityRegistry> {
    const result = APP_DB.exec("SELECT * FROM bcmr WHERE authbase=?", [
      authbase,
    ]);

    if (result.length < 1) {
      throw new Error(`No registry for authbase ${authbase}`);
    }

    const registryMeta = result[0];
    const registry = await _importBcmrFile(authbase);
    const registryHash = sha256.text(JSON.stringify(registry));

    const identityRegistry = {
      registry,
      registryHash,
      registryMeta,
    };

    Log.debug("loadIdentityRegistry", authbase, identityRegistry);
    mergeRegistry(registry);
    return identityRegistry;
  }

  // commitIdentityRegistry: writes identity data to filesystem and app database
  async function commitIdentityRegistry(
    authbase: string,
    registry: MetadataRegistry,
    registryUri: string
  ): Promise<IdentityRegistry> {
    await _writeBcmrFile(authbase, registry);

    const registryMeta = APP_DB.exec(
      `INSERT INTO bcmr (authbase, registryUri) 
        VALUES ($authbase, $registryUri)
        ON CONFLICT(authbase) DO
          UPDATE SET
            lastFetch=strftime('%Y-%m-%dT%H:%M:%SZ'),
            registryUri=$registryUri
        RETURNING *;`,
      { $authbase: authbase, $registryUri: registryUri }
    )[0];

    const registryHash = sha256.text(JSON.stringify(registry));

    Log.debug(
      "commitIdentityRegistry",
      authbase,
      registry,
      registryHash,
      registryMeta
    );
    mergeRegistry(registry);

    return { registry, registryHash, registryMeta };
  }

  // --------------------------------

  function getCategoryAuthbase(category: string): string {
    const result = APP_DB.exec(
      "SELECT authbase FROM bcmr_tokens WHERE category=?",
      [category]
    );

    return result.length > 0 ? result[0].authbase : category;
  }

  async function resolveIdentityRegistry(
    authbase: string,
    _registryUri?: string
  ) {
    const registryUri = _registryUri || getDefaultRegistryUri(authbase);

    try {
      const identityRegistry = await loadIdentityRegistry(authbase);
      const { registryMeta } = identityRegistry;
      if (
        DateTime.fromISO(registryMeta.lastFetch).plus({ days: 7 }) <
          DateTime.now() ||
        registryMeta.registryUri !== registryUri
      ) {
        throw new Error("invalidate-cache");
      }
      Log.debug("resolveIdentityRegistry got", identityRegistry);
      return identityRegistry;
    } catch (e) {
      Log.debug("fetching identity registry from", registryUri);
      const response = await fetch(registryUri);
      const responseData = await response.json();

      const importedRegistry = importMetadataRegistry(responseData);

      if (typeof importedRegistry === "string") {
        throw new Error(importedRegistry);
      }

      const importedRegistryHash = sha256.text(
        JSON.stringify(importedRegistry)
      );

      // immediately upgrade to on-chain resolution if applicable
      /*
      if (typeof importedRegistry.registryIdentity === "string") {
        const authHeadRegistry = await resolveAuthHeadRegistry(
          importedRegistry.registryIdentity
        );

        const authHeadRegistryHash = sha256.text(
          JSON.stringify(authHeadRegistry)
        );

        if (registryHash !== authHeadRegistryHash) {
          await commitIdentityRegistry(authbase, authHeadRegistry, registryUri);
        }
      }
      */

      if (!importedRegistry.identities) {
        throw new Error(
          `No identities resolved for authbase ${authbase} @ ${registryUri}`
        );
      }

      /*const importedIdentity = extractIdentity(authbase, importedRegistry);

      importedIdentity.extensions = Object.assign(
        {},
        importedRegistry.extensions,
        importedIdentity.extensions
      );*/

      const identityRegistry = await commitIdentityRegistry(
        authbase,
        importedRegistry,
        registryUri
      );

      Log.debug("resolveIdentityRegistry resolved", identityRegistry);
      return identityRegistry;
    }
  }

  // --------------------------------

  async function resolveAuthChain(authbase: string) {
    const TransactionManager = TransactionManagerService();
    const Electrum = ElectrumService();

    Log.debug("resolveAuthChain", authbase);

    let nextTxHash = authbase;
    let chain = [] as string[];

    while (true) {
      chain.push(nextTxHash);

      // check if output 0 is unspent (authHead condition)
      const identityUtxo = await Electrum.requestUtxoInfo(nextTxHash, 0);
      if (identityUtxo !== null) {
        Log.debug("resolveAuthChain found authHead utxo", identityUtxo);

        const authHeadTx =
          await TransactionManager.resolveTransaction(nextTxHash);
        Log.debug("authHeadTx", authHeadTx);
        return authHeadTx;
      }

      // If output 0 is spent, find the spending transaction
      const nextTx = await TransactionManager.resolveTransaction(nextTxHash);

      /*const isOpReturn = nextTx.vout[0].scriptPubKey.hex.startsWith("6a");
      if (isOpReturn) {
        Log.warn("OP_RETURN", nextTx.vout[0]);
        return Promise.reject(`Identity burned? ${nextTxHash}`);
        }*/

      const address = nextTx.vout[0].scriptPubKey.addresses[0];
      const addressHistory = await Electrum.requestAddressHistory(
        address,
        nextTx.height
      );

      const promises = addressHistory.map(async (h) => {
        const { vin } = await TransactionManager.resolveTransaction(h.tx_hash);
        const matchUtxo = vin.find(
          (vn) => vn.txid === nextTxHash && vn.vout === 0
        );

        if (matchUtxo) {
          return h.tx_hash;
        }

        return Promise.reject(
          new Error(`Transaction ${h.tx_hash} does not spend ${nextTxHash}:0`)
        );
      });

      try {
        nextTxHash = await Promise.any(promises);
        Log.debug("Found next transaction in chain", nextTxHash);
      } catch (error) {
        // if no transaction spends output 0, this might indicate an error or incomplete history
        Log.error("No spending transaction found for", nextTxHash, error);
        throw new Error(
          `Authchain resolution failed: No spending transaction found for ${nextTxHash}`
        );
      }
    }
  }

  async function resolveAuthHeadRegistry(authbase: string) {
    const authHeadTx = await resolveAuthChain(authbase);

    const BCMR_MAGIC = "6a0442434d52"; // OP_RETURN BCMR
    const bcmrOutput = authHeadTx.vout.find((out) =>
      out.scriptPubKey.hex.startsWith(BCMR_MAGIC)
    );

    if (bcmrOutput) {
      Log.debug("resolveIdentity found BCMR output", bcmrOutput);
      // decode OP_RETURN data for BCMR output then resolveRegistry from ipfs/http
      const registryUri = "https://OP_RETURN_URI";
      return resolveIdentityRegistry(authbase, registryUri);
    }
  }

  // --------------------------------

  function mergeRegistry(registry) {
    const incomingIdentities = Object.keys(registry.identities);
    incomingIdentities.forEach((authbase) => {
      const bcmrIdentity = _bcmr.identities[authbase] || {};
      const registryIdentity = registry.identities[authbase] || {};

      const newBcmrIdentity = {
        ...bcmrIdentity,
        ...registryIdentity,
      };

      const hashedBcmrIdentity = sha256.text(JSON.stringify(bcmrIdentity));
      const hashedRegistryIdentity = sha256.text(
        JSON.stringify(registryIdentity)
      );
      const hashedNewIdentity = sha256.text(JSON.stringify(newBcmrIdentity));

      if (hashedNewIdentity !== hashedBcmrIdentity) {
        /*Log.debug(
          "bcmrIdentity",
          JSON.stringify(bcmrIdentity),
          hashedBcmrIdentity
        );
        Log.debug(
          "registryidentity",
          JSON.stringify(registryIdentity),
          hashedRegistryIdentity
        );
        Log.debug(
          "newBcmrIdentity",
          JSON.stringify(newBcmrIdentity),
          hashedNewIdentity
          );*/

        _bcmr.identities[authbase] = newBcmrIdentity;
        _bcmr.version.patch = _bcmr.version.patch + 1;
        _bcmr.latestRevision = new Date().toISOString();

        /*Log.debug(
          "mergeRegistry",
          bcmrIdentity,
          registryIdentity,
          newBcmrIdentity,
          _bcmr
          );*/
      }
    });
  }

  function exportLocalBcmr() {
    const validBcmr = importMetadataRegistry(_bcmr);

    if (typeof validBcmr === "string") {
      throw new Error(validBcmr);
    }

    const bcmr = JSON.stringify(validBcmr);

    Log.info(JSON.stringify(bcmr));
  }

  async function purgeBcmrData() {
    const bcmrFiles = (
      await Filesystem.readdir({
        path: "/selene/bcmr",
        directory: Directory.Library,
      })
    ).files;

    const bcmrIconFiles = (
      await Filesystem.readdir({
        path: "/selene/icons",
        directory: Directory.Cache,
      })
    ).files;

    Log.time("purgeBcmrData");
    await Promise.all([
      ...bcmrIconFiles.map((file) =>
        Filesystem.deleteFile({
          path: `/selene/icons/${file.name}`,
          directory: Directory.Cache,
        })
      ),
      ...bcmrFiles.map((file) =>
        Filesystem.deleteFile({
          path: `/selene/bcmr/${file.name}`,
          directory: Directory.Library,
        })
      ),
    ]);

    APP_DB.exec("DELETE FROM bcmr; DELETE FROM bcmr_tokens;");
    await Database.flushDatabase("app");
    Log.timeEnd("purgeBcmrData");
  }

  async function resolveIcon(authbase: string) {
    let iconBase64;
    const identity = extractIdentity(authbase);

    try {
      iconBase64 = (
        await Filesystem.readFile({
          path: `/selene/icons/${authbase}`,
          directory: Directory.Cache,
          encoding: Encoding.UTF8,
        })
      ).data;
    } catch (e) {
      if (!identity.uris || !identity.uris.icon) {
        throw new Error(`No icon for ${authbase}`);
      }

      let fetchUri = identity.uris.icon;

      if (fetchUri.startsWith("ipfs://")) {
        const uriSlice = fetchUri.slice(7);
        fetchUri = `https://ipfs.io/ipfs/${uriSlice}`;
      }

      const uriSplit = fetchUri.split("/");
      const filename = uriSplit.pop();

      const response = await fetch(fetchUri);
      const iconBytes = await response.bytes();
      const iconData = iconBytes.toBase64();

      const { uri: iconUri } = await Filesystem.writeFile({
        path: `/selene/icons/${authbase}`,
        directory: Directory.Cache,
        data: iconData,
        encoding: Encoding.UTF8,
      });

      const { data } = await Filesystem.readFile({
        path: iconUri,
        encoding: Encoding.UTF8,
      });

      iconBase64 = data;
      //Log.debug("iconBase64?", iconBase64);
    }

    const iconDataUri = `data:;base64,${iconBase64}`;

    return iconDataUri;
  }
}
