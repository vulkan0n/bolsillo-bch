import { Filesystem, Directory, Encoding } from "@capacitor/filesystem";
import initSqlJs from "sql.js";
import {
  run_appdb_migrations,
  run_walletdb_migrations,
} from "@/util/migrations";
import { resultToJson } from "@/util/sql";
import LogService from "@/services/LogService";

const Log = LogService("Database");

const APP_DB_FILENAME = "/selene/db/app.db";

export class DatabaseNotOpenError extends Error {
  constructor(handle: string) {
    super(`No Database open with handle ${handle}`);
  }
}

// Connect to SQLite Database
Log.log("* Initializing SQLite *");
const SQL = await initSqlJs({ locateFile: () => "/sql-wasm.wasm" });

// pointers for throttling db writes
const isFlushing = {};

const db_handles = new Map();
let db_keepalive = null;

// open a db file from filesystem
// by default, creates and initializes the db file if it doesn't exist
export async function _dbOpen(filename, skipCreate = false) {
  let db;
  try {
    const dbFile = await Filesystem.readFile({
      path: filename,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
    });
    const dbData = dbFile.data.toString();
    db = new SQL.Database(dbData.split(","));
  } catch (e) {
    if (skipCreate) {
      throw e;
    }

    Log.warn("Creating database file", filename);
    db = new SQL.Database();
  }

  const dbExec = db.exec;
  db.exec = (...args) => resultToJson(dbExec.apply(db, args));

  db.path = filename;
  return db;
}

// flushDatabase: writes database to disk
async function flushDatabase(handle = "app", force: boolean = false) {
  if (!force && isFlushing[handle]) {
    Log.debug("skipping flush due to flushLock", handle);
    return Promise.resolve();
  }

  Log.time(`flushDatabase ${handle}`);
  try {
    isFlushing[handle] = true;
    const db_handle = db_handles.get(handle);

    const data = db_handle.export().toString();
    const result = await Filesystem.writeFile({
      path: db_handle.path,
      data,
      directory: Directory.Library,
      encoding: Encoding.UTF8,
      recursive: true,
    });

    Log.debug("flushDatabase", result.uri);
    return result;
  } catch (e) {
    Log.error("flushDatabase error", e);
    throw e;
  } finally {
    isFlushing[handle] = false;
    Log.timeEnd(`flushDatabase ${handle}`);
  }
}

// getAppDatabase: try to open the app db file
async function getAppDatabase() {
  let appDb;
  if (db_handles.has("app")) {
    appDb = db_handles.get("app");
  } else {
    Log.time("getAppDatabase");
    appDb = await _dbOpen(APP_DB_FILENAME);
    const didMigrations = run_appdb_migrations(appDb);
    Log.log("Loaded app database");
    db_handles.set("app", appDb);

    if (didMigrations) {
      await flushDatabase("app");
    }

    Log.timeEnd("getAppDatabase");
  }

  return appDb;
}

await getAppDatabase();

// DatabaseService: brokers interactions with raw SQLite database
export default function DatabaseService() {
  return {
    getAppDatabase,
    getWalletDatabase,
    openWalletDatabase,
    closeWalletDatabase,
    deleteWalletDatabase,
    flushDatabase,
    flushHandles,
    setKeepAlive,
    getKeepAlive,
  };

  // synchronous getWalletDatabase (requires db handle to be open already)
  function getWalletDatabase(walletHash) {
    if (!db_handles.has(walletHash)) {
      throw new DatabaseNotOpenError(walletHash);
    }

    const walletDb = db_handles.get(walletHash);
    return walletDb;
  }

  // asynchronous openWalletDatabase (returns db handle when ready)
  async function openWalletDatabase(walletHash, network = "mainnet") {
    if (walletHash === "") {
      throw new DatabaseNotOpenError(walletHash);
    }

    //Log.time(`openWalletDatabase ${walletHash}`);

    let walletDb;
    if (db_handles.has(walletHash)) {
      walletDb = db_handles.get(walletHash);
    } else {
      const walletDbFilename = `/selene/db/${walletHash}.${network}.db`;
      walletDb = await _dbOpen(walletDbFilename);
      const didMigrations = run_walletdb_migrations(walletDb);
      db_handles.set(walletHash, walletDb);

      if (didMigrations) {
        await flushDatabase(walletHash);
      }
    }

    //Log.timeEnd(`openWalletDatabase ${walletHash}`);
    return walletDb;
  }

  async function closeWalletDatabase(walletHash, skipFlush = false) {
    if (!db_handles.has(walletHash)) {
      Log.warn("closeWalletDatabase: not open", walletHash);
      return;
    }

    //Log.time(`closeWalletDatabase ${walletHash}`);

    const walletDb = getWalletDatabase(walletHash);
    if (!skipFlush) {
      await flushDatabase(walletHash);
    }
    walletDb.close();
    db_handles.delete(walletHash);

    //Log.timeEnd(`closeWalletDatabase ${walletHash}`);
  }

  async function deleteWalletDatabase(walletHash, network) {
    await closeWalletDatabase(walletHash, true);

    return Filesystem.deleteFile({
      path: `/selene/db/${walletHash}.${network}.db`,
      directory: Directory.Library,
    });
  }

  async function flushHandles(shouldCloseHandles: boolean = true) {
    Log.debug("flushHandles", db_handles);
    const promises = [...db_handles].map(async ([handle]) => {
      if (shouldCloseHandles && handle !== "app" && handle !== db_keepalive) {
        return closeWalletDatabase(handle);
      }

      // else flush without closing
      return flushDatabase(handle);
    });
    //Log.debug("flushHandles promises", promises);

    return Promise.all(promises);
  }

  function setKeepAlive(handle) {
    db_keepalive = handle;
  }

  function getKeepAlive() {
    return db_keepalive;
  }
}

// HERE BE SATS if someone wants to try to steal them!
// Some ancient commit will load this wallet, but send wasn't implemented yet...
/*const _fakeDb = [
  {
    name: "Selene Test",
    //k: "73,64,6,145,107,79,169,89,142,119,169,158,122,115,156,60,45,234,0,74,208,131,25,53,197,120,36,176,37,105,201,119",
    k: "[object Object]",
  },
];*/
