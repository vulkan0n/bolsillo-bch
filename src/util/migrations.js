// migrations.js: handle sqlite database schema updates

// run_migrations: run all migrations in migrations array sequentially
export function run_migrations(db) {
  const DB_VERSION = db.exec("PRAGMA user_version")[0].values[0][0];
  console.log("DB_VERSION", DB_VERSION, migrations.length);
  for (
    let version = DB_VERSION;
    version < migrations.length;
    version = version + 1
  ) {
    console.log("DB_VERSION", `${DB_VERSION}/${migrations.length}`, version);
    db.run(migrations[version]());
  }
}

// functions in this migrations will be executed sequentially
// each entry should represent a new db version
const migrations = [
  function migrate_v0() {
    console.log("migrate_v0");
    const query = [];

    query.push("PRAGMA user_version = 0;");

    query.push("DROP TABLE IF EXISTS wallets;");
    query.push("DROP TABLE IF EXISTS blockchain;");
    query.push("DROP TABLE IF EXISTS addresses;");
    query.push("DROP TABLE IF EXISTS transactions;");
    query.push("DROP TABLE IF EXISTS address_transactions;");
    query.push("DROP TABLE IF EXISTS address_utxos;");
    query.push("DROP TRIGGER IF EXISTS balance_update;");

    query.push(
      `CREATE TABLE IF NOT EXISTS wallets ( 
        id integer primary key not null, 
        name text not null, 
        mnemonic text unique not null, 
        derivation text default "m/44'/0'/0'", 
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

  /* function migrate_v1() {
    console.log("migrate_v1");
    let query = [];

    query.push("PRAGMA user_version = 0;");

    return query.join("");
  }, */
];
