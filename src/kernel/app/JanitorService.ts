import { Filesystem, Directory } from "@capacitor/filesystem";
import { Preferences } from "@capacitor/preferences";

import { store } from "@/redux";
import { selectDeviceInfo } from "@/redux/device";
import {
  selectSecuritySettings,
  selectPreferences,
  setPreference,
} from "@/redux/preferences";

import DatabaseService, { _dbOpen } from "@/kernel/app/DatabaseService";
import LogService from "@/kernel/app/LogService";
import SecurityService, { AuthActions } from "@/kernel/app/SecurityService";
import BlockchainService from "@/kernel/bch/BlockchainService";
import TransactionManagerService from "@/kernel/bch/TransactionManagerService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

const Log = LogService("Janitor");

export default function JanitorService() {
  return {
    migrateLegacyDatabases,
    handleAuthMigration,
    recoverWalletFiles,
    fsck,
    purgeStaleData,
    resetDatabases,
    nuclearWipe,
  };

  async function migrateLegacyDatabases() {
    // check for pre-2024.05 .db.bak files
    const getLegacyBackupFiles = async () => {
      try {
        const backupFiles = (
          await Filesystem.readdir({
            path: "/selene",
            directory: Directory.Library,
          })
        ).files.filter((file) => file.type === "file");

        return backupFiles.map((file) => `/selene/${file.name}`);
      } catch (e) {
        Log.error(e);
        return [];
      }
    };

    // copy legacy wallet backups from database to filesystem
    const extractLegacyWallets = async (legacy_db) => {
      const legacy_wallets = legacy_db.exec("SELECT * FROM wallets");
      const WalletManager = WalletManagerService();
      return Promise.all(
        legacy_wallets.map((wallet) => {
          return WalletManager.exportWalletFile({
            ...wallet,
            created_at: wallet.date_created, // rename date_created field
          });
        })
      );
    };

    // attempt to open a .db file and extract wallet data, then delete the .db file
    const attemptMigration = async (filename) => {
      try {
        // check if legacy db file exists (throws if not exists)
        const legacy_db = await _dbOpen(filename, true);
        await extractLegacyWallets(legacy_db);

        const deleteResult = await Filesystem.deleteFile({
          path: filename,
          directory: Directory.Library,
        });
        Log.log("Migrated legacy database file", filename, deleteResult);
      } catch {
        // pass
      }
    };

    // check for pre-2024.10, 2024.05 databases
    const backupFiles = await getLegacyBackupFiles();
    const attemptFiles = ["selene/selene.db", "db/selene.db", ...backupFiles];

    await Promise.allSettled(
      attemptFiles.map((file) => attemptMigration(file))
    );

    // remove stale pre-2024.05 db dir AFTER attempting to recover the legacy databases
    try {
      await Filesystem.rmdir({
        path: "/db",
        directory: Directory.Library,
        recursive: true,
      });
    } catch {
      // pass
    }
  }

  // Remove after 99% of userbase is verified to have version 2026.03+
  async function handleAuthMigration(): Promise<boolean> {
    const state = store.getState();
    const { authMode, authActions } = selectSecuritySettings(state);
    const { pinHash } = selectPreferences(state);
    const { hasBiometric } = selectDeviceInfo(state);

    if (pinHash === "") {
      return true;
    }

    const Security = SecurityService();

    if (!Security.isPinConfigured()) {
      const pin = await Security.authorizeLegacyPin(pinHash);
      if (pin === null) {
        return false;
      }
      await Security.setPin(pin);
      Log.log("PIN migrated to encryption plugin");
    }

    if (authMode === "bio" && hasBiometric) {
      try {
        await Security.storeBiometricKeyFromCurrent();
        Log.log("Biometric key stored during migration");
      } catch (e) {
        Log.warn("Failed to store biometric key during migration", e);
      }
    }

    const actionsToAdd = [AuthActions.AppOpen, AuthActions.AppResume].filter(
      (a) => !authActions.includes(a)
    );
    if (actionsToAdd.length > 0) {
      const updated = [...actionsToAdd, ...authActions].join(";");
      await store.dispatch(
        setPreference({ key: "authActions", value: updated })
      );
    }
    await store.dispatch(setPreference({ key: "pinHash", value: "" }));
    return true;
  }

  async function recoverWalletFiles() {
    Log.log("Searching for wallet files");

    const { files: fileWallets } = await Filesystem.readdir({
      path: "/selene/wallets",
      directory: Directory.Library,
    });

    const WalletManager = WalletManagerService();

    const metaWallets = WalletManager.listWallets();

    Log.log(
      `Found ${fileWallets.length} wallet files, ${metaWallets.length} in app database`
    );

    // make a list of walletHashes that are on the filesystem, but not in database
    const importWallets = fileWallets
      .map((file) => {
        const walletHash = file.name.split(".")[0];
        return metaWallets.some((w) => w.walletHash === walletHash)
          ? null
          : walletHash;
      })
      .filter((hash) => hash !== null);

    if (importWallets.length > 0) {
      Log.debug("recoverWalletFiles", importWallets);
    }

    return Promise.all(
      importWallets.map((walletHash) =>
        WalletManager.importWalletFile(walletHash)
      )
    );
  }

  // fsck: FileSystem Consistency Check
  async function fsck() {
    const libraryDirs = [
      "/selene",
      "/selene/db",
      "/selene/wallets",
      "/selene/blocks",
      "/selene/bcmr",
    ];
    const cacheDirs = [
      "/selene",
      "/selene/icons",
      "/selene/images",
      "/selene/tx",
    ];

    await libraryDirs.reduce(
      (chain, path) => chain.then(() => ensureDir(path, Directory.Library)),
      Promise.resolve()
    );
    await cacheDirs.reduce(
      (chain, path) => chain.then(() => ensureDir(path, Directory.Cache)),
      Promise.resolve()
    );

    // Clean up stale .tmp files from interrupted atomic writes
    const tmpCleanupDirs = ["/selene/db", "/selene/wallets"];
    const tmpFiles: string[] = [];
    await Promise.all(
      tmpCleanupDirs.map(async (dir) => {
        try {
          const { files } = await Filesystem.readdir({
            path: dir,
            directory: Directory.Library,
          });
          files
            .filter((f) => f.name.endsWith(".tmp"))
            .forEach((f) => tmpFiles.push(`${dir}/${f.name}`));
        } catch {
          // pass
        }
      })
    );
    await Promise.all(
      tmpFiles.map((path) =>
        Filesystem.deleteFile({ path, directory: Directory.Library }).catch(
          () => {}
        )
      )
    );
  }

  async function ensureDir(path: string, directory: Directory) {
    try {
      await Filesystem.readdir({ path, directory });
    } catch {
      await Filesystem.mkdir({ path, directory });
    }
  }

  async function purgeLegacyTransactionFiles() {
    // remove pre-2024 /tx directory
    try {
      await Filesystem.rmdir({
        path: "/tx",
        directory: Directory.Library,
        recursive: true,
      });
    } catch {
      // pass
    }

    // remove pre-2026.02 /selene/tx from Library (now in Cache)
    // tx data is just a cache - will be re-fetched from Electrum as needed
    try {
      await Filesystem.rmdir({
        path: "/selene/tx",
        directory: Directory.Library,
        recursive: true,
      });
    } catch {
      // pass
    }
  }

  // purgeStaleData: removes data from the wallet that is no longer used
  async function purgeStaleData() {
    await purgeLegacyTransactionFiles();
    await TransactionManagerService().purgeTransactions();
    await BlockchainService().purgeBlocks(); // BlockchainService does not need bchNetwork here
  }

  // nuclearWipe: scorched earth reset that works WITHOUT any database access.
  // Deletes all databases, wallet files, encryption state, and preferences.
  // Used for "forgot PIN" recovery when the database cannot be decrypted.
  // Never throws — best-effort wipe; even partial wipe should proceed to restart.
  async function nuclearWipe() {
    Log.log("*** NUCLEAR WIPE ***");

    try {
      const rmrf = (path: string, directory: typeof Directory.Library) =>
        Filesystem.rmdir({ path, directory, recursive: true }).catch((e) =>
          Log.warn(`nuclearWipe: failed to delete ${path}`, e)
        );

      // Delete data directories
      const dataDirs = [
        "/selene/db",
        "/selene/wallets",
        "/selene/blocks",
        "/selene/bcmr",
      ];
      await Promise.all(dataDirs.map((dir) => rmrf(dir, Directory.Library)));

      // Delete cache directories
      const cacheDirs = ["/selene/icons", "/selene/images", "/selene/tx"];
      await Promise.all(cacheDirs.map((dir) => rmrf(dir, Directory.Cache)));

      // Clear encryption plugin state (keys, salt, biometric key)
      try {
        await SecurityService().resetEncryption();
      } catch (e) {
        Log.warn("nuclearWipe: failed to reset encryption", e);
      }

      // Clear Capacitor Preferences (redux persist)
      try {
        await Preferences.clear();
      } catch (e) {
        Log.warn("nuclearWipe: failed to clear preferences", e);
      }
    } catch (e) {
      Log.error("nuclearWipe: unexpected error (continuing anyway)", e);
    }
  }

  // resetDatabases: hard-resets all wallet databases and app database
  // [!] does NOT delete wallet FILES - DOES drop walletDb tables!
  // Caller is responsible for reloading the app after this completes.
  async function resetDatabases() {
    const Database = DatabaseService();
    const WalletManager = WalletManagerService();
    const APP_DB = Database.getAppDatabase();

    const metaWallets = WalletManager.listWallets();

    // delete each walletDb, but keep the wallet files so they can be re-imported later
    await Promise.all(
      metaWallets.map(async (w) => {
        await WalletManager.deleteWallet(w.walletHash, true);
      })
    );

    // reset appDb
    APP_DB.exec("PRAGMA user_version = 0;");
    await Database.flushDatabase("app");
  }
}
