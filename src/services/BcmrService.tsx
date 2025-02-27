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
  const bcmr: MetadataRegistry = bcmrOtr as MetadataRegistry;

  return {
    getIdentity,
    resolveIdentity,
    resolveAuthChain,
  };

  function getIdentity(authbase: string) {
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

    return currentSnapshot;
  }

  async function resolveIdentity(authbase: string) {
    const authhead = await resolveAuthChain(authbase);

    const BCMR_MAGIC = "6a0442434d52"; // OP_RETURN BCMR
    const bcmrOutput = authhead.vout.find((out) =>
      out.scriptPubKey.hex.startsWith(BCMR_MAGIC)
    );

    if (bcmrOutput) {
      Log.debug("resolveIdentity found BCMR output", bcmrOutput);
    }
  }
  async function resolveAuthChain(authbase) {
    const TransactionManager = TransactionManagerService();
    const Electrum = ElectrumService();

    Log.debug("resolveAuthChain", authbase);

    let nextTxHash = authbase;
    let chain = []; // Track the chain for debugging or return

    while (true) {
      chain.push(nextTxHash);

      // Check if output 0 is unspent (authhead condition)
      const identityUtxo = await Electrum.requestUtxoInfo(nextTxHash, 0);
      if (identityUtxo !== null) {
        Log.debug("resolveAuthChain found authhead utxo", identityUtxo);

        const authhead = await Electrum.requestTransaction(nextTxHash);
        Log.debug("authhead", authhead);
        return authhead; // Return the authhead transaction hash
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
          return h.tx_hash; // Resolve with the transaction hash that spends output 0
        }
        // Explicitly reject with a reason for non-matching transactions
        return Promise.reject(
          new Error(`Transaction ${h.tx_hash} does not spend ${nextTxHash}:0`)
        );
      });

      try {
        nextTxHash = await Promise.any(promises);
        Log.debug("Found next transaction in chain", nextTxHash);
      } catch (error) {
        // If no transaction spends output 0, this might indicate an error or incomplete history
        Log.error("No spending transaction found for", nextTxHash, error);
        throw new Error(
          `Authchain resolution failed: No spending transaction found for ${nextTxHash}`
        );
      }
    }
  }
}
