import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import { run_legacy_migrations } from "@/util/migrations";

// --------------------------------
const SELENE_LEGACY_DB_FILE = "db/selene.db";
// --------------------------------

/*
 *
 * [network/blocks]
 * mainnet/blocks
 * chipnet/blocks
 * [network/wallet_id/entity]
 * mainnet/1/transactions
 * mainnet/1/addresses
 * mainnet/1/utxos
 * mainnet/1/history
 */

// Connect to SQLite Database
// use top-level pointers to ensure db is only loaded into memory once
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });
const dbHandles = [];
let flushPending = null;

async function open_legacy() {
  // run schema migrations
  try {
    // TODO: store mnemonics in a separate file so they can be encrypted
    // and not persist in memory unless needed

    // TODO: ensure in-memory DB size stays sane over time
    // more testing needed but OOM error is a possible risk
    // split DB into multiple files if needed
    const dbFile = await Filesystem.readFile({
      path: SELENE_LEGACY_DB_FILE,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
    const db = new SQL.Database(dbFile.data.split(","));
    run_legacy_migrations(db);
  } catch (e) {
    console.error(e);
  }
}

// --------------------------------

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService() {
  const db = open_legacy();
  return {
    db,
    resultToJson,
    saveDatabase,
    open,
  };

  async function open(dbName) {
    let db = null;
    try {
      // TODO: store mnemonics in a separate file so they can be encrypted
      // and not persist in memory unless needed

      // TODO: ensure in-memory DB size stays sane over time
      // more testing needed but OOM error is a possible risk
      // split DB into multiple files if needed
      const dbFile = await Filesystem.readFile({
        path: dbName,
        directory: Directory.Library,
        encoding: Encoding.UTF8,
      });
      db = new SQL.Database(dbFile.data.split(","));
    } catch (e) {
      //console.warn("New Database File");
      db = new SQL.Database();
    }

    return db;
  }

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

    //console.log("resultToJson", result, mapped, reduced);
    return reduced;
  }

  // saveDatabase: schedules a write to disk
  // sets a timeout to batch writes together
  function saveDatabase() {
    clearTimeout(flushPending);

    flushPending = setTimeout(async () => {
      await _flushDatabase();
    }, 120);
  }

  // _flushDatabase [private]: writes database to disk
  async function _flushDatabase() {
    const data = db.export();

    const result = await Filesystem.writeFile({
      path: SELENE_DB_FILE,
      data: data.toString(),
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    // eslint-disable-next-line no-console
    console.log("flushDatabase", result);
  }
}

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
