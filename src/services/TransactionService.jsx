import DatabaseService from "@/services/DatabaseService";
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

    const addressManager = new AddressManagerService();
    const receiveAddresses = addressManager.getReceiveAddresses();
    const changeAddresses = addressManager.getChangeAddresses();

    // if any outputs belong to a receiveAddress, we must have given someone a receive
    // therefore this is an incoming transaction
    const myOutputs = tx.vout.filter((utxo) => {
      return (
        utxo.scriptPubKey.addresses.findIndex((address) =>
          receiveAddresses.includes(address)
        ) > -1
      );
    });

    const amount = myOutputs.reduce((sum, cur) => sum + cur.amount);

    /*
    db.run(
      `INSERT INTO transactions (tx_hash, address, wallet_id, hex) VALUES ("${tx.hash}", "${address}", "${wallet_id}","${tx.hex}")`
    );

    saveDatabase();
    */
  }

  function getTransactionsByAddress(address) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE address="${address}"`)
    );

    return result;
  }

  function getTransactionByHash(tx_hash) {
    return null;

    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE tx_hash="${tx_hash}"`)
    );

    return result;
  }
}

export default TransactionService;
