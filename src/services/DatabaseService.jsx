import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";

const SQL = await initSqlJs({ locateFile: (file) => "/sql-wasm.wasm" });
let dbFile = "";
try {
  dbFile = await Filesystem.readFile({
    path: "db/selene.db",
    directory: Directory.Library,
    encoding: Encoding.UTF8,
  });
} catch (e) {
  console.warn("New Database File");
}

let db = new SQL.Database(dbFile.data);

function initializeTables() {
  let q =
    "CREATE TABLE IF NOT EXISTS wallets (id integer primary key, name text not null, mnemonic text unique not null, derivation text default \"m/44'/0'/0'\", date_created default CURRENT_TIMESTAMP, key_viewed text, key_verified text, balance int default 0);";
  db.run(q);
  q =
    "CREATE TABLE IF NOT EXISTS addresses (address text primary key, wallet_id int not null, hd_index int not null, balance int default 0, ntxout int default 0, ntxin int default 0, change int default 0, state text default null)";
  db.run(q);
  q =
    "CREATE TABLE IF NOT EXISTS utxos (address text not null, txid text not null, outpoint int not null, scriptHash text not null, balance int)";
  db.run(q);
}

initializeTables();

function DatabaseService() {
  return {
    saveDatabase,
    db,
    resultToJson,
  };

  async function saveDatabase() {
    const data = db.export();
    console.log("saveDatabase", data);

    await Filesystem.writeFile({
      path: "db/selene.db",
      data: data,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
  }

  function resultToJson(result) {
    if (result.length === 0) {
      console.log("resultToJson", result);
      return result;
    }

    //console.log("resultToJson", result);

    const mapped = result[0].values.map((val, i) =>
      result[0].columns.map((col, j) => ({ [result[0].columns[j]]: val[j] }))
    );

    const reduced = mapped.map((m) =>
      m.reduce((acc, cur) => ({ ...acc, ...cur }), {})
    );

    //console.log("resultToJson", result, mapped, reduced);
    return reduced;
  }
}

export default DatabaseService;

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
