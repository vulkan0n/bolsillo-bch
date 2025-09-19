import {
  encodeTransaction,
  generateTransaction,
  swapEndianness,
  importWalletTemplate,
  walletTemplateP2pkhNonHd,
  walletTemplateToCompilerBCH,
  getMinimumFee,
  getDustThreshold,
  Output,
  assertSuccess,
} from "@bitauth/libauth";

import * as clab from "@cashlab/common";
import * as cauldron from "@cashlab/cauldron";
import LogService from "@/services/LogService";
import UtxoManagerService from "@/services/UtxoManagerService";
import AddressManagerService, {
  AddressEntity,
} from "@/services/AddressManagerService";
import HdNodeService from "@/services/HdNodeService";
import WalletManagerService from "@/services/WalletManagerService";
import {
  TransactionStub,
  TransactionOutput,
} from "@/services/TransactionManagerService";

import {
  DUST_RELAY_FEE,
  EXCESSIVE_SATOSHIS,
  TXFEE_PER_BYTE,
} from "@/util/sats";
import { binToHex, hexToBin } from "@/util/hex";
import { sha256 } from "@/util/hash";
import { addressToLockingBytecode } from "@/util/cashaddr";

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

export default function TransactionBuilderService(walletHash: string) {
  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWallet(walletHash);

  return {
    buildP2pkhTransaction,
    buildSendTokensTransactionWithFeePayingTokenCategory,
  };

  // --------------------------------

  function createTokenOutput(recipientAddress, token) {
    const output = {
      lockingBytecode: addressToLockingBytecode(recipientAddress),
      valueSatoshis: EXCESSIVE_SATOSHIS,
      token: {
        ...token,
        category: hexToBin(token.category),
      },
    };

    Log.debug("createTokenOutput", output, token);

    const dustThreshold = getDustThreshold(output, DUST_RELAY_FEE);
    output.valueSatoshis = dustThreshold;

    return output;
  }

  function createCoinOutput(recipientAddress, amount) {
    const output = {
      lockingBytecode: addressToLockingBytecode(recipientAddress),
      valueSatoshis: amount,
    };

    Log.debug("createCoinOutput", output);
    return output;
  }
  // prepare outputs
  function prepareOutputsFromRecipients(recipients) {
    const coinRecipients = recipients.filter(
      (recipient) => recipient.token === undefined
    );
    const coinVout: Array<Output> = coinRecipients.map((recipient) =>
      createCoinOutput(recipient.address, recipient.amount)
    );

    // prepare token outputs
    const tokenRecipients = recipients.filter(
      (recipient) => recipient.token !== undefined
    );
    const tokenVout: Array<Output> = tokenRecipients.map((recipient) =>
      createTokenOutput(recipient.address, recipient.token)
    );

    // calculate total amount to send for all recipients
    const vout = [...coinVout, ...tokenVout];
    return vout;
  }

  function buildP2pkhTransaction({
    recipients,
    fee = 0n,
    gas = 0n,
    depth = 0,
    selection = [],
    nftSelection = [],
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
    gas?: bigint;
    depth?: number;
    selection?: Array<TransactionOutput>;
    nftSelection?: Array<TransactionOutput>;
  }): TransactionStub | bigint {
    const hasSelection = selection.length > 0;

    Log.debug("buildP2pkhTransaction depth", depth);
    // prepare outputs
    const recipientVouts = prepareOutputsFromRecipients(recipients);
    const recipientOutputTotal = recipientVouts.reduce(
      (sum, cur) => sum + cur.valueSatoshis,
      0n
    );

    const recipientCoinTotal = recipientVouts
      .filter((out) => out.token === undefined)
      .reduce((sum, cur) => sum + cur.valueSatoshis, 0n);

    const sendTotal = recipientOutputTotal + fee + gas;

    Log.debug(
      "buildP2pkhTransaction recipients:",
      recipientVouts,
      recipientOutputTotal,
      fee,
      sendTotal,
      gas
    );

    const tokenOutputAmountsByCategory = recipientVouts.reduce(
      (amounts, output) => {
        // calculate total output amounts for each token category
        if (!output.token || output.token.nft) {
          return amounts;
        }

        const { category, amount } = output.token;

        const categoryHex = binToHex(category);
        const categoryAmount = amounts.get(categoryHex) || 0n;
        amounts.set(categoryHex, categoryAmount + amount);

        return amounts;
      },
      new Map<string, bigint>()
    );

    const tokenCategories = Array.from(tokenOutputAmountsByCategory.keys());
    const hasTokens = tokenCategories.length > 0;
    const hasNft = nftSelection.length > 0;

    // gather suitable inputs
    const UtxoManager = UtxoManagerService(wallet.walletHash);

    const tokenInputs = tokenCategories
      .map((category) => {
        if (!tokenOutputAmountsByCategory.has(category)) {
          return [];
        }

        return UtxoManager.selectTokens(
          category,
          tokenOutputAmountsByCategory.get(category)
        );
      })
      .flat();

    const coinInputs = UtxoManager.selectCoins(recipientCoinTotal + fee + gas);

    const inputs = hasSelection
      ? selection
      : [...nftSelection, ...tokenInputs, ...coinInputs];

    const inputTotal = inputs.reduce((sum, cur) => sum + cur.amount, 0n);
    Log.debug("buildP2pkhTransaction using inputs:", inputs, inputTotal);

    if (inputTotal < sendTotal) {
      return (inputTotal - sendTotal) * -1n;
    }

    const preparedTokenChange = prepareTokenChange(inputs, recipientVouts);
    const tokenChangeAmount = preparedTokenChange.reduce(
      (sum, cur) => sum + cur.valueSatoshis,
      0n
    );

    const outputs = [
      ...recipientVouts,
      ...preparedTokenChange,
      ...prepareSatsChange(inputs, recipientVouts, fee + tokenChangeAmount),
    ];

    const finalOutputTotal = outputs.reduce(
      (sum, cur) => sum + cur.valueSatoshis,
      0n
    );

    const transaction = compileP2pkhTransaction(inputs, outputs);
    Log.debug("buildP2pkhTransaction transaction", transaction);

    if (fee < transaction.minimumFee) {
      Log.debug("fee less than minimum, retrying", fee, transaction.minimumFee);
      return buildP2pkhTransaction({
        recipients,
        selection,
        nftSelection,
        fee: transaction.minimumFee,
        gas,
        depth: depth + 1,
      });
    }

    // insufficient funds
    if (inputTotal - fee < finalOutputTotal) {
      const short = (inputTotal - fee - finalOutputTotal) * -1n;
      Log.debug(
        "buildP2pkhTransaction: insufficient funds",
        inputTotal,
        finalOutputTotal,
        fee,
        short
      );

      if (
        (hasTokens || hasNft) &&
        wallet.spendable_balance >= finalOutputTotal + fee
      ) {
        Log.debug("token tx attempting to gas up", short);

        return buildP2pkhTransaction({
          recipients,
          nftSelection,
          fee,
          gas: short + gas,
          depth: depth + 1,
        });
      }

      return short;
    }

    // ----------------

    function prepareTokenChange(vin, vout) {
      const tokenVin = vin.filter((input) => input.token_category !== null);

      const tokenOutputs = vout.filter(
        (output) => output.token && output.token.category !== null
      );

      // calculate total input amounts for each token category
      const tokenCategoryInputAmounts = tokenVin.reduce(
        (tokenAmounts, input) => {
          const category = input.token_category;

          if (input.nft_capability !== null) {
            return tokenAmounts;
          }

          const mapAmount = tokenAmounts.get(category) || 0n;
          tokenAmounts.set(category, mapAmount + input.token_amount);

          return tokenAmounts;
        },
        new Map<string, bigint>()
      );

      // calculate total output amounts for each token category
      const tokenCategoryOutputAmounts = tokenOutputs.reduce(
        (amounts, output) => {
          if (!output.token || output.token.nft) {
            return amounts;
          }

          const { category, amount } = output.token;

          const categoryHex = binToHex(category);
          const categoryAmount = amounts.get(categoryHex) || 0n;
          amounts.set(categoryHex, categoryAmount + amount);

          return amounts;
        },
        new Map<string, bigint>()
      );

      Log.debug(
        "prepareTokenChange",
        tokenVin,
        tokenOutputs,
        tokenCategoryInputAmounts,
        tokenCategoryOutputAmounts
      );

      // get change addresses
      const AddressManager = AddressManagerService(wallet.walletHash);
      const changeAddresses = AddressManager.getUnusedAddresses(
        tokenCategories.length + 1,
        1
      );

      // create token change outputs for each category
      const tokenChangeVouts = [];
      while (tokenCategories.length > 0) {
        // each category gets its own change address
        const category = tokenCategories.shift() as string;
        const changeAddress = changeAddresses.shift() as AddressEntity;

        // get amount of tokens spent; remainder is change
        const tokenAmountIn = tokenCategoryInputAmounts.get(category) || 0n;
        const tokenAmountOut = tokenCategoryOutputAmounts.get(category) || 0n;

        const tokenChange = tokenAmountIn - tokenAmountOut;

        const tokenChangeOutput = createTokenOutput(changeAddress.address, {
          category,
          amount: tokenChange,
        });

        if (tokenChange > 0 && tokenChangeOutput.valueSatoshis > 0) {
          Log.debug("tokenChangeOutput", tokenChangeOutput);
          tokenChangeVouts.push(tokenChangeOutput);
        }
      }

      Log.debug("tokenChangeVouts", tokenChangeVouts);
      return tokenChangeVouts;
    }

    function prepareSatsChange(vin, vout, txFee) {
      const satsInputTotal = vin.reduce((sum, cur) => sum + cur.amount, 0n);

      const satsOutputTotal = vout.reduce(
        (sum, cur) => sum + cur.valueSatoshis,
        0n
      );

      const changeAmount = satsInputTotal - satsOutputTotal - txFee;

      // get change addresses
      const AddressManager = AddressManagerService(wallet.walletHash);
      const changeAddresses = AddressManager.getUnusedAddresses(1, 1);
      const changeAddress = changeAddresses.shift();

      const changeOutput = createCoinOutput(
        changeAddress.address,
        changeAmount
      );

      const dustThreshold = getDustThreshold(changeOutput, DUST_RELAY_FEE);

      // only add change to the tx if it isn't dust.
      const changeVouts = [];
      if (changeAmount >= dustThreshold) {
        changeVouts.push(changeOutput);
      }

      return changeVouts;
    }

    // --------
    function compileP2pkhTransaction(vin, vout) {
      // initialize transaction compiler
      const template = assertSuccess(
        importWalletTemplate(walletTemplateP2pkhNonHd)
      );
      const compiler = walletTemplateToCompilerBCH(template);

      // sign inputs
      const HdNode = HdNodeService(wallet);
      const signedInputs = HdNode.signInputs(
        vin.sort(bip69SortInputs),
        compiler
      );

      const generatedTx = generateTransaction({
        inputs: signedInputs,
        outputs: vout.sort(bip69SortOutputs),
        locktime: 0,
        version: 2,
      });

      if (generatedTx.success === false) {
        Log.warn("tx generation failed", generatedTx);
        throw new Error(JSON.stringify(generatedTx));
      }

      Log.debug("compileP2pkhTransaction", vin, vout, generatedTx);

      const tx_raw = encodeTransaction(generatedTx.transaction);
      const tx_hex = binToHex(tx_raw);
      const tx_hash = swapEndianness(
        binToHex(sha256.hash(sha256.hash(tx_raw)))
      );

      const minimumFee = getMinimumFee(BigInt(tx_raw.length), DUST_RELAY_FEE);

      return { tx_hash, tx_hex, minimumFee };
    }

    return transaction;
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
    if (!a.token && b.token) {
      return -1;
    }

    if (a.token && !b.token) {
      return 1;
    }

    if (a.token.token_amount < b.token.token_amount) {
      return -1;
    }

    if (a.token.token_amount > b.token.token_amount) {
      return 1;
    }

    if (!a.token.nft && b.token.nft) {
      return -1;
    }

    if (a.token.nft && !b.token.nft) {
      return -1;
    }

    if (a.token.nft && b.token.nft) {
      const capabilityRank = ["none", "mutable", "minting"];
      const aRank = capabilityRank.findIndex(
        (c) => a.token.nft.capability === c
      );
      const bRank = capabilityRank.findIndex(
        (c) => b.token.nft.capability === c
      );

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
    }

    if (a.token.category < b.token.category) {
      return -1;
    }

    if (a.token.category > b.token.category) {
      return 1;
    }

    return 0;
  }

  function buildSendTokensTransactionWithFeePayingTokenCategory({
    recipients,
    selection,
    exchangeLab,
    inputPools,
    feePayingTokenCategory,
  }: {
    recipients: Array<{
      address: string;
      token: {
        category: string;
        amount: bigint;
      };
    }>;
    selection?: Array<TransactionOutput>;
    exchangeLab: cauldron.ExchangeLab;
    inputPools: cauldron.PoolV0[];
    feePayingTokenCategory: string;
  }): {
    tradeResult: cauldron.TradeResult;
    tradeTransaction: cauldron.TradeTxResult;
  } {
    const UtxoManager = UtxoManagerService(wallet.walletHash);
    const tokenOutputAmountsByCategory = recipients.reduce(
      (amounts, output) => {
        // calculate total output amounts for each token category
        if (output.token == null) {
          throw new clab.ValueError(`recipient.token is null`);
        }
        const { category, amount } = output.token;
        const categoryAmount = amounts.get(category) || 0n;
        amounts.set(category, categoryAmount + amount);
        return amounts;
      },
      new Map<string, bigint>()
    );
    const tokenCategories = Array.from(tokenOutputAmountsByCategory.keys());
    if (tokenCategories.length === 0) {
      throw new clab.ValueError(
        `Should at least send one token to a recipient.`
      );
    }
    const inputs =
      selection?.length > 0
        ? selection
        : tokenCategories
            .map((category) => {
              if (!tokenOutputAmountsByCategory.has(category)) {
                return [];
              }
              return UtxoManager.selectTokens(
                category,
                tokenOutputAmountsByCategory.get(category)
              ).filter((utxo) => utxo.nft_commitment == null);
            })
            .flat();
    if (inputs.length === 0) {
      throw new clab.InsufficientFunds(`No inputs found.`);
    }
    const HdNode = HdNodeService(wallet);
    const inputCoins: clab.SpendableCoin[] = inputs.map((input) => {
      return {
        type: clab.SpendableCoinType.P2PKH,
        key: HdNode.getAddressPrivateKey(input.address),
        output: {
          locking_bytecode: addressToLockingBytecode(input.address),
          token: {
            amount: BigInt(input.token_amount),
            token_id: input.token_category,
          },
          amount: BigInt(input.amount),
        },
        outpoint: {
          txhash: hexToBin(input.txid),
          index: Number(input.tx_pos),
        },
      };
    });
    const AddressManager = AddressManagerService(wallet.walletHash);
    const changeAddresses = AddressManager.getUnusedAddresses(
      tokenCategories.length + 1,
      1
    );
    let lastChangeAddressIndex = 0;
    const payoutRules: clab.PayoutRule[] = [
      ...recipients.map((r) => ({
        type: clab.PayoutAmountRuleType.FIXED,
        locking_bytecode: addressToLockingBytecode(r.address),
        token: {
          token_id: r.token.category,
          amount: r.token.amount,
        },
        amount: -1n,
      })),
      {
        type: clab.PayoutAmountRuleType.CHANGE,
        /* eslint-disable @typescript-eslint/no-unused-vars */
        generateChangeLockingBytecodeForOutput(output: clab.Output) {
          const changeAddress = changeAddresses[lastChangeAddressIndex];
          if (lastChangeAddressIndex + 1 < changeAddresses.length) {
            lastChangeAddressIndex += 1;
          }
          return addressToLockingBytecode(changeAddress.address);
        },
        allow_mixing_native_and_token_when_bch_change_is_dust: true,
      },
    ];
    let requiredBch = 2000n; // initial amount
    const tradeResult = exchangeLab.constructTradeBestRateForTargetDemand(
      feePayingTokenCategory,
      "BCH",
      requiredBch,
      inputPools,
      TXFEE_PER_BYTE
    );
    let maxTry = 5;
    while (maxTry > 0) {
      try {
        const tradeTransaction = exchangeLab.createTradeTx(
          tradeResult.entries,
          inputCoins,
          payoutRules,
          null,
          TXFEE_PER_BYTE
        );
        return { tradeResult, tradeTransaction };
      } catch (err) {
        if (err instanceof clab.InsufficientFunds) {
          requiredBch += err.required_amount;
        } else {
          throw err;
        }
      }
      maxTry -= 1;
    }
    throw new clab.ValueError(`max try attempts to construct a trade reached.`);
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
