import { App } from "@capacitor/app";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import { run_migrations } from "@/util/migrations";
import LogService from "@/services/LogService";

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

export const SELENE_DB_FILENAME = "selene/selene.db";
export const SELENE_LEGACY_DB_FILENAME = "db/selene.db";
const SELENE_DB_BACKUP_FILENAME = "selene/selene.db.bak";

// Connect to SQLite Database
Log.log("* Initializing Database *");
Log.time("initDb");
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });

// pointers for throttling db writes
const MAX_PENDING_SAVES = 8000;
let pendingCount = 0;
let flushPendingTimeout;
let isFlushing = false;

// open a db file from filesystem
export async function _dbOpen(filename) {
  const dbFile = await Filesystem.readFile({
    path: filename,
    directory: Directory.Library,
    encoding: Encoding.UTF8,
  });
  const dbData = dbFile.data.toString();
  const db = new SQL.Database(dbData.split(","));
  return db;
}

// getWalletDatabase: try to open the wallet db file
// return a blank db if file doesn't exist
async function getWalletDatabase() {
  Log.time("dbLoad");

  let db;
  try {
    db = await _dbOpen(SELENE_DB_FILENAME);
    Log.log("Loaded wallet database");
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

async function retryWalletDatabase() {
  // something went wrong, attempting to load backup
  let db;
  try {
    db = await _dbOpen(SELENE_DB_BACKUP_FILENAME);
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
  const filename = SELENE_DB_FILENAME.concat(".")
    .concat(Date.now().toString())
    .concat(".bak");

  Log.warn("Dumping database!!", filename);
  Log.time("dbDump");

  try {
    const result = await Filesystem.writeFile({
      path: filename,
      data: db.export().toString(),
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
export async function backup_db(db) {
  const filename = SELENE_DB_BACKUP_FILENAME;
  Log.log("Writing backup database file", filename);
  Log.time("dbBackup");

  try {
    const result = await Filesystem.writeFile({
      path: filename,
      data: db.export().toString(),
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

// use top-level pointer to ensure db is only loaded into memory once
const WALLET_DB = await getWalletDatabase();
Log.timeEnd("initDb");

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService(db = WALLET_DB) {
  return {
    db,
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
    clearTimeout(flushPendingTimeout);
    flushPendingTimeout = undefined;
    pendingCount += 1;

    if (pendingCount > MAX_PENDING_SAVES || force) {
      pendingCount = 0;
      flushPendingTimeout = undefined;
      await _flushDatabase(force);
      return;
    }

    flushPendingTimeout = setTimeout(async () => {
      pendingCount = 0;
      flushPendingTimeout = undefined;
      await _flushDatabase();
    }, 512);
  }

  // _flushDatabase [private]: writes database to disk
  async function _flushDatabase(force: boolean = false) {
    if (!force && (isFlushing || flushPendingTimeout !== undefined)) {
      Log.debug("skipping flush due to flushLock");
      return;
    }

    Log.time("flushDatabase");
    try {
      isFlushing = true;
      const result = await Filesystem.writeFile({
        path: SELENE_DB_FILENAME,
        data: db.export().toString(),
        directory: Directory.Library,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      Log.debug("flushDatabase", result);
    } catch (e) {
      Log.error("flushDatabase error", e);
    } finally {
      isFlushing = false;
      clearTimeout(flushPendingTimeout);
      flushPendingTimeout = undefined;
      Log.timeEnd("flushDatabase");
    }
  }
}

// force database write on app stop and pause
App.addListener("appStateChange", async ({ isActive }) => {
  if (!isActive) {
    await DatabaseService().saveDatabase(true);
    Log.debug("flushDatabase on stop");
  }
});

// force database write on app stop and pause
App.addListener("pause", async () => {
  await DatabaseService().saveDatabase(true);
  Log.debug("flushDatabase on pause");
});

// HERE BE SATS if someone wants to try to steal them!
// Some ancient commit will load this wallet, but send wasn't implemented yet...
/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
