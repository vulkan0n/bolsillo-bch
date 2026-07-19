import {
  assertSuccess,
  encodeTransaction,
  generateTransaction,
  getDustThreshold,
  getMinimumFee,
  importWalletTemplate,
  Output as LibauthOutput,
  swapEndianness,
  walletTemplateP2pkhNonHd,
  walletTemplateToCompilerBCH,
} from "@bitauth/libauth";

import { ExchangeLab } from "@cashlab/cauldron";
import type { TradeResult } from "@cashlab/cauldron";
import {
  PayoutAmountRuleType,
  SpendableCoin,
  SpendableCoinType,
} from "@cashlab/common";
import type { PayoutRule } from "@cashlab/common";

import CauldronService from "@/kernel/bch/CauldronService";
import LogService from "@/kernel/app/LogService";
import {
  TransactionOutput,
  TransactionStub,
} from "@/kernel/bch/TransactionManagerService";
import AddressManagerService from "@/kernel/wallet/AddressManagerService";
import KeyManagerService from "@/kernel/wallet/KeyManagerService";
import UtxoManagerService, {
  UtxoEntity,
} from "@/kernel/wallet/UtxoManagerService";
import WalletManagerService from "@/kernel/wallet/WalletManagerService";

import { addressToLockingBytecode } from "@/util/cashaddr";
import { sha256 } from "@/util/hash";
import { binToHex, compareBytes, hexToBin } from "@/util/hex";
import { DUST_RELAY_FEE } from "@/util/sats";
import { PUSD_TOKENID } from "@/util/tokens";

export interface Recipient {
  address: string;
  amount: bigint;
}

export type StablecoinTransactionStub = TransactionStub & {
  tradeResult: TradeResult;
};

const TXFEE_PER_BYTE = DUST_RELAY_FEE / 1000n;

const Log = LogService("TxBuilder");

export class TransactionBuilderError extends Error {}

export default function TransactionBuilderService(walletHash: string) {
  const WalletManager = WalletManagerService();
  const wallet = WalletManager.getWallet(walletHash);

  return {
    buildP2pkhTransaction,
    buildStablecoinTransaction,
    calculateTransactionHash,
  };

  // --------------------------------

  function calculateTransactionHash(tx_raw: Uint8Array): string {
    const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));
    return tx_hash;
  }

  function createCoinOutput(recipientAddress, amount): LibauthOutput {
    const output = {
      lockingBytecode: addressToLockingBytecode(recipientAddress),
      valueSatoshis: amount,
    };

    Log.debug("createCoinOutput", output);
    return output;
  }

  function prepareOutputsFromRecipients(
    recipients: Array<Recipient>
  ): Array<LibauthOutput> {
    return recipients.map((recipient) =>
      createCoinOutput(recipient.address, recipient.amount)
    );
  }

  function buildP2pkhTransaction({
    recipients,
    fee = 0n,
    depth = 0,
    selection = [],
  }: {
    recipients: Array<Recipient>;
    fee?: bigint;
    depth?: number;
    selection?: Array<TransactionOutput>;
  }): TransactionStub | bigint {
    const hasSelection = selection.length > 0;

    Log.debug("buildP2pkhTransaction depth", depth);
    const recipientVouts = prepareOutputsFromRecipients(recipients);
    const recipientOutputTotal = recipientVouts.reduce(
      (sum, cur) => sum + cur.valueSatoshis,
      0n
    );

    const sendTotal = recipientOutputTotal + fee;

    Log.debug(
      "buildP2pkhTransaction recipients:",
      recipientVouts,
      recipientOutputTotal,
      fee,
      sendTotal
    );

    const UtxoManager = UtxoManagerService(wallet.walletHash);
    const coinInputs = UtxoManager.selectCoins(recipientOutputTotal + fee);

    const inputs = hasSelection ? selection : coinInputs;

    const inputTotal = inputs.reduce((sum, cur) => sum + cur.valueSatoshis, 0n);
    Log.debug("buildP2pkhTransaction using inputs:", inputs, inputTotal);

    if (inputTotal < sendTotal) {
      return sendTotal;
    }

    const outputs = finalizeChange(inputs, recipientVouts, fee);

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
        fee: transaction.minimumFee,
        depth: depth + 1,
      });
    }

    if (inputTotal < finalOutputTotal) {
      const short = finalOutputTotal - inputTotal;
      return short;
    }

    // ----------------

    function finalizeChange(vin, vout, txFee): Array<LibauthOutput> {
      const satsInputTotal = vin.reduce(
        (sum, cur) => sum + cur.valueSatoshis,
        0n
      );

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

      const changeVouts: Array<LibauthOutput> = [];
      const temp_vout = [...vout];

      // only add change to the tx if it isn't dust.
      const dustThreshold = getDustThreshold(changeOutput, DUST_RELAY_FEE);

      if (changeAmount >= dustThreshold) {
        changeVouts.push(changeOutput);
      } else if (changeAmount > txFee) {
        const lastOutput = temp_vout.pop();
        lastOutput.valueSatoshis += changeAmount;
        temp_vout.push(lastOutput);
      }

      return [...temp_vout, ...changeVouts];
    }

    // ----------------
    function compileP2pkhTransaction(vin, vout) {
      // initialize transaction compiler
      const template = assertSuccess(
        importWalletTemplate(walletTemplateP2pkhNonHd)
      );
      const compiler = walletTemplateToCompilerBCH(template);

      // sign inputs
      const KeyManager = KeyManagerService(wallet);
      const signedInputs = KeyManager.signInputs(
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
      const hex = binToHex(tx_raw);
      const tx_hash = swapEndianness(
        binToHex(sha256.hash(sha256.hash(tx_raw)))
      );

      const minimumFee = getMinimumFee(BigInt(tx_raw.length), DUST_RELAY_FEE);

      return { tx_hash, hex, minimumFee };
    }

    return transaction;
  }

  // -------------------------------- (64)
  // buildStablecoinTransaction: Atomic PUSD→BCH swap + BCH payment
  // Called when stablecoinMode is ON and spendable_balance < recipient amount.
  // Constructs a single transaction that:
  //   1. Swaps PUSD tokens → BCH via Cauldron ExchangeLab
  //   2. Pays the recipient in BCH
  //   3. Returns PUSD change (excess tokens) and BCH change to the wallet
  // --------------------------------

  async function buildStablecoinTransaction({
    recipients,
    tradeSats,
    fee = 0n,
  }: {
    recipients: Array<Recipient>;
    tradeSats: bigint;
    fee?: bigint;
  }): Promise<StablecoinTransactionStub | bigint> {
    const Cauldron = CauldronService();
    const exchangeLab = new ExchangeLab();
    const UtxoManager = UtxoManagerService(wallet.walletHash);

    // 1. Get fresh pool data from the Cauldron registry
    //    (fetchPools must be called before calling buildStablecoinTransaction)
    const inputPools = Cauldron.getPoolInputs(PUSD_TOKENID);
    if (inputPools.length === 0) {
      throw new TransactionBuilderError(
        "Cauldron pool unavailable — no PUSD pool data"
      );
    }

    const recipientAmount = recipients.reduce(
      (sum, cur) => sum + cur.amount,
      0n
    );

    const price = Cauldron.getTokenPrice(PUSD_TOKENID);
    Log.debug(
      `buildStablecoinTransaction: price=${price} sats/unit, recipientAmount=${recipientAmount}, tradeSats=${tradeSats}`
    );

    // 2. Construct trade: supply PUSD → demand BCH for `tradeSats`
    let tradeResult;
    try {
      tradeResult = exchangeLab.constructTradeBestRateForTargetDemand(
        PUSD_TOKENID,
        "BCH",
        tradeSats,
        inputPools,
        1n
      );
    } catch (e) {
      Log.warn("buildStablecoinTransaction: trade construction failed", e);
      return recipientAmount + 1n;
    }

    // 3. Select token UTXOs to cover the supply side of the trade
    const stablecoinUtxos = UtxoManager.selectTokens(
      PUSD_TOKENID,
      tradeResult.summary.supply
    );
    if (stablecoinUtxos.length === 0) {
      Log.debug("buildStablecoinTransaction: insufficient PUSD UTXOs");
      return recipientAmount + 1n;
    }

    // 4. Select BCH coin UTXOs for the reserve (recipient amount minus swapped sats + fee)
    const reserveSats = recipientAmount - tradeSats + fee;
    const coinUtxos = UtxoManager.selectCoins(reserveSats);
    const inputs = [...stablecoinUtxos, ...coinUtxos];

    // 5. Build SpendableCoin inputs for ExchangeLab
    const KeyManager = KeyManagerService(wallet);
    const clabInputs: SpendableCoin[] = inputs.map((input) => ({
      type: SpendableCoinType.P2PKH,
      key: KeyManager.getAddressPrivateKey(input.address),
      output: {
        locking_bytecode: addressToLockingBytecode(input.address),
        token:
          (input.token_amount ?? 0n) > 0n
            ? {
                amount: input.token_amount,
                token_id: input.token_category,
              }
            : undefined,
        amount: input.valueSatoshis,
      },
      outpoint: {
        txhash: hexToBin(input.tx_hash),
        index: input.tx_pos,
      },
    }));

    // 6. Build payout rules: recipient (fixed BCH) + change outputs
    const AddressManager = AddressManagerService(wallet.walletHash);
    const changeAddresses = AddressManager.getUnusedAddresses(2, 1);
    let changeAddressIndex = 0;

    const payoutRules: PayoutRule[] = [
      // Recipient receives BCH (no tokens — plain P2PKH output)
      {
        type: PayoutAmountRuleType.FIXED,
        locking_bytecode: addressToLockingBytecode(recipients[0].address),
        amount: recipientAmount,
      },
      // Change: handles both BCH dust and excess PUSD tokens
      {
        type: PayoutAmountRuleType.CHANGE,
        generateChangeLockingBytecodeForOutput() {
          const changeAddress = changeAddresses[changeAddressIndex];
          if (changeAddressIndex + 1 < changeAddresses.length) {
            changeAddressIndex += 1;
          }
          return addressToLockingBytecode(changeAddress.address);
        },
        allow_mixing_native_and_token_when_bch_change_is_dust: true,
      },
    ];

    // 7. Build the combined swap + pay transaction
    let tradeTx;
    try {
      tradeTx = exchangeLab.createTradeTx(
        tradeResult.entries,
        clabInputs,
        payoutRules,
        null,
        TXFEE_PER_BYTE
      );
    } catch (e) {
      // If InsufficientFunds has required_amount, retry with bumped fee
      if (
        e &&
        typeof e === "object" &&
        "required_amount" in e &&
        e.required_amount
      ) {
        Log.debug(
          "buildStablecoinTransaction: retry with bumped fee",
          e.required_amount
        );
        return buildStablecoinTransaction({
          recipients,
          tradeSats: tradeSats + (e.required_amount as bigint),
          fee: 0n,
        });
      }
      Log.warn("buildStablecoinTransaction: createTradeTx failed", e);
      return recipientAmount + 1n;
    }

    if (!tradeTx) {
      Log.debug("buildStablecoinTransaction: no transaction returned");
      return recipientAmount + 1n;
    }

    // 8. Encode and return
    const tx_raw = tradeTx.txbin;
    const hex = binToHex(tx_raw);
    const tx_hash = swapEndianness(binToHex(sha256.hash(sha256.hash(tx_raw))));

    return {
      hex,
      tx_hash,
      tradeResult,
    };
  }

  function bip69SortInputs(a, b) {
    // BIP69: compare tx_hash as hex strings, then tx_pos as numbers
    if (a.tx_hash < b.tx_hash) return -1;
    if (a.tx_hash > b.tx_hash) return 1;
    return a.tx_pos - b.tx_pos;
  }

  function bip69SortOutputs(a, b) {
    if (a.valueSatoshis < b.valueSatoshis) return -1;
    if (a.valueSatoshis > b.valueSatoshis) return 1;
    return compareBytes(a.lockingBytecode, b.lockingBytecode);
  }
}

// TODO: Once Token support is added to CashStamps, add it to this function too.
//       It will require more complex logic: An output will need to be added per each token.
export function buildSweepTransaction(
  utxos: Array<UtxoEntity>,
  privateKey: Uint8Array,
  receivingAddress: string
): TransactionStub {
  // Filter out token-bearing UTXOs — sweep only supports BCH.
  const bchUtxos = utxos.filter((u) => u.token_category === null);
  if (bchUtxos.length !== utxos.length) {
    const skipped = utxos.length - bchUtxos.length;
    Log.warn(
      `buildSweepTransaction: skipped ${skipped} token UTXO(s) — sweep only supports BCH`
    );
  }

  // Convert the receiving address to locking bytecode.
  const receivingBytecode = addressToLockingBytecode(receivingAddress);

  // If we could not convert it successfully, throw an error.
  if (typeof receivingBytecode === "string") {
    throw new Error(receivingBytecode);
  }

  // Create our P2PKH Compiler.
  const compilerP2pkh = walletTemplateToCompilerBCH(walletTemplateP2pkhNonHd);

  // Compile our inputs (token UTXOs already filtered above).
  const inputDirectives = bchUtxos.map((unspent) => ({
    outpointIndex: unspent.tx_pos,
    outpointTransactionHash: hexToBin(unspent.tx_hash),
    sequenceNumber: 0,
    unlockingBytecode: {
      compiler: compilerP2pkh,
      data: {
        keys: { privateKeys: { key: privateKey } },
      },
      script: "unlock",
      valueSatoshis: unspent.valueSatoshis,
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
          lockingBytecode: receivingBytecode,
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

  // Calculate the tx_hash and convert the transaction to hex format.
  const tx_hash = swapEndianness(
    binToHex(sha256.hash(sha256.hash(encodedTransaction)))
  );
  const hex = binToHex(encodedTransaction);

  // Return the transaction.
  return {
    tx_hash,
    hex,
  };
}
