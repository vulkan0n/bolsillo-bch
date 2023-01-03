import { emit } from "react-native-react-bridge/lib/web";
import { RESPONSE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { CoinType, SeleneAddressType } from "@selene-wallet/common/dist/types";

export const getSeleneAddressAtIndex = async (
  WalletObject: any,
  mnemonic: string,
  hdWalletIndex: number
): Promise<SeleneAddressType> => {
  const hdWallet = await WalletObject.fromSeed(
    mnemonic,
    `m/44'/0'/0'/0/${hdWalletIndex}`
  );

  const hdWalletUtxos = await hdWallet.getAddressUtxos(hdWallet.cashaddr);
  // Scans only a very short history
  // Addresses that have a much longer history are then rescanned with a heavier check
  const shortTransactions = (await hdWallet.getHistory("sat", 0, 5))
    .transactions;

  const transactions =
    shortTransactions.length >= 5
      ? (await hdWallet.getHistory("sat", 0, 100)).transactions
      : shortTransactions;

  const coins: CoinType[] = hdWalletUtxos.map((coin) => ({
    height: coin.height,
    transactionId: coin.txid,
    outputIndex: coin.vout,
    satoshis: coin.satoshis,
    address: hdWallet.cashaddr,
    addressIndex: hdWalletIndex,
  }));

  return {
    hdWalletIndex,
    cashaddr: hdWallet.cashaddr,
    coins,
    transactions,
  };
};

export const sendCoins = async (WalletObject, message) => {
  try {
    const suitableCoins: CoinType[] = message.data.coins.filter(
      (coin) => !coin.token
    );
    const satoshiAmountAvailable: number = suitableCoins.reduce(
      (sum, coin) => sum + coin.satoshis,
      0
    );

    if (message?.data?.satsToSend > satoshiAmountAvailable) {
      throw new Error("Not enough funds");
    }

    // initialize libauth template and compiler
    const template = libauth.importAuthenticationTemplate(
      libauth.authenticationTemplateP2pkhNonHd
    );
    const compiler = await libauth.authenticationTemplateToCompilerBCH(
      template
    );

    // utility function to get the locking bytecode from cashaddr
    const cashAddressToLockingBytecode = (cashaddr) => {
      const outputLockingBytecode =
        libauth.cashAddressToLockingBytecode(cashaddr);
      if (typeof outputLockingBytecode === "string")
        throw new Error(outputLockingBytecode);
      return outputLockingBytecode.bytecode;
    };

    // reusable function to build transaction for fee estimation and final transaction given the fee
    const buildTransaction = async (fee: number) => {
      const changeAmount =
        satoshiAmountAvailable - message?.data?.satsToSend - fee;
      const outputs = [
        {
          lockingBytecode: cashAddressToLockingBytecode(
            message?.data?.recipientCashAddr
          ),
          valueSatoshis: BigInt(message?.data?.satsToSend),
        },
      ];

      // discard dust change
      if (changeAmount >= 546) {
        outputs.push({
          lockingBytecode: cashAddressToLockingBytecode(
            message?.data?.changeAddress
          ),
          valueSatoshis: BigInt(changeAmount),
        });
      }

      const signCoin = async (coin) => ({
        outpointIndex: coin.outputIndex,
        outpointTransactionHash: libauth.hexToBin(coin.transactionId),
        sequenceNumber: 0,
        unlockingBytecode: {
          compiler,
          data: {
            keys: {
              privateKeys: {
                key: (
                  await WalletObject.fromSeed(
                    message?.data?.wallet?.mnemonic,
                    `m/44'/0'/0'/0/${coin.addressIndex}`
                  )
                ).privateKey,
              },
            },
          },
          valueSatoshis: BigInt(coin.satoshis),
          script: "unlock",
        },
      });

      const inputs = await Promise.all(suitableCoins.map(signCoin));

      const result = libauth.generateTransaction({
        inputs,
        outputs,
        locktime: 0,
        version: 2,
      });

      if (!result.success) {
        throw "Error building transaction";
      }

      return libauth.encodeTransaction(result.transaction);
    };

    // smallest fee - 220 bytes for single input two outputs (recipient and change)
    const estimatedTx = await buildTransaction(220);
    const fee = estimatedTx.length;

    // rebuild transaction with the estimated fee
    const finalTx = await buildTransaction(fee);

    // get a transient wallet and send the built transaction
    const tempWallet = await WalletObject.newRandom();
    const result = await tempWallet.submitTransaction(finalTx, true);
    console.log("Sent transaction hash:", { result });

    if (result) {
      // Transaction was submitted to network, can display success screen
      emit({
        type: RESPONSE_MESSAGE_TYPES.SEND_COINS_SUBMITTED,
        data: {},
      });
    }

    // Pass back the spent UTXOS and updated change address for the wallet
    const updatedChangeAddress = await getSeleneAddressAtIndex(
      WalletObject,
      message?.data?.wallet?.mnemonic,
      message?.data?.changeAddressHdIndex
    );

    emit({
      type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE,
      data: {
        name: message?.data?.wallet?.name,
        spentUTXOs: suitableCoins,
        updatedChangeAddress,
        // transactionHistory,
      },
    });
  } catch (sendError) {
    console.trace("!!!!!!!!");

    emit({
      type: RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_FAIL,
      data: {
        text: sendError?.message || "",
      },
    });
  }
};

export const getWalletHistory = async (WalletObject, message) => {
  console.log("calling getWalletHistory");
  const maxIndex = message?.data?.maxAddressIndex || 0;
  const addressIndices = [...Array(maxIndex + 1).keys()];
  const addressHistory = async (index) => {
    const wallet = await WalletObject.fromSeed(
      message?.data?.mnemonic,
      `m/44'/0'/0'/0/${index}`
    );

    return (await wallet.getHistory("sat", 0, 100)).transactions;
  };
  const allHistories = await Promise.all(addressIndices.map(addressHistory));
  const transactionHistory = allHistories.flat(1);
  emit({
    type: RESPONSE_MESSAGE_TYPES.GET_WALLET_HISTORY_RESPONSE,
    data: {
      name: message?.data?.name,
      transactionHistory: { transactions: transactionHistory },
    },
  });
};
