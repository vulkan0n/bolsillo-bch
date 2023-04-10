import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";

const SELENE_DB_FILE = "db/selene.db";

const SQL = await initSqlJs({ locateFile: (file) => "/sql-wasm.wasm" });
let db = null;
let flushPending = null;

try {
  // TODO: store mnemonics in a separate file so they can be encrypted
  // and not persist in memory unless needed
  const dbFile = await Filesystem.readFile({
    path: SELENE_DB_FILE,
    directory: Directory.Library,
    encoding: Encoding.UTF8,
  });
  db = new SQL.Database(dbFile.data.split(","));
} catch (e) {
  console.warn("New Database File");
  db = new SQL.Database();
}

function initializeTables() {
  const query = [];
  query.push("PRAGMA foreign_keys = ON;");
  query.push(
    `CREATE TABLE IF NOT EXISTS wallets ( 
        id integer primary key not null, 
        name text not null, 
        mnemonic text unique not null, 
        derivation text default "m/44'/0'/0'", 
        date_created default CURRENT_TIMESTAMP, 
        key_viewed text, 
        key_verified text, 
        balance int default 0
      );`
  );
  query.push("DROP TABLE addresses;");
  query.push(
    `CREATE TABLE IF NOT EXISTS addresses (
        address text primary key not null, 
        wallet_id int not null, 
        hd_index int not null, 
        balance int default 0, 
        change int default 0, 
        state text default null
      );`
  );
  query.push("DROP TABLE transactions;");
  query.push(
    `CREATE TABLE IF NOT EXISTS transactions (
        txid text primary key not null, 
        wallet_id int not null, 
        time_seen default CURRENT_TIMESTAMP,
        address text,
        hex text,
        description text,
        size int,
        blockhash text,
        time int,
        blocktime int,
        locktime int,
        version int,
        height int
    );`
  );
  query.push("DROP TABLE vins;");
  query.push(
    `CREATE TABLE IF NOT EXISTS vins (
      txid text not null,
      prevtx text not null,
      vout int not null,
      scriptSig text not null
    );`
  );
  query.push("DROP TABLE utxos;");
  query.push(
    `CREATE TABLE IF NOT EXISTS utxos (
        tx_hash text not null,
        tx_pos int not null,
        address text,
        scriptPubKey text, 
        amount int not null, 
        height int,
        spent int default 0
      );`
  );
  query.push("DROP VIEW wallet_balance;");
  query.push(
    `CREATE VIEW IF NOT EXISTS wallet_balance AS SELECT 
      wallets.id as wallet_id,
      SUM(addresses.balance) AS balance FROM wallets, addresses
    ;`
  );
  db.run(query.join(""));
}

initializeTables();

export default function DatabaseService() {
  return {
    saveDatabase,
    db,
    resultToJson,
  };

  function saveDatabase() {
    clearTimeout(flushPending);

    flushPending = setTimeout(async () => {
      await flushDatabase();
    }, 120);
  }

  async function flushDatabase() {
    const data = db.export();

    const result = await Filesystem.writeFile({
      path: SELENE_DB_FILE,
      data: data.toString(),
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    console.log("flushDatabase", result);
  }

  function resultToJson(result) {
    if (result.length === 0) {
      //console.log("resultToJson", result);
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

/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
