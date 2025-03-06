/* eslint-disable */
import { DateTime } from "luxon";
import { MetadataRegistry, IdentitySnapshot } from "@bitauth/libauth";
import LogService from "@/services/LogService";
import ElectrumService from "@/services/ElectrumService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { sha256 } from "@/util/hash";

import bcmrOtr from "@/assets/bcmr-open-token-registry-2023-05-15.json";

const Log = LogService("BcmrService");

export default function BcmrService() {
  const _bcmr: MetadataRegistry = bcmrOtr as MetadataRegistry;

  return {
    getIdentity,
    resolveIdentity,
    resolveAuthChain,
    truncateDescription,
  };

  function getIdentity(authbase: string, bcmr = _bcmr) {
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

    if (currentSnapshot.token) {
      const splitSymbol = currentSnapshot.token.symbol.split("-");
      currentSnapshot.token.symbol = splitSymbol[0];
    }

    //Log.debug("currentSnapshot", currentSnapshot, authbase);

    const colorHex = `#${authbase.slice(0, 6)}`;

    return { ...currentSnapshot, color: colorHex };
  }

  async function resolveIdentity(authbase: string) {
    let identity = {};
    try {
      const response = await fetch(
        `https://bcmr.paytaca.com/api/registries/${authbase}/latest`
      );

      const data = await response.json();
      identity = getIdentity(authbase, data);
    } catch (e) {
      // pass
    }

    const colorHex = `#${authbase.slice(0, 6)}`;

    const tokenData = {
      ...identity,
      category: authbase,
      color: colorHex,
    };

    Log.debug(tokenData);

    return tokenData;
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

  function truncateDescription(text) {
    // extract sentences, delimited by punctuation and whitespace
    const sentences = text.match(/.*?[.!?]\s*/g);

    // truncate down to first two sentences, remove whitespace
    const selectedText = (
      sentences ? sentences.slice(0, 2).join("") : text
    ).trim();

    if (selectedText.length <= 140) return selectedText;

    const truncated = selectedText.slice(0, 140);

    // truncate cleanly at word boundaries
    const lastSpace = truncated.lastIndexOf(" ");
    return lastSpace > 0
      ? truncated.slice(0, lastSpace) + "..."
      : truncated + "...";
  }
}
