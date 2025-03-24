import {
  encodeTransaction,
  generateTransaction,
  swapEndianness,
  cashAddressToLockingBytecode,
  base58AddressToLockingBytecode,
  importWalletTemplate,
  walletTemplateP2pkhNonHd,
  walletTemplateToCompilerBCH,
  getMinimumFee,
  getDustThreshold,
  Output,
  assertSuccess,
} from "@bitauth/libauth";

import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import { WalletEntity } from "@/services/WalletManagerService";
import {
  TransactionStub,
  TransactionOutput,
} from "@/services/TransactionManagerService";

import { DUST_RELAY_FEE, EXCESSIVE_SATOSHIS } from "@/util/sats";
import { validateBchUri } from "@/util/uri";
import { binToHex, hexToBin } from "@/util/hex";
import { sha256 } from "@/util/hash";

// NOTE: Couldn't find this type defined elsewhere, so have added it here.
export type ElectrumUtxo = {
  height: number;
  token_data?: {
    amount: string;
    category: string;
    nft?: {
      capability: string;
      commitment: string;
    };
  };
  tx_hash: string;
  tx_pos: number;
  value: number;
};

const Log = LogService("TxBuilder");

export class TransactionBuilderError extends Error {}

export default function TransactionBuilderService(wallet: WalletEntity) {
  return {
    buildP2pkhTransaction,
  };

  // --------------------------------

  function addressToLockingBytecode(addr) {
    const { isBase58Address, address } = validateBchUri(addr);
    const lockingBytecode = isBase58Address
      ? base58AddressToLockingBytecode(address)
      : cashAddressToLockingBytecode(address);

    if (typeof lockingBytecode === "string") {
      throw new Error(lockingBytecode);
    }

    return lockingBytecode.bytecode;
  }

  function createTokenOutput(recipientAddress, token) {
    const output = {
      lockingBytecode: addressToLockingBytecode(recipientAddress),
      valueSatoshis: EXCESSIVE_SATOSHIS,
      token: {
        ...token,
        category: hexToBin(token.category),
      },
    };

    const dustThreshold = getDustThreshold(output, DUST_RELAY_FEE);
    output.valueSatoshis = dustThreshold;

    return output;
  }

  function createCoinOutput(recipientAddress, amount) {
    const output = {
      lockingBytecode: addressToLockingBytecode(recipientAddress),
      valueSatoshis: amount,
    };

    return output;
  }

  function bip69SortInputs(a, b) {
    const aId = `${a.tx_hash}:${a.tx_pos}`;
    const bId = `${b.tx_hash}:${b.tx_pos}`;

    if (aId < bId) {
      return -1;
    }

    if (aId > bId) {
      return 1;
    }

    return 0;
  }

  function bip69SortOutputs(a, b) {
    if (a.amount < b.amount) {
      return -1;
    }

    if (a.amount > b.amount) {
      return 1;
    }

    if (a.lockingBytecode < b.lockingBytecode) {
      return -1;
    }

    if (a.lockingBytecode > b.lockingBytecode) {
      return 1;
    }

    // token-aware bip69
    if (a.token && !b.token) {
      return -1;
    }

    if (!a.token && b.token) {
      return 1;
    }

    if (a.token.token_amount < b.token.token_amount) {
      return -1;
    }

    if (a.token.token_amount > b.token.token_amount) {
      return 1;
    }

    if (a.token.nft && !b.token.nft) {
      return -1;
    }

    if (!a.token.nft && b.token.nft) {
      return -1;
    }

    const capabilityRank = ["none", "mutable", "minting"];
    const aRank = capabilityRank.findIndex((c) => a.token.nft.capability === c);
    const bRank = capabilityRank.findIndex((c) => b.token.nft.capability === c);

    if (aRank < bRank) {
      return -1;
    }

    if (aRank > bRank) {
      return 1;
    }

    if (a.token.nft.commitment < b.token.nft.commitment) {
      return -1;
    }

    if (a.token.nft.commitment > b.token.nft.commitment) {
      return 1;
    }

    return 0;
  }

  function buildP2pkhTransaction({
    recipients,
    fee = 0n,
    depth = 0,
    selection = [],
  }: {
    recipients: Array<{
      address: string;
      amount: bigint;
      token?: {
        category: string;
        amount: bigint;
        nft?: {
          capability: "none" | "mutable" | "minting";
          commitment: Uint8Array;
        };
      };
    }>;
    fee?: bigint;
    depth?: number;
    selection?: Array<TransactionOutput>;
  }): TransactionStub | bigint | null {
    // calculate total amount to send for all recipients
    const sendTotal = recipients.reduce((sum, cur) => sum + cur.amount, 0n);

    // gather suitable inputs
    const UtxoManager = UtxoManagerService(wallet.walletHash);
    const inputs = (
      selection.length > 0 ? selection : UtxoManager.selectCoins(sendTotal)
    ).sort(bip69SortInputs);

    Log.debug("using utxos:", inputs);

    const inputTotal = inputs.reduce((sum, cur) => sum + cur.amount, 0n) - fee;

    const coinRecipients = recipients.filter(
      (recipient) => recipient.token === undefined
    );

    const tokenRecipients = recipients.filter(
      (recipient) => recipient.token !== undefined
    );

    const tokenInputAmounts = inputs
      .filter((input) => input.token_category !== null)
      .reduce((tokenAmounts, input) => {
        const category = input.token_category;

        const mapAmount = tokenAmounts.get(category) || 0n;
        tokenAmounts.set(category, mapAmount + input.token_amount);

        return tokenAmounts;
      }, new Map<string, bigint>());

    const tokenCategories = Array.from(tokenInputAmounts.keys());

    const tokenChangeAmounts = tokenRecipients.reduce((amounts, recipient) => {
      const { category, amount } = recipient.token!;

      const amountRemaining =
        amounts.get(category) || tokenInputAmounts.get(category) || 0n;

      amounts.set(category, amountRemaining - amount);

      return amounts;
    }, new Map<string, bigint>());

    Log.debug(
      "tokenInputAmounts",
      tokenInputAmounts,
      "tokenChangeAmounts",
      tokenChangeAmounts
    );

    // construct tx outputs
    let remainingInputSats = inputTotal;

    const tokenVout: Array<Output> = tokenRecipients.map((recipient) =>
      createTokenOutput(recipient.address, recipient.token)
    );

    const coinVout: Array<Output> = coinRecipients.map((recipient) =>
      createCoinOutput(recipient.address, recipient.amount)
    );

    const vout = [...tokenVout, ...coinVout];

    vout.forEach((out) => {
      remainingInputSats -= out.valueSatoshis;
    });

    // construct change outputs
    const AddressManager = AddressManagerService(wallet.walletHash);
    const changeAddresses = AddressManager.getUnusedAddresses(
      tokenCategories.length + 1,
      1
    );

    while (tokenCategories.length > 0) {
      const category = tokenCategories.shift() as string;
      const changeAddress = changeAddresses.shift() as AddressEntity;

      Log.debug(category, changeAddress.address);

      const tokenAmountIn = tokenInputAmounts.get(category);
      const tokenAmountOut = tokenChangeAmounts.get(category);

      Log.debug(category, tokenAmountIn, tokenAmountOut);

      const tokenChangeOutput = createTokenOutput(changeAddress.address, {
        category,
        amount: tokenAmountOut,
      });

      remainingInputSats -= tokenChangeOutput.valueSatoshis;
      Log.debug("tokenChangeOutput", tokenChangeOutput, remainingInputSats);
      vout.push(tokenChangeOutput);
    }

    const changeAddress = changeAddresses.shift();
    const changeAmount = remainingInputSats;
    const changeOutput = createCoinOutput(changeAddress.address, changeAmount);

    const dustThreshold = getDustThreshold(changeOutput, DUST_RELAY_FEE);

    // only add change to the tx if it isn't dust.
    if (changeAmount >= dustThreshold) {
      remainingInputSats -= changeAmount;
      vout.push(changeOutput);
    }

    // initialize transaction compiler
    const template = assertSuccess(
      importWalletTemplate(walletTemplateP2pkhNonHd)
    );
    const compiler = walletTemplateToCompilerBCH(template);

    // sign inputs
    const HdNode = HdNodeService(wallet);
    const signedInputs = HdNode.signInputs(inputs, compiler);

    const generatedTx = generateTransaction({
      inputs: signedInputs,
      outputs: vout.sort(bip69SortOutputs),
      locktime: 0,
      version: 2,
    });

    if (generatedTx.success === false) {
      Log.warn("tx generation failed", generatedTx);
      return null;
    }

    Log.debug("Generated transaction with vouts", vout);

    const tx_raw = encodeTransaction(generatedTx.transaction);
    const tx_hex = binToHex(tx_raw);
    const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));

    const minimumFee = getMinimumFee(BigInt(tx_raw.length), DUST_RELAY_FEE);

    if (fee < minimumFee && remainingInputSats < minimumFee) {
      Log.debug(
        `Input: ${inputTotal}; Output: ${sendTotal}; Fee: ${fee}; Remaining sats: ${remainingInputSats}; Minimum fee: ${minimumFee}; trying again`,
        tx_raw.length,
        depth
      );

      return buildP2pkhTransaction({
        selection,
        recipients,
        fee: minimumFee,
        depth: depth + 1,
      });
    }

    // insufficient funds
    if (remainingInputSats < 0) {
      Log.debug(
        "buildP2pkhTransaction: insufficient funds",
        inputTotal,
        sendTotal,
        fee
      );

      if (tokenVout.length > 0 && depth < 3) {
        const tokenFundInputs = UtxoManager.selectCoins(
          remainingInputSats * -1n
        );
        const newSelection = selection
          .filter(
            (s) =>
              tokenFundInputs.findIndex(
                (tfi) => tfi.tx_hash === s.txid && tfi.tx_pos === s.n
              ) === -1
          )
          .concat(tokenFundInputs)
          .sort(bip69SortInputs);

        return buildP2pkhTransaction({
          selection: newSelection,
          recipients,
          fee: minimumFee,
          depth: depth + 1
        });
      }
      return inputTotal;
    }

    return {
      txid: tx_hash,
      hex: tx_hex,
    };
  }
}

// TODO: Once Token support is added to Selene, add it to this function too.
//       It will require more complex logic: An output will need to be added per each token.
export function buildSweepTransaction(
  utxos: Array<ElectrumUtxo>,
  privateKey: Uint8Array,
  receivingAddress: string
): TransactionStub {
  // Convert the receiving address to locking bytecode.
  const receivingBytecode = cashAddressToLockingBytecode(receivingAddress);

  // If we could not convert it successfully, throw an error.
  if (typeof receivingBytecode === "string") {
    throw new Error(receivingBytecode);
  }

  // Create our P2PKH Compiler.
  const compilerP2pkh = walletTemplateToCompilerBCH(walletTemplateP2pkhNonHd);

  // Compile our inputs.
  const inputDirectives = utxos.map((unspent) => ({
    outpointIndex: unspent.tx_pos,
    outpointTransactionHash: hexToBin(unspent.tx_hash),
    sequenceNumber: 0,
    unlockingBytecode: {
      compiler: compilerP2pkh,
      data: {
        keys: { privateKeys: { key: privateKey } },
      },
      script: "unlock",
      valueSatoshis: BigInt(unspent.value),
    },
  }));

  // Calculate the total sats available in our inputs.
  const totalSats = inputDirectives.reduce((total, input) => {
    if (input.unlockingBytecode instanceof Uint8Array) {
      return total + 0n;
    }

    return total + input.unlockingBytecode.valueSatoshis;
  }, 0n);

  // We need to calculate the number of bytes so that we can calculate the fee.
  // So we loop twice and store the final transaction here each time.
  // 1st time will have zero fee. 2nd time will accommodate the fee.
  let encodedTransaction = new Uint8Array();

  // Create the transaction by looping twice.
  // 1st loop: Transaction without a fee.
  // 2nd loop: Accommodate the fee.
  for (let i = 0; i < 2; i += 1) {
    // Get the fee using 1000 sats/KB.
    const feeSats = getMinimumFee(
      BigInt(encodedTransaction.length),
      DUST_RELAY_FEE
    );

    // Attempt to generate the transaction.
    const generatedTransaction = generateTransaction({
      version: 2,
      locktime: 0,
      inputs: inputDirectives,
      outputs: [
        {
          lockingBytecode: receivingBytecode.bytecode,
          valueSatoshis: totalSats - feeSats,
        },
      ],
    });

    if (!generatedTransaction.success) {
      throw new Error("Failed to generate transaction");
    }

    // Encode the transaction for broadcasting (and fee estimation).
    encodedTransaction = encodeTransaction(generatedTransaction.transaction);
  }

  // Calculate the txid and convert the transaction to hex format.
  const txid = swapEndianness(
    binToHex(sha256.hash(sha256.hash(encodedTransaction)))
  );
  const hex = binToHex(encodedTransaction);

  // Return the transaction.
  return {
    txid,
    hex,
  };
}
