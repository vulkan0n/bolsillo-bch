import * as libauth from "@bitauth/libauth";
import { Decimal } from "decimal.js";
import { sha256 } from "@bitauth/libauth";
import DatabaseService from "@/services/DatabaseService";
import ElectrumService from "@/services/ElectrumService";
import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import { DUST_LIMIT } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";

import { hexToBin, binToHex } from "@/util/hex";

export default function TransactionManagerService() {
  const { db, resultToJson, saveDatabase } = new DatabaseService();

  return {
    registerTransaction,
    getTransactionByHash,
    resolveTransaction,
    buildP2pkhTransaction,
    sendTransaction,
  };

  function registerTransaction(tx) {
    const blockhash = tx.blockhash ? tx.blockhash : null;
    const blocktime = tx.blocktime ? tx.blocktime : null;
    const time = tx.time ? tx.time : null;

    //console.log("registerTransaction", tx, time, blockhash);

    db.run(
      `INSERT INTO transactions (
        txid,
        hex,
        size,
        blockhash,
        time,
        blocktime
      )
      VALUES (
        "${tx.txid}",
        "${tx.hex}",
        "${tx.size}",
        "${blockhash}",
        "${time}",
        "${blocktime}"
      ) ON CONFLICT DO 
        UPDATE SET
          hex="${tx.hex}",
          size="${tx.size}",
          blockhash="${blockhash}",
          time="${time}",
          blocktime="${blocktime}";
      `
    );

    saveDatabase();
  }

  function getTransactionByHash(tx_hash) {
    const result = resultToJson(
      db.exec(`SELECT * FROM transactions WHERE txid="${tx_hash}"`)
    );

    if (result.length < 1) {
      return null;
    }

    const localTx = result[0];
    const decodedTx = libauth.decodeTransaction(hexToBin(localTx.hex));

    // reconstruct "vin" from raw hex
    const vin = getVinFromDecodedTransaction(decodedTx);

    // reconstruct "vout" from raw hex
    const vout = getVoutFromDecodedTransaction(decodedTx);

    const tx = { ...result[0], vin, vout };

    //console.log("getTransactionByHash", tx_hash, decodedTx, tx);
    return tx;
  }

  function getVinFromDecodedTransaction(decodedTx) {
    return decodedTx.inputs.map((input) => ({
      txid: binToHex(input.outpointTransactionHash),
      vout: input.outpointIndex,
    }));
  }

  function getVoutFromDecodedTransaction(decodedTx) {
    return decodedTx.outputs.map((output, n) => {
      const value = new Decimal(output.valueSatoshis.toString()).toNumber();

      return {
        n,
        scriptPubKey: {
          addresses: [
            value > 0
              ? libauth.lockingBytecodeToCashAddress(
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

  async function resolveTransaction(tx_hash) {
    const localTx = getTransactionByHash(tx_hash);

    // if localTx is null we're requesting this tx for the first time
    if (
      localTx === null ||
      localTx.blockhash === "null" ||
      localTx.time === "null"
    ) {
      const Electrum = new ElectrumService();
      const tx = await Electrum.requestTransaction(tx_hash);
      registerTransaction(tx);
    }

    return getTransactionByHash(tx_hash);
  }

  function buildP2pkhTransaction(recipients, wallet_id, fee = DUST_LIMIT / 3) {
    // helper function returns null if invalid locking bytecode
    const addressToLockingBytecode = (addr) => {
      const { isBase58Address, address } = validateInvoiceString(addr);
      const lockingBytecode = isBase58Address
        ? libauth.base58AddressToLockingBytecode(address)
        : libauth.cashAddressToLockingBytecode(address);

      return typeof lockingBytecode === "object"
        ? lockingBytecode.bytecode
        : null;
    };

    // calculate total amount to send for all recipients
    const sendTotal = recipients
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // gather suitable inputs
    const UtxoManager = new UtxoManagerService(wallet_id);
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
      const AddressManager = new AddressManagerService(wallet_id);
      const changeAddress = AddressManager.getUnusedAddresses(1, 1)[0];

      vout.push({
        lockingBytecode: addressToLockingBytecode(changeAddress.address),
        valueSatoshis: BigInt(changeTotal),
      });
    }

    // initialize transaction compiler
    const template = libauth.importAuthenticationTemplate(
      libauth.authenticationTemplateP2pkhNonHd
    );
    const compiler = libauth.authenticationTemplateToCompilerBCH(template);

    // sign inputs
    const HdNode = new HdNodeService(wallet_id);
    const signedInputs = HdNode.signInputs(inputs, compiler);

    const generatedTx = libauth.generateTransaction({
      inputs: signedInputs,
      outputs: vout,
      locktime: 0,
      version: 2,
    });

    if (generatedTx.success === false) {
      console.warn("tx generation failed", generatedTx);
      return null;
    }

    const tx_raw = libauth.encodeTransaction(generatedTx.transaction);
    const tx_hex = binToHex(tx_raw);
    const tx_hash = libauth.swapEndianness(
      binToHex(sha256.hash(sha256.hash(tx_raw)))
    );

    // if we didn't reclaim change, add it to total fee
    const feeTotal = changeTotal >= DUST_LIMIT ? fee : fee + changeTotal;
    if (feeTotal < tx_raw.length) {
      // Fee under 1 sat/B... try again with byte length as fee
      // TODO: use relay fee provided by electrum (futureproofing)
      return buildP2pkhTransaction(recipients, wallet_id, tx_raw.length);
    }

    if (feeTotal > tx_raw.length * 3) {
      if (fee !== tx_raw.length) {
        // Fee greater than 300% of byte length. Can we make it smaller?
        return buildP2pkhTransaction(recipients, wallet_id, tx_raw.length);
      }

      // if we're here, fee can't get any smaller. proceed
    }

    /*
    console.log(
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

  async function sendTransaction({ tx_hash, tx_hex }, wallet_id) {
    const Electrum = new ElectrumService();
    const result = await Electrum.broadcastTransaction(tx_hex);
    const success = result === tx_hash;

    if (success) {
      const UtxoManager = new UtxoManagerService(wallet_id);
      const decodedTx = libauth.decodeTransaction(hexToBin(tx_hex));
      const vin = getVinFromDecodedTransaction(decodedTx);

      vin.forEach((input) => {
        UtxoManager.discardUtxo({ tx_hash: input.txid, tx_pos: input.vout });
      });
    } else {
      console.warn("transaction send failure", result);
    }

    return success;
  }
}
