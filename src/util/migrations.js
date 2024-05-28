// migrations.js: handle sqlite database schema updates
import LogService from "@/services/LogService";
import { DEFAULT_DERIVATION_PATH } from "@/util/crypto";

const Log = LogService("migrations");

// functions in this migrations will be executed sequentially,
// starting with the function at index PRAGMA user_version
// each entry should represent a new db version
const migrations = [
  function migrate_v0() {
    const query = [];

    query.push("PRAGMA user_version = 0;");

    //query.push("DROP TABLE IF EXISTS wallets;");
    query.push("DROP TABLE IF EXISTS blockchain;");
    query.push("DROP TABLE IF EXISTS addresses;");
    query.push("DROP TABLE IF EXISTS transactions;");
    query.push("DROP TABLE IF EXISTS address_transactions;");
    query.push("DROP TABLE IF EXISTS address_utxos;");
    query.push("DROP TRIGGER IF EXISTS balance_update;");
    query.push("DROP TRIGGER IF EXISTS utxo_balance_delete;");
    query.push("DROP TRIGGER IF EXISTS utxo_balance_insert;");

    query.push(
      `CREATE TABLE IF NOT EXISTS wallets ( 
        id integer primary key not null, 
        name text not null, 
        mnemonic text unique not null, 
        derivation text default "m/44'/145'/0'", 
        date_created default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        key_viewed text, 
        key_verified text, 
        balance int default 0
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS blockchain (
        blockhash text primary key,
        height int not null,
        header text not null
      );`
    );

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

    query.push(
      `CREATE TABLE IF NOT EXISTS transactions (
        txid text primary key not null, 
        time_seen default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        hex text,
        size int,
        blockhash text,
        time int,
        blocktime int
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS address_transactions (
        txid text primary key not null,
        height int not null,
        time text default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        time_seen default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
        address text not null,
        amount int,
        fiat_amount text
      );`
    );

    query.push(
      `CREATE TABLE IF NOT EXISTS address_utxos (
        wallet_id int not null,
        address text not null,
        txid text not null,
        tx_pos int not null,
        amount int not null
      );`
    );

    query.push(
      `CREATE TRIGGER IF NOT EXISTS balance_update AFTER UPDATE ON addresses
        BEGIN
          UPDATE wallets SET 
            balance=(
              SELECT SUM(balance) FROM addresses 
              WHERE wallet_id=NEW.wallet_id
            ) WHERE id=NEW.wallet_id
          ;
        END
      ;`
    );

    query.push("PRAGMA user_version = 1;");

    return query.join("");
  },

  function migrate_v1() {
    const query = [];

    // add prefix field to addresses
    query.push(
      `ALTER TABLE addresses ADD COLUMN
        prefix text CHECK(prefix IN ("bitcoincash", "bchtest", "bchreg")) default "bitcoincash";`
    );

    // add memo fields to address-related tables
    query.push(
      `ALTER TABLE addresses ADD COLUMN
        memo text default null;`,
      `ALTER TABLE address_transactions ADD COLUMN
        memo text default null;`,
      `ALTER TABLE address_utxos ADD COLUMN
        memo text default null;`
    );

    query.push("DROP TRIGGER IF EXISTS balance_update;");

    // recreate wallet table:
    // add bip32 passphrase field to wallets
    // update unique constraints
    // reset default derivation path
    // recreate balance_update trigger
    query.push(
      `
      PRAGMA foreign_keys=OFF;
      BEGIN TRANSACTION;
        DROP TABLE IF EXISTS wallets_new;
        CREATE TABLE wallets_new ( 
          id integer primary key not null, 
          name text not null, 
          mnemonic text not null, 
          passphrase text default "",
          derivation text default "${DEFAULT_DERIVATION_PATH}", 
          date_created default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
          key_viewed text, 
          key_verified text, 
          balance int default 0,
          UNIQUE(mnemonic, passphrase, derivation)
        );

        INSERT INTO wallets_new (
          id,
          name, 
          mnemonic, 
          derivation,
          date_created,
          key_viewed,
          key_verified,
          balance,
          passphrase
        ) 
        SELECT 
          wallets.id,
          wallets.name, 
          wallets.mnemonic,
          wallets.derivation,
          wallets.date_created, 
          wallets.key_viewed,   
          wallets.key_verified, 
          wallets.balance,
          ""
        FROM wallets;

        DROP TABLE wallets;
        ALTER TABLE 'wallets_new' RENAME TO 'wallets';
        PRAGMA foreign_key_check;
      COMMIT;
      PRAGMA foreign_keys=ON;
      `
    );

    query.push(
      `CREATE TRIGGER IF NOT EXISTS balance_update AFTER UPDATE ON addresses
        BEGIN
          UPDATE wallets SET 
            balance=(
              SELECT SUM(balance) FROM addresses 
              WHERE wallet_id=NEW.wallet_id
              AND prefix=NEW.prefix
            ) WHERE id=NEW.wallet_id
          ;
        END
      ;`
    );

    query.push("PRAGMA user_version = 2;");

    return query.join("");
  },

  function migrate_v2() {
    const query = [];

    // remove primary key from address_transactions
    // add fiat unit (to avoid stupid conversion bugs that nobody has noticed yet)
    query.push(
      `
      PRAGMA foreign_keys=OFF;
      BEGIN TRANSACTION;
        DROP TABLE IF EXISTS address_transactions_new;
        CREATE TABLE address_transactions_new ( 
          txid text not null,
          height int not null,
          time text default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
          time_seen default ( strftime('%Y-%m-%dT%H:%M:%SZ') ),
          address text not null,
          amount int,
          fiat_amount text,
          fiat_currency text,
          wallet_id int,
          UNIQUE(txid, wallet_id)
        );

        INSERT INTO address_transactions_new (
          txid,
          height, 
          time, 
          time_seen,
          address,
          amount,
          fiat_amount
        ) 
        SELECT 
          address_transactions.txid,
          address_transactions.height, 
          address_transactions.time,
          address_transactions.time_seen,
          address_transactions.address, 
          address_transactions.amount,   
          address_transactions.fiat_amount
        FROM address_transactions;

        DROP TABLE address_transactions;
        ALTER TABLE 'address_transactions_new' RENAME TO 'address_transactions';
        PRAGMA foreign_key_check;
      COMMIT;
      PRAGMA foreign_keys=ON;
      `
    );

    // drop transaction and block hex data, as it is now written to filesystem directly
    query.push("ALTER TABLE transactions DROP COLUMN hex;");
    query.push("ALTER TABLE blockchain DROP COLUMN header;");

    query.push("PRAGMA user_version = 3;");

    return query.join("");
  },

  function migrate_v3() {
    const query = [];

    // add prefix field to address_utxos
    query.push(
      `ALTER TABLE address_utxos ADD COLUMN
        prefix text CHECK(prefix IN ("bitcoincash", "bchtest", "bchreg")) default "bitcoincash";`
    );

    query.push("PRAGMA user_version = 4;");

    return query.join("");
  },
  function migrate_v4() {
    const query = [];

    // add memo field back to address_transactions...
    query.push(
      `ALTER TABLE address_transactions ADD COLUMN
        memo text default null;`
    );

    query.push("PRAGMA user_version = 5;");

    return query.join("");
  },
  function migrate_v5() {
    const query = [];

    query.push(
      `CREATE TRIGGER IF NOT EXISTS utxo_balance_delete AFTER DELETE ON address_utxos
        BEGIN
          UPDATE addresses SET 
            balance=(
              SELECT COALESCE(SUM(amount), 0) FROM address_utxos
              WHERE address=OLD.address
            ) WHERE address=OLD.address
          ;
        END
      ;`
    );

    query.push(
      `CREATE TRIGGER IF NOT EXISTS utxo_balance_insert AFTER INSERT ON address_utxos
        BEGIN
          UPDATE addresses SET 
            balance=(
              SELECT SUM(amount) FROM address_utxos
              WHERE address=NEW.address
            ) WHERE address=NEW.address
          ;
        END
      ;`
    );

    query.push("PRAGMA user_version = 6;");

    return query.join("");
  },
  /* function migrate_v6() {
    const query = [];

    query.push("PRAGMA user_version = 0;");

    return query.join("");
  },*/
];

// run_migrations: run all migrations in migrations array sequentially
// Starts with index indicated in PRAGMA user_version
export function run_migrations(db) {
  Log.time("dbMigrate");
  //db.run("PRAGMA user_version = 0;");
  const DB_VERSION = db.exec("PRAGMA user_version")[0].values[0][0];
  Log.log("DB_VERSION", DB_VERSION, migrations.length);
  for (let version = DB_VERSION; version < migrations.length; version += 1) {
    Log.log("DB_MIGRATE", `${version}/${migrations.length}`, DB_VERSION);
    try {
      //Log.debug(migrations[version]());
      db.run(migrations[version]());
    } catch (e) {
      Log.error("error during migrations", e);
    }
  }
  Log.timeEnd("dbMigrate");
}
