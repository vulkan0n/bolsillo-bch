import Logger from "js-logger";
import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import { run_migrations } from "@/util/migrations";

/*
 * [network/servers]
 * [network/blocks]
 * [network/transactions]
 * [network/wallet_id/entity]
 * mainnet/1/wallet
 * mainnet/1/addresses
 * mainnet/1/utxos
 * mainnet/1/history
 * mainnet/1/settings
 */

const SELENE_LEGACY_DB_FILE = "db/selene.db";

// Connect to SQLite Database
// use top-level pointers to ensure db is only loaded into memory once
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
let flushPending = null;

async function _dbOpen(filename) {
  try {
    const dbFile = await Filesystem.readFile({
      path: filename,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
    const dbData = dbFile.data.toString();
    const db = new SQL.Database(dbData.split(","));
    return db;
  } catch (e) {
    Logger.error(e);
    const db = new SQL.Database();
    return db;
  }
}

async function getWalletDatabase() {
  Logger.debug("getWalletDatabase");
  // run schema migrations
  try {
    //const SELENE_DB_FILE = "selene/selene.db";
    const db = await _dbOpen(SELENE_LEGACY_DB_FILE);
    run_migrations(db);
    return db;
  } catch (e) {
    Logger.error(e);
    const db = new SQL.Database();
    run_migrations(db);
    return db;
  }
}

const db = await getWalletDatabase();

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService() {
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

    //Logger.log("resultToJson", result, mapped, reduced);
    return reduced;
  }

  // saveDatabase: schedules a write to disk
  // sets a timeout to batch writes together
  function saveDatabase() {
    const filename = SELENE_LEGACY_DB_FILE;
    clearTimeout(flushPending);

    flushPending = setTimeout(async () => {
      await _flushDatabase(filename);
    }, 180);
  }

  // _flushDatabase [private]: writes database to disk
  async function _flushDatabase(filename) {
    const data = db.export();

    const result = await Filesystem.writeFile({
      path: filename,
      data: data.toString(),
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    Logger.debug("flushDatabase", filename, result);
  }
}

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
