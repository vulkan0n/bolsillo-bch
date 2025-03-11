/* eslint-disable */
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import { DateTime } from "luxon";
import {
  importMetadataRegistry,
  MetadataRegistry,
  IdentitySnapshot,
} from "@bitauth/libauth";
import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import TransactionManagerService from "@/services/TransactionManagerService";
import DatabaseService from "@/services/DatabaseService";

import { sha256 } from "@/util/hash";

import bcmrLocal from "@/assets/bcmr-selene-local.json";

const Log = LogService("BcmrService");

let _bcmr = importMetadataRegistry(bcmrLocal) as MetadataRegistry;

export default function BcmrService() {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();

  return {
    extractIdentity,
    resolveIdentity,
    resolveAuthChain,
    //mergeRegistry,
  };

  async function _loadBcmrFile(bcmrId = "selene-local") {
    const bcmrFile = await Filesystem.readFile({
      path: `/selene/bcmr/bcmr-${bcmrId}.json`,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });

    const bcmr = importMetadataRegistry(bcmrFile.data);

    if (typeof bcmr === "string") {
      throw new Error(bcmr);
    }

    //mergeRegistry(bcmr);
    //Log.debug("loadBcmrFile", _bcmr);
    return bcmr;
  }

  async function _writeBcmrFile(bcmrId = "selene-local", bcmr = _bcmr) {
    const result = await Filesystem.writeFile({
      path: `/selene/bcmr/bcmr-${bcmrId}.json`,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      data: JSON.stringify(bcmr),
    });

    Log.debug("writeBcmrFile", result, bcmr);
  }

  function extractIdentity(category: string, bcmr = _bcmr) {
    const snapshots = bcmr.identities ? bcmr.identities[category] : null;

    if (snapshots === null) {
      throw new Error(`No identity for category ${category}`);
    }

    const kSnapshots = Object.keys(snapshots).sort().reverse();
    const latestSnapshotTimestamp = kSnapshots.shift();

    if (!latestSnapshotTimestamp) {
      throw new Error(`No identity for category ${category}`);
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

    //Log.debug("currentSnapshot", currentSnapshot, category);

    return currentSnapshot;
  }

  async function loadIdentityRegistry(category: string) {
    const result = APP_DB.exec("SELECT * FROM bcmr WHERE category=?", [
      category,
    ]);

    if (result.length < 1) {
      throw new Error(`No registry for category ${category}`);
    }

    const registryFile = await _loadBcmrFile(`${category}`);
    const registry = Object.assign({}, result[0], registryFile);
    //Log.debug("loadRegistry", category, registry);
    return registry;
  }

  async function writeIdentityRegistry(
    category: string,
    registry: MetadataRegistry
  ) {
    const registryUri = `https://bcmr.paytaca.com/api/registries/${category}/latest`;

    await _writeBcmrFile(`${category}`, registry);

    const result = APP_DB.exec(
      `INSERT INTO bcmr (category, registryUri) 
        VALUES ($category, $registryUri)
        ON CONFLICT(category) DO
          UPDATE SET
            lastFetch=strftime('%Y-%m-%dT%H:%M:%SZ') 
        RETURNING *;`,
      { $category: category, $registryUri: registryUri }
    );

    return Object.assign({}, result[0], registry);
  }

  async function resolveIdentityRegistry(category: string) {
    try {
      const registry = await loadIdentityRegistry(category);
      if (
        DateTime.fromISO(registry.lastFetch).plus({ days: 7 }) < DateTime.now()
      ) {
        throw new Error("invalidate-cache");
      }
      return registry;
    } catch (e) {
      const registryUri = `https://bcmr.paytaca.com/api/registries/${category}/latest`;
      Log.debug("fetching identity registry from", registryUri);
      const response = await fetch(registryUri);

      const data = await response.json();
      const importedRegistry = importMetadataRegistry(data);

      if (typeof importedRegistry === "string") {
        throw new Error(importedRegistry);
      }

      if (typeof importedRegistry.registryIdentity === "string") {
        return resolveAuthChain(importedRegistry.registryIdentity);
      }

      if (!importedRegistry.identities) {
        throw new Error(
          `No identities resolved for category ${category} @ ${registryUri}`
        );
      }

      const importedIdentity = extractIdentity(category, importedRegistry);

      importedIdentity.extensions = Object.assign(
        {},
        importedRegistry.extensions,
        importedIdentity.extensions
      );

      const identity = await writeIdentityRegistry(category, importedRegistry);
      return identity;
    }
  }

  async function resolveIdentity(category: string, force = false) {
    const identityRegistry = await resolveIdentityRegistry(category);

    //Log.debug("resolveIdentity using registry", category, registry);

    const identity = extractIdentity(category, registry);

    if (identity.token) {
      if (registry.symbol === null) {
        APP_DB.exec("UPDATE bcmr SET symbol=$symbol WHERE category=$category", {
          $category: category,
          $symbol: identity.token.symbol,
        });
      }
      const splitSymbol = identity.token.symbol.split("-");
      identity.token.symbol = splitSymbol[0];
    }

    //Log.debug(identity);

    return identity;
  }

  async function resolveIcon(iconUri: string) {}

  async function resolveAuthChain(authbase: string) {
    const TransactionManager = TransactionManagerService();

    const identityOutput = { tx_hash: authbase, tx_pos: 0 };

    const Electrum = ElectrumService();
    let identityUtxo = Electrum.requestUtxoInfo(
      identityOutput.tx_hash,
      identityOutput.tx_pos
    );

    /* eslint-disable no-await-in-loop */
    let nextTxHash = authbase;
    while (identityUtxo === null) {
      const nextTx = await TransactionManager.resolveTransaction(nextTxHash);
      const scripthash = sha256
        .text(nextTx.vout[0].scriptPubKey.hex)
        .split("")
        .reverse()
        .join("");

      const scripthashHistory =
        await Electrum.requestScripthashHistory(scripthash);

      scanHistoryForUtxo(scripthashHistory, nextTxHash, 0);
    }
  }

  async function scanHistoryForUtxo(history, tx_hash, tx_pos) {
    const promises = history.map(async (h) => {
      const Electrum = ElectrumService();
      const { vin } = await Electrum.requestTransaction(h.tx_hash);

      const matchUtxo = vin.find(
        (vn) => vn.txid === tx_hash && vn.vout === tx_pos
      );

      if (!matchUtxo) {
        return Promise.reject();
      }

      return Promise.resolve({
        tx_hash: matchUtxo.txid,
        tx_pos: matchUtxo.vout,
      });
    });

    return Promise.any(promises);
  }

  function mergeRegistry(registry) {
    const r = importMetadataRegistry(registry);

    if (typeof r === "string") {
      throw new Error(r);
    }

    const incomingIdentities = Object.keys(r.identities);
    incomingIdentities.forEach((identity) => {
      _bcmr.identities[identity] = [
        ..._bcmr.identities[identity],
        ...r.identities[identity],
      ];
    });

    _bcmr.latestRevision = new Date().toISOString();

    Log.debug("mergeRegistry", r, _bcmr);
  }
}
