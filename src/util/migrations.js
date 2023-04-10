// migrations.js: handle sqlite database schema updates

export function run_migrations(db) {
  const DB_VERSION = db.exec("PRAGMA user_version")[0].values[0][0];

  for (
    let version = DB_VERSION;
    version < migrations.length;
    version = version + 1
  ) {
    console.log("DB_VERSION", `${DB_VERSION}/${migrations.length-1}`, version);
    db.run(migrations[version]());
  }
}

const migrations = [
  function migrate_v0() {
    const query = [];

    //*
    //query.push("DROP TABLE IF EXISTS wallets;");
    query.push("DROP TABLE IF EXISTS addresses;");
    query.push("DROP TABLE IF EXISTS address_history;");
    query.push("DROP TABLE IF EXISTS transactions;");
    query.push("DROP TABLE IF EXISTS vins;");
    query.push("DROP TABLE IF EXISTS utxos;");
    query.push("DROP TRIGGER IF EXISTS balance_update;");
    /**/

    query.push("PRAGMA user_version = 0;");

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
    query.push(
      `CREATE TABLE IF NOT EXISTS vins (
      txid text not null,
      prevtx text not null,
      vout int not null,
      scriptSig text not null
    );`
    );
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

    return query.join("");
  },
];
