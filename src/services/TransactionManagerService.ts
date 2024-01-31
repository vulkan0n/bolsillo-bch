import Logger from "js-logger";
import { Filesystem, Directory, WriteFileResult } from "@capacitor/filesystem";
import { Decimal } from "decimal.js";
import {
  decodeTransaction,
  lockingBytecodeToCashAddress,
  TransactionCommon as LibauthTransaction,
} from "@bitauth/libauth";

import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import UtxoManagerService from "@/services/UtxoManagerService";
import { WalletEntity } from "@/services/WalletManagerService";

import { hexToBin, binToHex } from "@/util/hex";

export interface TransactionEntity {
  txid: string;
  hex: string;
  blockhash: string;
  blocktime: string;
  time: string;
  size: string;
  vin: Array<TransactionInput>;
  vout: Array<TransactionOutput>;
}

export interface TransactionInput {
  txid: string;
  vout: number;
}
export interface TransactionOutput {
  n: number;
  scriptPubKey: object;
  value: string;
}

export class TransactionNotExistsError extends Error {
  constructor(tx_hash: string) {
    super(`No Transaction with id ${tx_hash}`);
  }
}

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    resolveTransaction,
    sendTransaction,
    deleteTransaction,
    purgeTransactions,
  };

  // --------------------------------

  // resolveTransaction: load transaction from db, fetch it from electrum if we don't have it
  async function resolveTransaction(
    tx_hash: string
  ): Promise<TransactionEntity> {
    try {
      const localTx = await getTransactionByHash(tx_hash);

      // request the tx again if it's unconfirmed
      if (localTx.blockhash === "null") {
        throw new Error("Transaction Unconfirmed");
      }

      //Logger.debug("resolveTransaction", "local", tx_hash, localTx);
      return localTx;
    } catch (e) {
      // if there's any problem retrieving the tx locally, try to resolve it
      const Electrum = ElectrumService();
      const remoteTx = await Electrum.requestTransaction(tx_hash);
      const registeredTx = await _registerTransaction(remoteTx);
      //Logger.debug("resolveTransaction", "remote", tx_hash, registeredTx);
      return registeredTx;
    }
  }

  async function sendTransaction(
    tx: TransactionEntity,
    wallet: WalletEntity
  ): Promise<boolean> {
    const { txid: tx_hash, hex: tx_hex } = tx;

    const Electrum = ElectrumService();
    const result = await Electrum.broadcastTransaction(tx_hex);
    const isSuccess = result === tx_hash;

    if (isSuccess) {
      const UtxoManager = UtxoManagerService(wallet);
      const decodedTx = decodeTransaction(hexToBin(tx_hex));
      const vin = getVinFromDecodedTransaction(decodedTx);

      vin.forEach((input) => {
        UtxoManager.discardUtxo({ tx_hash: input.txid, tx_pos: input.vout });
      });
    } else {
      Logger.warn("transaction send failure", result);
    }

    return isSuccess;
  }

  async function deleteTransaction(tx_hash: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Library,
      });
    } catch (e) {
      //Logger.warn(e);
    }

    //Logger.debug("deleteTransaction", tx_hash);
    db.run(`DELETE FROM transactions WHERE txid="${tx_hash}";`);
    saveDatabase();
  }

  async function purgeTransactions(): Promise<void> {
    Logger.debug("purgeTransactions scheduled");
    queueMicrotask(async () => {
      const tx_hashes = resultToJson(
        db.exec(
          `
        SELECT txid FROM transactions WHERE
          txid NOT IN (SELECT txid FROM address_utxos) 
          AND txid NOT IN (SELECT txid FROM address_transactions WHERE amount IS NULL);
        `
        )
      );
      Logger.debug("purgeTransactions", tx_hashes);
      await Promise.all(tx_hashes.map(({ txid }) => deleteTransaction(txid)));
      Logger.debug("purgeTransactions done");
    });
  }

  // --------------------------------

  // Raw transaction data is stored directly on the device filesystem
  // This prevents bloating the in-memory sqlite db and causing OOM errors

  // [private] _loadTxData: read raw transaction hex data from filesystem
  async function _loadTxData(tx_hash: string): Promise<string> {
    try {
      const txFile = await Filesystem.readFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Library,
      });

      const txData = txFile.data.toString();

      if (txData === "") {
        throw new TransactionNotExistsError(tx_hash);
      }

      // Filesystem plugin gives us base64-encoded data
      const tx_hex = atob(txData);
      return tx_hex;
    } catch (e) {
      throw new TransactionNotExistsError(tx_hash);
    }
  }

  // [private] _writeTxData: write raw transaction hex data to filesystem
  async function _writeTxData(
    tx_hash: string,
    tx_hex: string
  ): Promise<WriteFileResult> {
    try {
      // Filesystem plugin writes as raw bytes, but we must pass base64
      const data = btoa(tx_hex);

      const result = await Filesystem.writeFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Library,
        recursive: true,
        data,
      });

      return result;
    } catch (e) {
      Logger.error(e);
      await purgeTransactions();
      return { uri: "" };
    }
  }

  // --------------------------------

  async function _registerTransaction(
    tx: TransactionEntity
  ): Promise<TransactionEntity> {
    const blockhash = tx.blockhash ? tx.blockhash : null;
    const blocktime = tx.blocktime ? tx.blocktime : null;
    const time = tx.time ? tx.time : Math.floor(Date.now() / 1000);

    const result = resultToJson(
      db.exec(
        `INSERT INTO transactions (
        txid,
        size,
        blockhash,
        time,
        blocktime
      )
      VALUES (
        "${tx.txid}",
        "${tx.size}",
        "${blockhash}",
        "${time}",
        "${blocktime}"
      ) ON CONFLICT DO 
        UPDATE SET
          size="${tx.size}",
          blockhash="${blockhash}",
          time="${time}",
          blocktime="${blocktime}"
        RETURNING *;
      `
      )
    )[0];

    await _writeTxData(tx.txid, tx.hex);
    saveDatabase();

    const decodedTx = decodeTransaction(hexToBin(tx.hex)) as LibauthTransaction;

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    const finalTx = { ...result, vin, vout };

    //Logger.debug("_registerTransaction", tx, time, blockhash);
    return finalTx;
  }

  async function getTransactionByHash(
    tx_hash: string
  ): Promise<TransactionEntity> {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    if (result.length < 1) {
      throw new TransactionNotExistsError(tx_hash);
    }

    // reconstruct transaction from raw tx hex
    const localTx = result[0];
    localTx.hex = await _loadTxData(tx_hash);

    const decodedTx = decodeTransaction(
      hexToBin(localTx.hex)
    ) as LibauthTransaction;

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    const tx = { ...localTx, vin, vout };

    //Logger.log("getTransactionByHash", tx_hash, decodedTx, tx);
    return tx;
  }

  function getVinFromDecodedTransaction(
    decodedTx: LibauthTransaction
  ): Array<TransactionInput> {
    return decodedTx.inputs.map(
      (input): TransactionInput => ({
        txid: binToHex(input.outpointTransactionHash),
        vout: input.outpointIndex,
      })
    );
  }

  function getVoutFromDecodedTransaction(
    decodedTx: LibauthTransaction
  ): Array<TransactionOutput> {
    return decodedTx.outputs.map((output, n): TransactionOutput => {
      const value = new Decimal(output.valueSatoshis.toString());

      return {
        n,
        scriptPubKey: {
          addresses: [
            value.greaterThan(0)
              ? lockingBytecodeToCashAddress(
                  output.lockingBytecode,
                  "bitcoincash"
                )
              : "",
          ],
        },
        value: value.toString(),
      };
    });
  }
}
