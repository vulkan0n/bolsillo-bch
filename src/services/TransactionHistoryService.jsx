import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import { bchToSats } from "@/util/sats";
import { Decimal } from "decimal.js";

export default function TransactionHistoryService(wallet_id) {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    getTransactionHistory,
    calculateAndUpdateTransactionAmount,
  };

  function getTransactionHistory() {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions WHERE address IN (SELECT address FROM addresses WHERE wallet_id="${wallet_id}") ORDER BY time DESC, time_seen DESC, height ASC`
      )
    );

    // console.log("getTransactionHistory", wallet_id, result);
    return result;
  }

  async function calculateAndUpdateTransactionAmount(tx) {
    const AddressManager = new AddressManagerService(wallet_id);
    const TransactionManager = new TransactionManagerService();

    const myAddresses = [
      ...AddressManager.getReceiveAddresses().map((a) => a.address),
      ...AddressManager.getChangeAddresses().map((a) => a.address),
    ];

    const isMyUtxo = (utxo) => {
      if (utxo.value === 0) {
        //console.log("utxo value === 0; OP_RETURN?", utxo, utxo.tx_hash);
        return false;
      }

      const isMine =
        utxo.scriptPubKey.addresses.findIndex((address) => {
          return myAddresses.includes(address);
        }) > -1;

      return isMine;
    };

    // resolve vins to real txos
    const vinTxes = await Promise.all(
      tx.vin.map((vin) => TransactionManager.resolveTransaction(vin.txid))
    );

    // for each input tx, get outputs.
    // for each output, include in result if vin and out match
    const vinOuts = vinTxes
      .map((t) =>
        t.vout.filter(
          (out) =>
            tx.vin.findIndex((vin) => vin.txid == t.txid && vin.vout == out.n) >
            -1
        )
      )
      .flat();

    // any inputs that belong to us are outgoing money
    const myInputs = vinOuts.filter((out) => isMyUtxo(out));

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((out) => isMyUtxo(out));

    // sum reducer function
    const sumOutputs = (sum, cur) => sum.plus(cur.value);

    const receivedAmount = myOutputs.reduce(sumOutputs, new Decimal(0));
    const sentAmount = myInputs.reduce(sumOutputs, new Decimal(0));

    // TODO: totalOutput - amount = fee
    const amount = receivedAmount - sentAmount;

    /*
    console.log(
      "calculateAndUpdateTransactionAmount",
      tx.txid,
      `received: ${receivedAmount}`,
      `sent: ${sentAmount}`,
      `total: ${amount}`,
      myInputs,
      myOutputs
    );
    */

    db.run(
      `UPDATE address_transactions SET amount="${amount}" WHERE txid="${tx.txid}"`
    );

    saveDatabase();
  }
}
