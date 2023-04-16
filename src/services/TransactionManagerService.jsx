import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import ElectrumService from "@/services/ElectrumService";

import { store } from "@/redux";
import { selectActiveWallet } from "@/redux/wallet";

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerTransaction,
    getTransactionByHash,
    getTransactionsByAddress,
    getTransactionHistory,
  };

  function registerTransaction(tx) {
    db.run(
      `INSERT OR IGNORE INTO transactions (
        txid,
        hex,
        size,
        blockhash,
        time,
        blocktime,
        locktime,
        version,
        wallet_id
      )
      VALUES (
        "${tx.txid}",
        "${tx.hex}",
        "${tx.size}",
        "${tx.blockhash}",
        "${tx.time}",
        "${tx.blocktime}",
        "${tx.locktime}",
        "${tx.version}",
        "${tx.wallet_id}"
      );`
    );

    db.run(
      `UPDATE transactions SET
        ${tx.wallet_id ? `wallet_id="${tx.wallet_id}",` : ""}
        hex="${tx.hex}",
        size="${tx.size}",
        blockhash="${tx.blockhash}",
        time="${tx.time ? tx.time : Math.floor(Date.now() / 1000)}",
        blocktime="${tx.blocktime}",
        locktime="${tx.locktime}",
        version="${tx.version}"
      WHERE txid="${tx.txid}";`
    );

    console.log("registerTransaction vin", tx.vin);

    tx.vin.forEach((vin) => {
      db.run(
        `INSERT INTO vins (
          txid,
          prevtx,
          vout,
          scriptSig,
          sequence
        ) VALUES (
          "${tx.txid}",
          "${vin.txid}",
          "${vin.vout}",
          "${vin.scriptSig.hex}",
          "${vin.sequence}"
        );`
      );
    });

    saveDatabase();
  }

  function getTransactionByHash(tx_hash) {
    const txResult = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    if (txResult.length < 1) {
      return null;
    }

    const vin = resultToJson(
      db.exec(`SELECT * FROM vins WHERE txid="${tx_hash}";`)
    );

    const result = { ...txResult[0], vin };

    console.log("getTransactionByHash", tx_hash, result);
    return result;
  }

  function getTransactionsByAddress(address) {
    const confirmed = resultToJson(
      db.exec(
        `SELECT * FROM transactions 
          WHERE address="${address}"
          AND height > 0
          ORDER BY height, block_pos
        ;`
      )
    );

    const unconfirmed = resultToJson(
      db.exec(
        `SELECT * FROM transactions
          WHERE address="${address}"
          AND height <= 0
        ;`
      )
    );

    console.log("getTransactionsByAddress", confirmed, unconfirmed, address);
    return { confirmed, unconfirmed };
  }

  function getTransactionHistory(wallet_id) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM transactions WHERE wallet_id="${wallet_id}" ORDER BY time,height,time_seen DESC`
      )
    );

    console.log("getTransactionHistory", wallet_id, result);
    return result;
  }
}

/*
 * {
 *  vin: [
 *      { sequence: 0, txid: "<txhash>", vout: 12, scriptSig: { ... } }
 *      ...
 *  ]
 *}
 */

/*
    function isMyUtxo(utxo) {
      const AddressManager = new AddressManagerService(wallet_id);
      const myAddresses = [
        ...AddressManager.getReceiveAddresses(),
        ...AddressManager.getChangeAddresses(),
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
*/
