import Logger from "js-logger";
import { Decimal } from "decimal.js";
import {
  sha256,
  encodeTransaction,
  generateTransaction,
  swapEndianness,
  cashAddressToLockingBytecode,
  base58AddressToLockingBytecode,
  importAuthenticationTemplate,
  authenticationTemplateP2pkhNonHd,
  authenticationTemplateToCompilerBCH,
} from "@bitauth/libauth";

import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import { WalletEntity } from "@/services/WalletManagerService";
import { TransactionStub } from "@/services/TransactionManagerService";

import { DUST_LIMIT } from "@/util/sats";
import { validateInvoiceString } from "@/util/invoice";
import { binToHex } from "@/util/hex";

export default function TransactionBuilderService(wallet: WalletEntity) {
  return {
    buildP2pkhTransaction,
  };

  // --------------------------------

  function addressToLockingBytecode(addr) {
    const { isBase58Address, address } = validateInvoiceString(addr);
    const lockingBytecode = isBase58Address
      ? base58AddressToLockingBytecode(address)
      : cashAddressToLockingBytecode(address);

    if (typeof lockingBytecode === "string") {
      throw new Error(lockingBytecode);
    }

    return lockingBytecode.bytecode;
  }

  function buildP2pkhTransaction(
    recipients: Array<{ address: string; amount: Decimal }>,
    fee: number = DUST_LIMIT / 3,
    depth: number = 0
  ): TransactionStub {
    // calculate total amount to send for all recipients
    const sendTotal = recipients
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // gather suitable inputs
    const UtxoManager = UtxoManagerService(wallet);
    const inputs = UtxoManager.selectUtxos(sendTotal, fee);

    Logger.debug("selectUtxos:", inputs);

    const inputTotal = inputs
      .reduce((sum, cur) => sum.plus(cur.amount), new Decimal(0))
      .toNumber();

    // calculate change
    const changeTotal = inputTotal - sendTotal - fee;

    // insufficient funds
    if (changeTotal < 0) {
      Logger.debug(
        "buildP2pkhTransaction: insufficient funds",
        inputTotal,
        sendTotal,
        fee,
        sendTotal - fee,
        changeTotal
      );
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
      Logger.debug(
        `Fee under 1 sat/B... try again with ${tx_raw.length} bytelength as fee`,
        depth
      );
      // TODO: use relay fee provided by electrum (futureproofing)
      return buildP2pkhTransaction(recipients, tx_raw.length, depth + 1);
    }

    if (feeTotal > tx_raw.length * 3 && depth < 3) {
      if (fee !== tx_raw.length) {
        Logger.debug(
          "Fee greater than 300% of byte length. Can we make it smaller?",
          depth
        );
        return buildP2pkhTransaction(recipients, tx_raw.length, depth + 1);
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
      txid: tx_hash,
      hex: tx_hex,
    };
  }
}
