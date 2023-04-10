import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";

function TransactionService(id) {
  const wallet_id = id ? id : selectActiveWallet(store.getState()).id;

  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerTransaction,
    getTransactionsByAddress,
    getTransactionByHash,
  };

  function registerTransaction(tx, address) {
    console.log("registerTransaction", tx, address);

    function isMyUtxo(utxo) {
      const addressManager = new AddressManagerService();
      const myAddresses = [
        ...addressManager.getReceiveAddresses(),
        ...addressManager.getChangeAddresses(),
      ];

      return (
        utxo.scriptPubKey.addresses.findIndex((address) =>
          myAddresses.includes(address)
        ) > -1
      );
    }

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((utxo) => isMyUtxo(utxo));
    const receivedAmount = myOutputs.reduce((sum, cur) => sum + cur.amount, 0);

    // any inputs that belong to us are outgoing money
    const Electrum = new ElectrumService();
    const myInputs = tx.vin.filter(async (utxo) => {
      let lookupTx = getTransactionByHash(utxo.txid);

      // the only time the input is ours and this is null is when we don't have
      // full tx history available
      if (lookupTx === null) {
        lookupTx = await Electrum.requestTransaction(utxo.txid);
      }

      return lookupTx.vout.filter((input) => isMyUtxo(input)).length > 0;
    });
    const sentAmount = myInputs.reduce((sum, cur) => sum + cur.amount, 0);

    console.log(
      "registerTransaction 2",
      `received: ${receivedAmount}`,
      `sent: ${sentAmount}`
    );

    const amount = receivedAmount - sentAmount;

    db.run(
      `INSERT OR REPLACE INTO transactions (txid, address, wallet_id, hex, amount) VALUES ("${tx.txid}", "${address}", "${wallet_id}","${tx.hex}", "${amount}")`
    );

    saveDatabase();
  }

  function getTransactionsByAddress(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE address="${address}"`)
    );

    return result;
  }

  function getTransactionByHash(tx_hash) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    return result;
  }
}

export default TransactionService;

/*
 * {
 *  vin: [
 *      { sequence: 0, txid: "<txhash>", vout: 12, scriptSig: { ... } }
 *      ...
 *  ]
 *}
 */
