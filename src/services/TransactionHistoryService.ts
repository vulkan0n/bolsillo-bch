import { Decimal } from "decimal.js";
import { DateTime } from "luxon";
import LogService from "@/services/LogService";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import AddressManagerService from "@/services/AddressManagerService";
import TransactionManagerService, {
  TransactionEntity,
} from "@/services/TransactionManagerService";
import CurrencyService from "@/services/CurrencyService";
import TokenManagerService from "@/services/TokenManagerService";
import { binToHex } from "@/util/hex";

const Log = LogService("TransactionHistoryService");

class TransactionHistoryNotExistsError extends Error {
  constructor(tx_hash, walletHash) {
    super(`No address_transactions for ${tx_hash} and wallet ${walletHash}`);
  }
}

export default function TransactionHistoryService(
  walletHash: string,
  fiatCurrency
) {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();
  const walletDb = Database.getWalletDatabase(walletHash);

  const AddressManager = AddressManagerService(walletHash);
  const myAddresses = [
    ...AddressManager.getReceiveAddresses(),
    ...AddressManager.getChangeAddresses(),
  ].map((a) => a.address);
  myAddresses.push(
    ...myAddresses.map((a) => AddressManager.getTokenAddress(a))
  );

  const TokenManager = TokenManagerService(walletHash);

  return {
    resolveTransactionHistory,
    calculateTxAmount,
    setTransactionMemo,
    getTransactionMemo,
  };

  function getTransactionHistory(start: number = 0) {
    // get all transactions that are registered with addresses
    const address_transactions_confirmed = walletDb.exec(
      `SELECT * FROM address_transactions
          WHERE height > 0
          GROUP BY txid
          ORDER BY height DESC, time DESC, time_seen DESC
          LIMIT 100 OFFSET ${start};
        `
    );

    const address_transactions_unconfirmed = walletDb.exec(
      `SELECT * FROM address_transactions 
          WHERE height <= 0
          GROUP BY txid
          ORDER BY height ASC, time DESC, time_seen DESC
          LIMIT 100 OFFSET ${start};
        `
    );

    const address_transactions = address_transactions_unconfirmed
      .concat(address_transactions_confirmed)
      .map((at) => {
        let txTime = at.time;
        if (at.height <= 0) {
          txTime = DateTime.fromISO(at.time_seen).toSeconds();
        }
        return { ...at, time: txTime };
      });

    return address_transactions;
  }

  async function resolveTransactionHistory(start: number = 0) {
    //Log.debug("resolveTransactionHistory");
    const address_transactions = getTransactionHistory(start);

    if (!ElectrumService().getIsConnected()) {
      return address_transactions;
    }

    // resolve amounts for transactions that don't have them
    const tx_hashes = address_transactions.map((at) => at.txid);

    Log.debug("resolveTransactionHistory awaiting", tx_hashes.length);
    const txHistory = (
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

    return txHistory;
  }

  async function resolveTransactionAmount(tx_hash) {
    try {
      const addressTx = getAddressTransaction(tx_hash);

      if (addressTx.amount === null || addressTx.amount === 0) {
        throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
      }

      if (addressTx.height <= 0) {
        throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
      }

      return addressTx;
    } catch (e) {
      const tx = await TransactionManagerService().resolveTransaction(tx_hash);
      const { amount, tokens } = await calculateTxAmount(tx);
      const updatedAddressTx = updateTxAmount(tx.txid, amount);
      await TokenManager.registerTokenHistory(tx.txid, tokens);
      return updatedAddressTx;
    }
  }

  async function calculateTxAmount(tx: TransactionEntity) {
    const TransactionManager = TransactionManagerService();

    const isMyUtxo = (utxo) => {
      if (utxo.scriptPubKey.asm.startsWith("OP_RETURN")) {
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
    const vinTxes = (
      await Promise.all(
        tx.vin.map((vin) => TransactionManager.resolveTransaction(vin.txid))
      )
    ).reduce(
      // de-duplicate resolved transactions
      (txes, vtx) =>
        !txes.find((t) => t.txid === vtx.txid) ? [...txes, vtx] : txes,
      [] as Array<TransactionEntity>
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
    const amountReducer = (sum, cur) => sum.plus(cur.value);
    const tokenReducer = (tokens, cur) => {
      const result = tokens;

      if (!cur.token) {
        return result;
      }

      const category = binToHex(cur.token.category);

      if (!result[category]) {
        result[category] = {
          amount: "0",
          nftAmount: 0,
        };
      }

      result[category].amount = new Decimal(tokens[category].amount)
        .plus(new Decimal(cur.token.amount.toString()))
        .toString();

      result[category].nftAmount = cur.token.nft
        ? tokens[category].nftAmount + 1
        : 0;

      return result;
    };

    const receivedAmount = myOutputs.reduce(amountReducer, new Decimal(0));
    const sentAmount = myInputs.reduce(amountReducer, new Decimal(0));

    const receivedTokens = myOutputs.reduce(tokenReducer, {});
    const sentTokens = myInputs.reduce(tokenReducer, {});

    // TODO: totalOutput - amount = fee
    const amount = receivedAmount.minus(sentAmount).toNumber();

    // get token counts
    // `Set` automatically de-duplicate entries by enforcing uniqueness
    const uniqueCategories: Array<string> = [
      ...new Set([...Object.keys(receivedTokens), ...Object.keys(sentTokens)]),
    ];

    const tokens = uniqueCategories.map((category) => {
      if (!receivedTokens[category]) {
        receivedTokens[category] = {
          amount: "0",
          nftAmount: 0,
        };
      }

      if (!sentTokens[category]) {
        sentTokens[category] = {
          amount: "0",
          nftAmount: 0,
        };
      }

      const { amount: receivedTokenAmount, nftAmount: receivedNftAmount } =
        receivedTokens[category];
      const { amount: sentTokenAmount, nftAmount: sentNftAmount } =
        sentTokens[category];

      return {
        category,
        amount: new Decimal(receivedTokenAmount)
          .minus(new Decimal(sentTokenAmount))
          .toString(),
        nftAmount: receivedNftAmount - sentNftAmount,
      };
    });

    return { amount, tokens };
  }

  function setTransactionMemo(tx_hash: string, memo: string): void {
    walletDb.run(
      `UPDATE address_transactions SET memo=?
        WHERE txid="${tx_hash}";`,
      [memo]
    );

    walletDb.run(
      `UPDATE address_utxos SET memo=?
        WHERE txid="${tx_hash}";`,
      [memo]
    );

    Database.flushDatabase(walletHash);
  }

  function getTransactionMemo(tx_hash: string): string {
    const result = walletDb.exec(
      `SELECT memo FROM address_transactions WHERE txid="${tx_hash}"`
    );

    const memo = result.length > 0 ? result[0].memo : "";
    return memo;
  }

  function updateTxAmount(tx_hash: string, amount: number) {
    //Log.debug("updateTxAmount", tx_hash);
    const fiat_amount = CurrencyService(fiatCurrency).satsToFiat(amount);

    const tx = APP_DB.exec(
      `SELECT time, height FROM transactions WHERE txid="${tx_hash}"`
    )[0];

    const result = walletDb.exec(
      `UPDATE address_transactions SET 
          amount=?,
          fiat_amount=?,
          fiat_currency=?,
          time=?,
          height=?
        WHERE txid="${tx_hash}"
        RETURNING *;`,
      [amount, fiat_amount, fiatCurrency, tx.time, tx.height]
    )[0];
    //Log.debug("updateTxAmount", tx_hash, result);

    return result;
  }

  function getAddressTransaction(tx_hash: string) {
    const result = walletDb.exec(
      "SELECT * FROM address_transactions WHERE txid=?;",
      [tx_hash]
    );

    if (result.length === 0) {
      throw new TransactionHistoryNotExistsError(tx_hash, walletHash);
    }

    //Log.debug("getAddressTransaction", tx_hash, result);
    return result[0];
  }
}
