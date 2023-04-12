import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";

import { bchToSats } from "@/util/sats";

export default function UtxoService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getUtxosByAddress,
  };

  function registerUtxo(utxo, address) {
    console.log("registerUtxo", utxo, address);

    db.run(
      `INSERT INTO utxos (
        tx_hash, 
        tx_pos, 
        address, 
        amount, 
        height
      ) VALUES (
        "${utxo.tx_hash}", 
        "${utxo.tx_pos}", 
        "${address}", 
        "${utxo.value}",
        "${utxo.height}"
      )`
    );

    db.run(
      `UPDATE transactions SET
        block_pos="${utxo.block_pos}"
       WHERE txid="${utxo.tx_hash}";`
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
