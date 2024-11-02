import { Filesystem, Directory } from "@capacitor/filesystem";
import DatabaseService, { _dbOpen } from "@/services/DatabaseService";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";

const Log = LogService("Janitor");

export default function JanitorService() {
  return {
    migrateLegacyDatabases,
    recoverWalletFiles,
    fsck,
  };

  async function migrateLegacyDatabases() {
    try {
      await Filesystem.mkdir({
        path: "selene/",
        directory: Directory.Library,
        recursive: true,
      });
    } catch {
      // empty
    } finally {
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
        } catch (e) {
          // empty
        }
      };

      await attemptMigration("selene/selene.db");
      await attemptMigration("db/selene.db");
    }
  }

  async function recoverWalletFiles() {
    Log.debug("Searching for lost wallet files");

    const { files: fileWallets } = await Filesystem.readdir({
      path: "/selene/wallets",
      directory: Directory.Library,
    });

    const WalletManager = WalletManagerService();

    const metaWallets = WalletManager.listWallets();

    Log.debug(
      `Found ${fileWallets.length} wallet files, ${metaWallets.length} in database`,
      metaWallets
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
        WalletManagerService().importWalletFile(walletHash)
      )
    );
  }

  // fsck: FileSystem Consistency Check
  async function fsck() {
    try {
      await Filesystem.readdir({
        path: "/selene",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/db",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/db",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/wallets",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/wallets",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/tx",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/tx",
        directory: Directory.Library,
      });
    }

    try {
      await Filesystem.readdir({
        path: "/selene/blocks",
        directory: Directory.Library,
      });
    } catch (e) {
      await Filesystem.mkdir({
        path: "/selene/blocks",
        directory: Directory.Library,
      });
    }
  }
}
