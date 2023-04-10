import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";

export default function UtxoService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getUtxosByAddress,
  };

  function registerUtxo(utxo, address) {
    console.log("registerUtxo", utxo, address);

    db.run(
      `INSERT OR REPLACE INTO utxos (tx_hash, tx_pos, address, amount, height) VALUES ("${utxo.tx_hash}", "${utxo.tx_pos}", "${address}", "${utxo.value}","${utxo.height}")`
    );

    saveDatabase();
  }

  function getUtxosByAddress(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM utxos WHERE address="${address}" AND spent="0"`)
    );

    return result;
  }
}
