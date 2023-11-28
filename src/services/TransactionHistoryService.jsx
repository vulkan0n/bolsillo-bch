import { Decimal } from "decimal.js";
import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService from "@/services/TransactionManagerService";
import CurrencyService from "@/services/CurrencyService";

export default function TransactionHistoryService(wallet) {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  const AddressManager = AddressManagerService(wallet);
  const myAddresses = [
    ...AddressManager.getReceiveAddresses().map((a) => a.address),
    ...AddressManager.getChangeAddresses().map((a) => a.address),
  ];

  return {
    getTransactionHistory,
    calculateAndUpdateTransactionAmount,
  };

  function getTransactionHistory() {
    console.log("getTransactionHistory", wallet.id);
    const result = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions 
          WHERE wallet_id="${wallet.id}"
          OR address IN (
            SELECT address FROM addresses WHERE wallet_id="${wallet.id}"
          ) ORDER BY height DESC, time_seen DESC, time DESC
        `
      )
    );

    result.sort((a, b) => {
      if (a.height <= 0) {
        return -1;
      }

      if (b.height <= 0) {
        return 1;
      }

      return 0;
    });

    return result;
  }

  async function calculateAndUpdateTransactionAmount(tx, fiatCurrency) {
    const TransactionManager = TransactionManagerService();

    const isMyUtxo = (utxo) => {
      if (utxo.value === 0) {
        // OP_RETURN
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
            tx.vin.findIndex(
              (vin) => vin.txid === t.txid && vin.vout === out.n
            ) > -1
        )
      )
      .flat();

    // any inputs that belong to us are outgoing money
    const myInputs = vinOuts.filter((out) => isMyUtxo(out));

    // any outputs that belong to us are incoming money
    const myOutputs = tx.vout.filter((out) => isMyUtxo(out));

    // sum reducer function
    const sumReducer = (sum, cur) => sum.plus(cur.value);

    const receivedAmount = myOutputs.reduce(sumReducer, new Decimal(0));
    const sentAmount = myInputs.reduce(sumReducer, new Decimal(0));

    // TODO: totalOutput - amount = fee
    const amount = receivedAmount.minus(sentAmount);

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
      `UPDATE address_transactions SET 
        amount="${amount}", 
        fiat_amount="${CurrencyService(fiatCurrency).satsToFiat(amount) || 0}", 
        fiat_currency="${fiatCurrency}",
        time=${
          tx.time !== "null"
            ? `strftime('%Y-%m-%dT%H:%M:%SZ', "${tx.time}", "unixepoch")`
            : `strftime('%Y-%m-%dT%H:%M:%SZ')`
        },
        wallet_id="${wallet.id}"
      WHERE txid="${tx.txid}" AND (wallet_id="${wallet.id}" OR wallet_id=null)`
    );

    saveDatabase();
  }
}
