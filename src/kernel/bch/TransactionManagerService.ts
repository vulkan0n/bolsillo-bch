import { Filesystem, Directory } from "@capacitor/filesystem";
import {
  decodeTransaction,
  lockingBytecodeToCashAddress,
  TransactionCommon,
  assertSuccess,
  disassembleBytecodeBCH,
  Output as LibauthOutput,
  Input as LibauthInput,
} from "@bitauth/libauth";

import LogService from "@/kernel/app/LogService";
import DatabaseService from "@/kernel/app/DatabaseService";
import ElectrumService from "@/kernel/bch/ElectrumService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import { hexToBin, binToHex } from "@/util/hex";
import { ValidBchNetwork } from "@/util/electrum_servers";

const Log = LogService("TransactionManager");

export interface TransactionStub {
  txid: string;
  hex: string;
}

export interface TransactionEntity extends TransactionStub {
  blockhash: string | null;
  blocktime: number;
  time: number;
  size: string;
  version: number;
  height: number;
  vin: Array<TransactionInput>;
  vout: Array<TransactionOutput>;
}

export interface TransactionInput extends LibauthInput {
  txid: string;
  vout: number;
  coinbase?: string;
}

export interface VoutScriptPubKey {
  addresses?: Array<string>;
  hex: string;
  asm: string;
}

export interface TransactionOutput extends LibauthOutput {
  n: number;
  scriptPubKey: VoutScriptPubKey;
}

export class TransactionNotExistsError extends Error {
  constructor(tx_hash: string) {
    super(`No Transaction with id ${tx_hash}`);
  }
}

export default function TransactionManagerService() {
  const Database = DatabaseService();
  const APP_DB = Database.getAppDatabase();

  const WalletManager = WalletManagerService();

  return {
    resolveTransaction,
    waitForTransactionToResolve,
    sendTransaction,
    deleteTransaction,
    purgeTransactions,
    setBlockPos,
    setBlockPosBulk,
  };

  // --------------------------------

  // resolveTransaction: load transaction from db, fetch it from electrum if we don't have it
  async function resolveTransaction(
    tx_hash: string,
    network: ValidBchNetwork = "mainnet"
  ): Promise<TransactionEntity> {
    try {
      const localTx = await getTransactionByHash(tx_hash);

      // request the tx again if it's unconfirmed
      if (localTx.blockhash === null || localTx.height <= 0) {
        throw new Error("Transaction Unconfirmed");
      }

      //Log.debug("resolveTransaction", "local", tx_hash, localTx);
      return localTx;
    } catch (e) {
      // if there's any problem retrieving the tx locally, try to resolve it
      const Electrum = ElectrumService(network);
      const remoteTx = await Electrum.requestTransaction(tx_hash);
      //Log.debug("resolveTransaction", "remote", tx_hash, remoteTx);
      const registeredTx = await _registerTransaction(remoteTx);
      return registeredTx;
    }
  }

  // Will poll resolveTransaction at the given interval for up to the given timeout period.
  // This function is useful in situations where we need to monitor ("wait") for a transaction that is broadcasted by a third-party node (not us).
  // NOTE: A more optimal implementation in future might be to use Fulcrum's tx.subscribe emthods.
  //       However, this would probably be a heavy refactor that introduces additional state.
  async function waitForTransactionToResolve(
    transactionId: string,
    timeoutMs = 10_000,
    intervalMs = 1000
  ) {
    const startTime = Date.now();

    return new Promise<TransactionEntity>((resolve, reject) => {
      const checkTransaction = async () => {
        try {
          const tx = await resolveTransaction(transactionId);
          resolve(tx);
        } catch (error) {
          // If the transaction is not resolved yet, check again after the interval
          const elapsedTime = Date.now() - startTime;
          if (elapsedTime < timeoutMs) {
            setTimeout(checkTransaction, intervalMs);
          } else {
            reject(
              new Error(`Failed to resolve transaction after ${timeoutMs}ms`)
            );
          }
        }
      };

      // Start checking the transaction
      checkTransaction();
    });
  }

  async function sendTransaction(
    tx: TransactionStub,
    network: ValidBchNetwork = "mainnet"
  ): Promise<{ isSuccess: boolean; result: string | null }> {
    const { txid: tx_hash, hex: tx_hex } = tx;

    const Electrum = ElectrumService(network);

    Log.debug("sendTransaction attempting broadcast");
    const result = await Electrum.broadcastTransaction(tx_hex);
    const isSuccess = result === tx_hash;

    if (!isSuccess) {
      Log.warn("transaction send failure", result);
      throw result;
    }

    return { isSuccess, result };
  }

  async function deleteTransaction(tx_hash: string): Promise<void> {
    try {
      await Filesystem.deleteFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Cache,
      });
    } catch (e) {
      //Log.warn(e);
    }

    //Log.debug("deleteTransaction", tx_hash);
    APP_DB.run(`DELETE FROM transactions WHERE txid="${tx_hash}";`);
  }

  async function purgeTransactions(): Promise<void> {
    const wallets = WalletManager.listWallets();

    // get list of txids associated with our utxos or history (for ALL wallets)
    const live_txids = (
      await Promise.all(
        wallets.map(async ({ walletHash }) => {
          const walletDb = await WalletManager.openWalletDatabase(walletHash);
          const utxo_txids = walletDb.exec("SELECT txid FROM address_utxos");
          const history_txids = walletDb.exec(
            "SELECT txid FROM address_transactions"
          );

          const cat_txids = [
            ...utxo_txids.map(({ txid }) => `"${txid}"`),
            ...history_txids.map(({ txid }) => `"${txid}"`),
          ].join(",");

          return cat_txids;
        })
      )
    )
      .filter((txid) => txid !== "")
      .join(",");

    const purgeHashes = APP_DB.exec(
      `SELECT txid FROM transactions WHERE txid NOT IN ($live_txids)`,
      { $live_txids: live_txids }
    ).map(({ txid }) => txid);

    const fileTxHashes = (
      await Filesystem.readdir({
        path: "/selene/tx",
        directory: Directory.Cache,
      })
    ).files
      .map((file) => file.name.split(".")[0])
      .filter(
        (txid) => !live_txids.includes(txid) && !purgeHashes.includes(txid) // purgeHashes already included
      );

    const tx_hashes = [...purgeHashes, ...fileTxHashes];

    Log.time("purgeTransactions");
    await Promise.all(tx_hashes.map((txid) => deleteTransaction(txid)));
    Log.debug("purgeTransactions", tx_hashes);
    Log.timeEnd("purgeTransactions");
  }

  // --------------------------------

  // Raw transaction data is stored directly on the device filesystem
  // This prevents bloating the in-memory sqlite db and causing OOM errors

  // [private] _loadTxData: read raw transaction hex data from filesystem
  async function _loadTxData(tx_hash: string): Promise<string> {
    try {
      const txFile = await Filesystem.readFile({
        path: `/selene/tx/${tx_hash}.raw`,
        directory: Directory.Cache,
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
  async function _writeTxData(tx_hash: string, tx_hex: string) {
    // Filesystem plugin writes as raw bytes, but we must pass base64
    const data = btoa(tx_hex);

    const result = await Filesystem.writeFile({
      path: `/selene/tx/${tx_hash}.raw`,
      directory: Directory.Cache,
      recursive: true,
      data,
    });

    return result;
  }

  // --------------------------------

  async function _registerTransaction(
    tx: TransactionEntity
  ): Promise<TransactionEntity> {
    const decodedTx = decodeTransaction(hexToBin(tx.hex));

    if (typeof decodedTx === "string") {
      throw new Error(decodedTx);
    }

    const blockhash = tx.blockhash ? tx.blockhash : null;
    const blocktime = tx.blocktime ? tx.blocktime : null;
    const time = tx.time ? tx.time : Math.floor(Date.now() / 1000);
    const coinbase = tx.vin[0].coinbase || null;

    const result = APP_DB.exec(
      `INSERT INTO transactions (
        txid,
        size,
        blockhash,
        time,
        blocktime,
        version,
        height,
        coinbase
      )
      VALUES ($txid, $size, $blockhash, $time, $blocktime, $version, $height, $coinbase)
      ON CONFLICT DO
        UPDATE SET
          size=$size,
          blockhash=$blockhash,
          time=$time,
          blocktime=$blocktime,
          height=$height
      RETURNING *;
      `,
      {
        $txid: tx.txid,
        $size: tx.size,
        $blockhash: blockhash,
        $time: time,
        $blocktime: blocktime,
        $version: tx.version,
        $height: tx.height,
        $coinbase: coinbase,
      }
    )[0];

    await _writeTxData(tx.txid, tx.hex);

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    if (coinbase !== null) {
      vin[0].coinbase = coinbase;
    }

    const finalTx = { ...result, vin, vout };

    //Log.debug("_registerTransaction", tx, time, blockhash);
    return finalTx;
  }

  async function getTransactionByHash(
    tx_hash: string
  ): Promise<TransactionEntity> {
    const result = APP_DB.exec(
      `SELECT * FROM transactions WHERE txid="${tx_hash}"`
    );

    if (result.length < 1) {
      throw new TransactionNotExistsError(tx_hash);
    }

    // reconstruct transaction from raw tx hex
    const localTx = result[0];
    localTx.hex = await _loadTxData(tx_hash);

    const decodedTx = assertSuccess(decodeTransaction(hexToBin(localTx.hex)));

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    if (localTx.coinbase !== null) {
      vin[0].coinbase = localTx.coinbase;
    }

    const tx = { ...localTx, vin, vout };

    //Log.log("getTransactionByHash", tx_hash, decodedTx, tx);
    return tx;
  }

  function getVinFromDecodedTransaction(
    decodedTx: TransactionCommon
  ): Array<TransactionInput> {
    return decodedTx.inputs.map((input) => ({
      txid: binToHex(input.outpointTransactionHash),
      vout: input.outpointIndex,
      outpointIndex: input.outpointIndex,
      outpointTransactionHash: input.outpointTransactionHash,
      sequenceNumber: input.sequenceNumber,
      unlockingBytecode: input.unlockingBytecode,
    }));
  }

  function getVoutFromDecodedTransaction(
    decodedTx: TransactionCommon
  ): Array<TransactionOutput> {
    return decodedTx.outputs.map((output, n) => {
      const cashAddr = lockingBytecodeToCashAddress({
        prefix: WalletManager.getPrefix(),
        bytecode: output.lockingBytecode,
        tokenSupport: !!output.token,
      });

      const vout = {
        n,
        lockingBytecode: output.lockingBytecode,
        scriptPubKey: {
          addresses: [typeof cashAddr !== "string" ? cashAddr.address : ""],
          hex: binToHex(output.lockingBytecode),
          asm: disassembleBytecodeBCH(output.lockingBytecode),
        },
        token: output.token,
        valueSatoshis: output.valueSatoshis,
      };

      return vout;
    });
  }

  function setBlockPos(tx_hash: string, blockPos: number) {
    APP_DB.run("UPDATE transactions SET block_pos=? WHERE txid=?", [
      blockPos,
      tx_hash,
    ]);
  }

  function setBlockPosBulk(transactions) {
    try {
      //Log.debug("setBlockPosBulk", transactions);
      const query = [
        "BEGIN TRANSACTION;",
        ...transactions.map((t) =>
          t.block_pos !== null
            ? `UPDATE transactions SET block_pos=${t.block_pos} WHERE txid="${t.tx_hash}";`
            : ""
        ),
        "COMMIT;",
      ].join("");
      APP_DB.run(query);
      //Log.debug("setBlockPosBulk done");
    } catch (e) {
      Log.error(e);
      throw e;
    }
  }
}
