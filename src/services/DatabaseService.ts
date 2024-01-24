import Logger from "js-logger";
import { App } from "@capacitor/app";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import { run_migrations } from "@/util/migrations";

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

Logger.useDefaults(); // eslint-disable-line react-hooks/rules-of-hooks
const SELENE_DB_FILE = "selene/selene.db";

// Connect to SQLite Database
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });

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
  const SELENE_LEGACY_DB_FILE = "db/selene.db";

  try {
    // check if legacy db file exists (throws if not exists)
    const statResult = await Filesystem.stat({
      path: SELENE_LEGACY_DB_FILE,
      directory: Directory.Library,
    });

    // copy legacy db file to new location (throws on failure)
    const renameResult = await Filesystem.rename({
      from: SELENE_LEGACY_DB_FILE,
      to: SELENE_DB_FILE,
      directory: Directory.Library,
    });

    Logger.debug("_migrateLegacyDbFile", statResult, renameResult);
  } catch (e) {} // eslint-disable-line no-empty

  return Promise.resolve();
}

// getWalletDatabase: try to open the wallet db file
// return a blank db if file doesn't exist
async function getWalletDatabase() {
  let db;
  try {
    db = await _dbOpen(SELENE_DB_FILE);
    Logger.debug("Loaded wallet database");
  } catch (e) {
    Logger.warn("Creating wallet database", e);
    db = new SQL.Database();
  }

  // run schema migrations
  run_migrations(db);
  return db;
}

// use top-level pointer to ensure db is only loaded into memory once
// try to migrate legacy db file first
await _migrateLegacyDbFile();
const WALLET_DB = await getWalletDatabase();

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService() {
  return {
    db: WALLET_DB,
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

    //Logger.debug("resultToJson", result, mapped, reduced);
    return reduced;
  }

  // saveDatabase: schedules a write to disk
  // sets a timeout to batch writes together
  async function saveDatabase(force: boolean = false) {
    clearTimeout(flushPending);
    pendingCount += 1;

    if (pendingCount > 256 || force) {
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
    try {
      const data = WALLET_DB.export();

      const result = await Filesystem.writeFile({
        path: SELENE_DB_FILE,
        data: data.toString(),
        directory: Directory.Library,
        encoding: Encoding.UTF8,
        recursive: true,
      });

      Logger.debug("flushDatabase", result);
    } catch (e) {
      Logger.error(e);
    }
  }
}

// force database write on app sleep
App.addListener("pause", () => {
  DatabaseService().saveDatabase(true);
  Logger.debug("flushDatabase on pause");
});

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
