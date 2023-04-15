import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";

// UtxoManagerService: brokers interactions with UTXO database
export default function UtxoManagerService() {
  let wallet_id = 0;
  try {
    const wallet_id = selectActiveWallet(store.getState()).id;
  } catch (e) {
    console.warn(e);
  }

  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerUtxo,
    getUtxosByAddress,
    getUtxos,
  };

  // registerUtxos: insert a utxo into the database
  function registerUtxo(utxo, address) {
    console.log("registerUtxo", utxo, address);

    db.run(
      `INSERT INTO utxos (
        wallet_id,
        tx_hash, 
        tx_pos, 
        address, 
        amount, 
        height
      ) VALUES (
        "${wallet_id}",
        "${utxo.tx_hash}", 
        "${utxo.tx_pos}", 
        "${address}", 
        "${utxo.value}",
        "${utxo.height}"
      )`
    );

    db.run(
      `UPDATE transactions SET
        wallet_id="${wallet_id}",
        block_pos="${utxo.block_pos}"
       WHERE txid="${utxo.tx_hash}";`
    );

    saveDatabase();
  }

  // getUtxos: return all known utxos for this wallet
  function getUtxos() {
    const result = resultToJson(
      db.exec(`SELECT * FROM utxos WHERE wallet_id="${wallet_id}";`)
    );
    console.log("getUtxos", result);
    return result;
  }

  // getUtxosByAddress: get all utxos for an address
  function getUtxosByAddress(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM utxos WHERE address="${address}" AND spent="0"`)
    );

    return result;
  }
}
