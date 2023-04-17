import DatabaseService from "@/services/DatabaseService";

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerTransaction,
    getTransactionByHash,
  };

  function registerTransaction(tx) {
    db.run(
      `INSERT INTO transactions (
        txid,
        hex,
        size,
        blockhash,
        time,
        blocktime
      )
      VALUES (
        "${tx.txid}",
        "${tx.hex}",
        "${tx.size}",
        "${tx.blockhash}",
        "${tx.time}",
        "${tx.blocktime}"
      ) ON CONFLICT DO 
        UPDATE SET
          hex="${tx.hex}",
          size="${tx.size}",
          blockhash="${tx.blockhash}",
          time="${tx.time}",
          blocktime="${tx.blocktime}"
       WHERE txid="${tx.txid}";`
    );

    db.run(
      `UPDATE address_transactions SET time=${
        tx.time ? `datetime("${tx.time}", "unixepoch")` : "datetime('now')"
      } WHERE txid="${tx.txid}"`
    );

    saveDatabase();
  }

  function getTransactionByHash(tx_hash) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    //console.log("getTransactionByHash", tx_hash, result[0]);
    return result.length > 0 ? result[0] : null;
  }
}
