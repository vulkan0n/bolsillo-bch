import { App } from "@capacitor/app";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import { run_migrations } from "@/util/migrations";
import LogService from "@/services/LogService";
import WalletManagerService from "@/services/WalletManagerService";

const Log = LogService("Database");

/*
 * [{ network }/servers.json]
 * [{ network }/blocks/blockhash.raw]
 * [{ network }/tx/tx_hash.raw]
 * [{ network }/wallet_id.db]
 * - /wallet
 * - /wallet_addresses
 * - /address_utxos
 * - /address_transactions
 * - /wallet_settings
 */

const SELENE_DB_FILE = "selene/selene.db";
const SELENE_DB_BACKUP_FILE = "selene/selene.db.bak";
const SELENE_LEGACY_DB_FILE = "db/selene.db";

// Connect to SQLite Database
Log.log("* Initializing Database *");
Log.time("initDb");
Log.debug("loading SQL module...");
Log.time("initSql");
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
Log.timeEnd("initSql");

// pointers for throttling db writes
let flushPending;
let pendingCount = 0;

// open a db file from filesystem
async function _dbOpen(filename) {
  const dbFile = await Filesystem.readFile({
    path: filename,
    directory: Directory.Library,
    encoding: Encoding.UTF8,
  });
  const dbData = dbFile.data.toString();
  const db = new SQL.Database(dbData.split(","));
  return db;
}

// _migrateLegacyDbFile: move old db file to new location
async function _migrateLegacyDbFile() {
  Log.debug("Checking for legacy database file");

  try {
    // check if legacy db file exists (throws if not exists)
    await Filesystem.stat({
      path: SELENE_LEGACY_DB_FILE,
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
        path: SELENE_DB_FILE,
        directory: Directory.Library,
      });

      // if both legacy and new dbs exist, import wallets from legacy
      const legacy_db = await _dbOpen(SELENE_LEGACY_DB_FILE);
      const new_db = await _dbOpen(SELENE_DB_FILE);
      run_migrations(legacy_db);
      run_migrations(new_db);

      const LegacyDb = DatabaseService(legacy_db);
      const legacy_wallets = LegacyDb.resultToJson(
        legacy_db.exec("SELECT * FROM wallets")
      );

      const WalletManager = WalletManagerService("mainnet");
      legacy_wallets.forEach((w) => {
        try {
          WalletManager.importWallet(
            w.mnemonic,
            w.passphrase,
            w.derivation,
            w.name
          );
        } catch (e) {
          Log.warn(
            `Couldn't import legacy wallet '${w.name}'. Mnemonic already exists?`
          );
        }
      });
    } catch (e) {
      // legacy db exists but old db doesn't
      // copy legacy db file to new location (throws on failure)
      try {
        const renameResult = await Filesystem.rename({
          from: SELENE_LEGACY_DB_FILE,
          to: SELENE_DB_FILE,
          directory: Directory.Library,
        });
        Log.log("Migrated legacy database file", renameResult);
      } catch (e2) {
        Log.error("Legacy database migration failed", e2);
      }
    }
  }

  return Promise.resolve();
}

async function retryWalletDatabase() {
  // something went wrong, attempting to load backup
  let db;
  try {
    db = await _dbOpen(SELENE_DB_BACKUP_FILE);
    Log.warn("Wallet database corrupted? Loading backup...");
    run_migrations(db);
  } catch (e) {
    Log.warn("Wallet database corrupted!! Creating new wallet database");
    // TODO: warn user when this happens
    db = new SQL.Database();
    run_migrations(db);
  }

  return db;
}

// dumps db file as-is with timestamp
async function dump_db(db) {
  const filename = SELENE_DB_FILE.concat(".")
    .concat(Date.now().toString())
    .concat(".bak");

  Log.warn("Dumping database!!", filename);
  Log.time("dbDump");

  try {
    const data = db.export();

    const result = await Filesystem.writeFile({
      path: filename,
      data: data.toString(),
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    Log.debug("DUMP_DB", filename, result);
  } catch (e) {
    Log.error(e);
  }

  Log.timeEnd("dbDump");
}

// dumps db file as backup
async function backup_db(db) {
  const filename = SELENE_DB_FILE.concat(".bak");
  Log.log("Writing backup database file", filename);
  Log.time("dbBackup");

  try {
    const data = db.export();

    const result = await Filesystem.writeFile({
      path: filename,
      data: data.toString(),
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    Log.debug("BACKUP_DB", filename, result);
  } catch (e) {
    Log.error(e);
  }

  Log.timeEnd("dbBackup");
}

// getWalletDatabase: try to open the wallet db file
// return a blank db if file doesn't exist
async function getWalletDatabase() {
  Log.time("dbLoad");

  let db;
  try {
    db = await _dbOpen(SELENE_DB_FILE);
    Log.log("Loaded wallet database");
    setTimeout(() => backup_db(db), 500); // decouple saving backup db from init process to improve startup speed
  } catch (e) {
    Log.warn("Creating wallet database", e);
    db = new SQL.Database();
  }

  // run schema migrations
  try {
    run_migrations(db);
  } catch (e) {
    // something went wrong when attempting to run migrations
    // probably "database image is malformed"
    // attempt to load backup file or bail with new db...
    await dump_db(db);
    db = await retryWalletDatabase();
  }

  Log.timeEnd("dbLoad");
  return db;
}

// use top-level pointer to ensure db is only loaded into memory once
// try to migrate legacy db file first
await _migrateLegacyDbFile();
const WALLET_DB = await getWalletDatabase();
Log.timeEnd("initDb");

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService(db = undefined) {
  return {
    db: db || WALLET_DB,
    resultToJson,
    saveDatabase,
  };

  // resultToJson: turns SQLite result into a consumable object
  function resultToJson(result) {
    // result is empty set (empty array)
    if (result.length === 0) {
      return result;
    }

    const mapped = result[0].values.map((val) =>
      result[0].columns.map((col, j) => ({ [result[0].columns[j]]: val[j] }))
    );

    const reduced = mapped.map((m) =>
      m.reduce((acc, cur) => ({ ...acc, ...cur }), {})
    );

    /* result:
     * [
     *  {
     *    columns: ["id", "name", ...],
     *    values: [
     *      [1, "Selene", ...],
     *      [2, ...],
     *      ...
     *    ]
     *  }
     *]
     *
     * mapped:
     * [
     *   [ { id: 1 }, { name: "Selene" }, ...],
     *   [ { id: 2 }, ...],
     *   ...
     * ]
     *
     * reduced:
     * [
     *   { id: 1, name: "Selene", ...},
     *   { id: 2, ...},
     *   ...
     * ]
     **/

    //Log.debug("resultToJson", result, mapped, reduced);
    return reduced;
  }

  // saveDatabase: schedules a write to disk
  // sets a timeout to batch writes together
  async function saveDatabase(force: boolean = false) {
    clearTimeout(flushPending);
    pendingCount += 1;

    if (pendingCount > 320 || force) {
      pendingCount = 0;
      await _flushDatabase();
      return;
    }

    flushPending = setTimeout(async () => {
      pendingCount = 0;
      await _flushDatabase();
    }, 512);
  }

  // _flushDatabase [private]: writes database to disk
  async function _flushDatabase() {
    Log.time("flushDatabase");
    try {
      const data = WALLET_DB.export();

      const result = await Filesystem.writeFile({
        path: SELENE_DB_FILE,
        data: data.toString(),
        directory: Directory.Library,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      Log.debug("flushDatabase", result);
    } catch (e) {
      Log.error(e);
    }
    Log.timeEnd("flushDatabase");
  }
}

// force database write on app stop
App.addListener("appStateChange", async ({ isActive }) => {
  if (!isActive) {
    await DatabaseService().saveDatabase(true);
    Log.debug("flushDatabase on stop");
  }
});

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
