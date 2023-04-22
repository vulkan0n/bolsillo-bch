import DatabaseService from "@/services/DatabaseService";
import TransactionManagerService from "@/services/TransactionManagerService";

export default function UxtoManagerService(wallet_id) {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getWalletUtxos,
    getAddressUtxos,
    getUtxosByAmount,
    discardUtxo,
  };

  function registerUtxo(address, utxo) {
    db.run(
      `INSERT INTO address_utxos (
        wallet_id,
        address,
        txid,
        outpoint,
        amount
      ) VALUES (
        "${wallet_id}",
        "${address}",
        "${utxo.tx_hash}",
        "${utxo.n}",
        "${utxo.amount}"
      )`
    );

    saveDatabase();
  }

  function getWalletUtxos() {
    const result = resultToJson(
      db.exec(`SELECT * FROM address_utxos WHERE wallet_id="${wallet_id}"`)
    );

    return result;
  }

  function getAddressUtxos(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM address_utxos WHERE address="${address}"`)
    );
    return result;
  }

  function getUtxosByAmount(amount, wallet_id) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM address_utxos WHERE amount <= "${amount}" AND wallet_id="${wallet_id} ORDER BY amount DESC"`
      )
    );

    return result;
  }

  function discardUtxo(utxo) {
    db.run(
      `DELETE FROM address_utxos WHERE txid="${utxo.tx_hash}" AND outpoint="${utxo.n}"`
    );

    saveDatabase();
  }
}
