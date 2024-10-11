import { Filesystem, Directory } from "@capacitor/filesystem";
import DatabaseService, {
  SELENE_DB_FILENAME,
  SELENE_LEGACY_DB_FILENAME,
  _dbOpen,
} from "@/services/DatabaseService";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";
import { run_migrations } from "@/util/migrations";

const Log = LogService("Janitor");

export default function JanitorService() {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    migrateLegacyDbFile,
    cleanupAddressStates,
    cleanupAddressTransactions,
    recoverWalletFiles,
  };

  // _migrateLegacyDbFile: move old db file to new location
  async function migrateLegacyDbFile() {
    Log.debug("Checking for legacy database file");

    try {
      // check if legacy db file exists (throws if not exists)
      await Filesystem.stat({
        path: SELENE_LEGACY_DB_FILENAME,
        directory: Directory.Library,
      });
    } catch (e) {
      // fail gracefully if file not found (no need to migrate)
      Log.debug("No legacy database found");
      return Promise.resolve();
    }

    try {
      await Filesystem.mkdir({
        path: "selene/",
        directory: Directory.Library,
        recursive: true,
      });
    } finally {
      // proceed even if directory already exists
      try {
        // check if normal db file exists (throws if not exists)
        await Filesystem.stat({
          path: SELENE_DB_FILENAME,
          directory: Directory.Library,
        });

        // if both legacy and new dbs exist, import wallets from legacy
        const legacy_db = await _dbOpen(SELENE_LEGACY_DB_FILENAME);
        const new_db = await _dbOpen(SELENE_DB_FILENAME);
        run_migrations(legacy_db);
        run_migrations(new_db);

        const LegacyDb = DatabaseService(legacy_db);
        const legacy_wallets = LegacyDb.resultToJson(
          legacy_db.exec("SELECT * FROM wallets")
        );

        legacy_wallets.forEach((w) => {
          try {
            new_db.run(
              `INSERT INTO wallets (
                name, 
                mnemonic, 
                passphrase, 
                derivation, 
                key_viewed
              ) VALUES (
                ?, ?, ?, ?, 
                strftime('%Y-%m-%dT%H:%M:%SZ')
              );`,
              [w.name, w.mnemonic, w.passphrase || "", w.derivation]
            );
          } catch (e) {
            Log.warn(`Couldn't import legacy wallet '${w.name}'.`, e);
          }
        });

        const NewDb = DatabaseService(new_db);
        NewDb.saveDatabase(true);

        const deleteResult = await Filesystem.deleteFile({
          path: SELENE_LEGACY_DB_FILENAME,
          directory: Directory.Library,
        });
        Log.log("Migrated legacy database file", deleteResult);
      } catch (e) {
        Log.error("Legacy database migration failed", e);
      }
    }

    return Promise.resolve();
  }

  function cleanupAddressStates() {
    const needsCleanup = resultToJson(
      db.exec(
        `SELECT address,state FROM addresses WHERE state LIKE "%Error%" OR state="null";`
      )
    );

    if (needsCleanup.length > 0) {
      Log.warn(`Found ${needsCleanup.length} addresses needing state cleanup!`);
      db.run(
        `UPDATE addresses SET state=NULL WHERE address IN (SELECT address FROM addresses WHERE state LIKE "%Error%" OR state="null");`
      );
      saveDatabase();
    }

    Log.debug("cleanupAddressStates done");
  }

  function cleanupAddressTransactions() {
    const needsCleanup = resultToJson(
      db.exec(
        "SELECT * FROM address_transactions WHERE wallet_id IS NULL OR wallet_id='0'"
      )
    );

    if (needsCleanup.length > 0) {
      Log.warn(
        `Found ${needsCleanup.length} address_transactions needing cleanup!`,
        needsCleanup
      );

      db.run(
        `DELETE FROM address_transactions WHERE wallet_id IS NULL OR wallet_id='0'`
      );
      saveDatabase();
    }

    Log.debug("cleanupAddressTransactions done");
  }

  async function recoverWalletFiles() {
    Log.debug("Searching for lost wallet files");

    const { files: fileWallets } = await Filesystem.readdir({
      path: "/selene/wallets",
      directory: Directory.Library,
    });

    const dbWallets = resultToJson(
      db.exec("SELECT id, walletHash FROM wallets")
    );

    Log.debug(
      `Found ${fileWallets.length} wallet files, ${dbWallets.length} in database`
    );

    // make a list of walletHashes that are on the filesystem, but not in database
    const importWallets = fileWallets
      .map((file) => {
        const walletHash = file.name.split(".")[0];
        return dbWallets.some((w) => w.walletHash === walletHash)
          ? null
          : walletHash;
      })
      .filter((hash) => hash !== null);

    Log.debug("recoverWalletFiles", importWallets);

    return Promise.all(
      importWallets.map(async (walletHash) => {
        const WalletManager = WalletManagerService("mainnet");
        const { mnemonic, passphrase, derivation, name } =
          await WalletManager.importWalletFile(walletHash);

        WalletManager.importWallet(mnemonic, passphrase, derivation, name);
      })
    );
  }
}
