import { DateTime } from "luxon";
import { MetadataRegistry, IdentitySnapshot } from "@bitauth/libauth";
import LogService from "@/services/LogService";

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

    Log.debug("currentSnapshot", currentSnapshot, authbase);

    return currentSnapshot;
  }

  async function resolveIdentity(authbase: string) {}

  async function resolveAuthChain(authbase: string) {}
}
