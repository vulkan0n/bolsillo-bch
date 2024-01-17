import Logger from "js-logger";
import { Decimal } from "decimal.js";
import DatabaseService from "@/services/DatabaseService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService, {
  TransactionEntity,
} from "@/services/TransactionManagerService";
import CurrencyService from "@/services/CurrencyService";

import { WalletEntity } from "@/services/WalletManagerService";

class TransactionHistoryNotExistsError extends Error {
  constructor(tx_hash, wallet_id) {
    super(`No address_transactions for ${tx_hash} and wallet ${wallet_id}`);
  }
}

export default function TransactionHistoryService(
  wallet: WalletEntity,
  fiatCurrency
) {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  const AddressManager = AddressManagerService(wallet);
  const myAddresses = [
    ...AddressManager.getReceiveAddresses().map((a) => a.address),
    ...AddressManager.getChangeAddresses().map((a) => a.address),
  ];

  return {
    resolveTransactionHistory,
    calculateTxAmount,
    setTransactionMemo,
  };

  async function resolveTransactionHistory(start: number = 0) {
    Logger.debug("resolveTransactionHistory");

    // get all transactions that are registered with addresses
    const address_transactions = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions 
          WHERE wallet_id="${wallet.id}"
          OR address IN (
            SELECT address FROM addresses WHERE wallet_id="${wallet.id}"
          ) ORDER BY height DESC, time DESC, time_seen DESC
          LIMIT 100 OFFSET ${start};
        `
      )
    );

    // put unconfirmed transactions in front
    address_transactions.sort((a, b) => {
      if (a.height <= 0) {
        return -1;
      }

      if (b.height <= 0) {
        return 1;
      }

      return 0;
    });

    // resolve amounts for transactions that don't have them
    const tx_hashes = address_transactions.map((at) => at.txid);

    Logger.debug("resolveTransactionHistory awaiting", tx_hashes.length);
    const transactions = (
      await Promise.all(
        tx_hashes.map(async (tx_hash) => {
          try {
            const tx = await resolveTransactionAmount(tx_hash);
            return tx;
          } catch (e) {
            await TransactionManagerService().deleteTransaction(tx_hash);
            return null;
          }
        })
      )
    ).filter((tx) => tx !== null);

    return transactions;
  }

  async function resolveTransactionAmount(tx_hash) {
    try {
      const addressTx = getAddressTransaction(tx_hash);

      if (addressTx.amount === null) {
        throw new TransactionHistoryNotExistsError(tx_hash, wallet.id);
      }

      return addressTx;
    } catch (e) {
      const tx = await TransactionManagerService().resolveTransaction(tx_hash);
      const amount = await calculateTxAmount(tx);
      const updatedAddressTx = updateTxAmount(tx.txid, amount);
      return updatedAddressTx;
    }
  }

  async function calculateTxAmount(tx: TransactionEntity) {
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
    const amount = receivedAmount.minus(sentAmount).toNumber();

    return amount;
  }

  function setTransactionMemo(tx_hash: string, memo: string) {
    db.run(`UPDATE transactions SET memo="${memo}" WHERE txid=${tx_hash}`);
    saveDatabase();
  }

  function updateTxAmount(tx_hash: string, amount: number) {
    const fiat_amount = CurrencyService(fiatCurrency).satsToFiat(amount);

    const result = resultToJson(
      db.exec(
        `UPDATE address_transactions SET 
          amount="${amount}", 
          fiat_amount="${fiat_amount}",
          fiat_currency="${fiatCurrency}",
          wallet_id="${wallet.id}",
          time=(SELECT time FROM transactions WHERE txid="${tx_hash}")
        WHERE txid="${tx_hash}" AND wallet_id="${wallet.id}"
        RETURNING *;`
      )
    )[0];
    Logger.debug("updateTxAmount", tx_hash, result);

    saveDatabase();

    return result;
  }

  function getAddressTransaction(tx_hash: string) {
    const result = resultToJson(
      db.exec(
        `SELECT * FROM address_transactions WHERE txid="${tx_hash}" AND wallet_id="${wallet.id}";`
      )
    );

    if (result.length === 0) {
      throw new TransactionHistoryNotExistsError(tx_hash, wallet.id);
    }

    //Logger.debug("getAddressTransaction", tx_hash, result);
    return result[0];
  }
}
