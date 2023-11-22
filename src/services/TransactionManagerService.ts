import Logger from "js-logger";
import { Filesystem, Directory, WriteFileResult } from "@capacitor/filesystem";
import { Decimal } from "decimal.js";
import {
  sha256,
  decodeTransaction,
  encodeTransaction,
  generateTransaction,
  swapEndianness,
  lockingBytecodeToCashAddress,
  cashAddressToLockingBytecode,
  base58AddressToLockingBytecode,
  importAuthenticationTemplate,
  authenticationTemplateP2pkhNonHd,
  authenticationTemplateToCompilerBCH,
  TransactionCommon as LibauthTransaction,
} from "@bitauth/libauth";

import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import { WalletEntity } from "@/services/WalletManagerService";

import { DUST_LIMIT } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";
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
  value: Decimal;
}

export class TransactionNotExistsError extends Error {
  constructor(tx_hash: string) {
    super(`No Transaction with id ${tx_hash}`);
  }
}

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = DatabaseService();

  return {
    registerTransaction,
    getTransactionByHash,
    resolveTransaction,
    buildP2pkhTransaction,
    sendTransaction,
    deleteTransaction,
  };

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
      Logger.error(e);
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
      return { uri: "" };
    }
  }

  async function deleteTransaction(tx_hash: string): Promise<void> {
    return Filesystem.deleteFile({
      path: `/selene/tx/${tx_hash}.raw`,
      directory: Directory.Library,
    });
  }

  // --------------------------------

  async function registerTransaction(tx): Promise<void> {
    const blockhash = tx.blockhash ? tx.blockhash : null;
    const blocktime = tx.blocktime ? tx.blocktime : null;
    const time = tx.time ? tx.time : null;

    //Logger.log("registerTransaction", tx, time, blockhash);

    db.run(
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
          blocktime="${blocktime}";
      `
    );

    await _writeTxData(tx.txid, tx.hex);
    await saveDatabase();
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
        value,
      };
    });
  }

  async function resolveTransaction(
    tx_hash: string
  ): Promise<TransactionEntity> {
    Logger.log("resolving", tx_hash);
    try {
      const localTx = await getTransactionByHash(tx_hash);
      Logger.log("localTx", localTx);

      if (localTx.blockhash === "null" || localTx.time === "null") {
        throw new Error("Transaction Unconfirmed");
      }

      return localTx;
    } catch (e) {
      const Electrum = ElectrumService();
      const tx = await Electrum.requestTransaction(tx_hash);
      await registerTransaction(tx);
    }

    const loadedTx = await getTransactionByHash(tx_hash);
    Logger.log("resolved", tx_hash, loadedTx);
    return loadedTx;
  }

  function buildP2pkhTransaction(recipients, wallet, fee = DUST_LIMIT / 3) {
    // helper function returns null if invalid locking bytecode
    const addressToLockingBytecode = (addr) => {
      const { isBase58Address, address } = validateInvoiceString(addr);
      const lockingBytecode = isBase58Address
        ? base58AddressToLockingBytecode(address)
        : cashAddressToLockingBytecode(address);

      return typeof lockingBytecode === "object"
        ? lockingBytecode.bytecode
        : null;
    };

    // calculate total amount to send for all recipients
    const sendTotal = recipients
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // gather suitable inputs
    const UtxoManager = UtxoManagerService(wallet);
    const inputs = UtxoManager.selectUtxos(sendTotal, fee);
    const inputTotal = inputs
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // calculate change
    const changeTotal = inputTotal - sendTotal - fee;

    // insufficient funds
    if (changeTotal < 0) {
      return sendTotal - fee;
    }

    // construct tx outputs
    const vout = recipients.map((out) => ({
      lockingBytecode: addressToLockingBytecode(out.address),
      valueSatoshis: BigInt(out.amount),
    }));

    // construct change outputs
    if (changeTotal >= DUST_LIMIT) {
      const AddressManager = AddressManagerService(wallet);
      const changeAddress = AddressManager.getUnusedAddresses(1, 1)[0];

      vout.push({
        lockingBytecode: addressToLockingBytecode(changeAddress.address),
        valueSatoshis: BigInt(changeTotal),
      });
    }

    // initialize transaction compiler
    const template = importAuthenticationTemplate(
      authenticationTemplateP2pkhNonHd
    );
    const compiler = authenticationTemplateToCompilerBCH(template);

    // sign inputs
    const HdNode = HdNodeService(wallet);
    const signedInputs = HdNode.signInputs(inputs, compiler);

    const generatedTx = generateTransaction({
      inputs: signedInputs,
      outputs: vout,
      locktime: 0,
      version: 2,
    });

    if (generatedTx.success === false) {
      Logger.warn("tx generation failed", generatedTx);
      return null;
    }

    const tx_raw = encodeTransaction(generatedTx.transaction);
    const tx_hex = binToHex(tx_raw);
    const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));

    // if we didn't reclaim change, add it to total fee
    const feeTotal = changeTotal >= DUST_LIMIT ? fee : fee + changeTotal;
    if (feeTotal < tx_raw.length) {
      // Fee under 1 sat/B... try again with byte length as fee
      // TODO: use relay fee provided by electrum (futureproofing)
      return buildP2pkhTransaction(recipients, wallet, tx_raw.length);
    }

    if (feeTotal > tx_raw.length * 3) {
      if (fee !== tx_raw.length) {
        // Fee greater than 300% of byte length. Can we make it smaller?
        return buildP2pkhTransaction(recipients, wallet, tx_raw.length);
      }

      // if we're here, fee can't get any smaller. proceed
    }

    /*
    Logger.log(
      "buildTransaction",
      tx_hash,
      vout,
      signedInputs,
      tx_hex,
      tx_raw.length,
      fee,
      feeTotal
    );
    */

    return {
      tx_hash,
      tx_hex,
      feeTotal,
    };
  }

  async function sendTransaction(
    { tx_hash, tx_hex },
    wallet: WalletEntity
  ): Promise<boolean> {
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
}
