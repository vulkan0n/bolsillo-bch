import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
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

    console.log("getTransactionHistory", wallet_id, result);
    return result;
  }

  async function calculateAndUpdateTransactionAmount(tx) {
    console.log("calculating tx amount:", tx.txid);

    const Electrum = new ElectrumService();
    const AddressManager = new AddressManagerService(wallet_id);
    const TransactionManager = new TransactionManagerService();

    function isMyUtxo(utxo) {
      const myAddresses = [
        ...AddressManager.getReceiveAddresses().map((a) => a.address),
        ...AddressManager.getChangeAddresses().map((a) => a.address),
      ];

      if (utxo.value === 0) {
        console.log("utxo value === 0", utxo, utxo.tx_hash);
        return false;
      }

      const isMine =
        utxo.scriptPubKey.addresses.findIndex((address) => {
          return myAddresses.includes(address);
        }) > -1;

      return isMine;
    }

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((out) => isMyUtxo(out));
    const receivedAmount = myOutputs.reduce(
      (sum, cur) => sum.plus(bchToSats(cur.value)),
      new Decimal(0)
    );

    // any inputs that belong to us are outgoing money
    const myInputs = (
      await Promise.all(
        tx.vin.map(async (vin) => {
          const lookupTx = await Electrum.requestTransaction(vin.txid);
          return lookupTx.vout.filter((out) => isMyUtxo(out));
        })
      )
    ).flat();

    const sentAmount = myInputs.reduce(
      (sum, cur) => sum.plus(bchToSats(cur.value)),
      new Decimal(0)
    );

    const amount = receivedAmount - sentAmount;

    console.log(
      "calculateAndUpdateTransactionAmount",
      tx.txid,
      `received: ${receivedAmount}`,
      `sent: ${sentAmount}`,
      `total: ${amount}`
    );

    db.run(
      `UPDATE address_transactions SET amount="${amount}" WHERE txid="${tx.txid}"`
    );

    saveDatabase();
  }
}
