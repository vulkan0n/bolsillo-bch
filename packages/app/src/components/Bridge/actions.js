import { emit } from "react-native-react-bridge/lib/web";
import { RESPONSE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";

export const sendCoins = async (WalletObject, message) => {
  const walletSendCoins = await WalletObject.fromSeed(
    message?.data?.mnemonic,
    message?.data?.derivationPath
  );

  try {
    const suitableCoins = message.data.coins.filter(coin => !coin.token);
    const satoshiAmountAvailable = suitableCoins.reduce((sum, coin) => sum + coin.satoshis, 0);

    if (message?.data?.satsToSend > satoshiAmountAvailable) {
      throw new Error("Not enough funds");
    }

    // initialize libauth template and compiler
    const template = libauth.importAuthenticationTemplate(
      libauth.authenticationTemplateP2pkhNonHd
    );
    const compiler = await libauth.authenticationTemplateToCompilerBCH(template);

    // utility function to get the locking bytecode from cashaddr
    const cashAddressToLockingBytecode = (cashaddr) => {
      const outputLockingBytecode = libauth.cashAddressToLockingBytecode(cashaddr);
      if (typeof outputLockingBytecode === "string")
        throw new Error(outputLockingBytecode);
      return outputLockingBytecode.bytecode;
    }

    // reusable function to build transaction for fee estimation and final transaction given the fee
    const buildTransaction = async (fee) => {
      const changeAmount = satoshiAmountAvailable - message?.data?.satsToSend - fee;
      const outputs = [{
        lockingBytecode: cashAddressToLockingBytecode(message?.data?.recipientCashAddr),
        valueSatoshis: BigInt(message?.data?.satsToSend),
      }];

      // discard dust change
      if (changeAmount >= 546) {
        outputs.push({
          lockingBytecode: cashAddressToLockingBytecode(message?.data?.changeAddress),
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
            keys: { privateKeys: { key: (await WalletObject.fromSeed(
              message?.data?.mnemonic,
              `m/44'/0'/0'/0/${coin.addressIndex}`
            )).privateKey } },
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
    }

    // smallest fee - 220 bytes for single input two outputs (recipient and change)
    const estimatedTx = await buildTransaction(220);
    const fee = estimatedTx.length;

    // rebuild transaction with the estimated fee
    const finalTx = await buildTransaction(fee);

    // get a transient wallet and send the built transaction
    const tempWallet = await WalletObject.newRandom();
    await tempWallet.submitTransaction(finalTx, true);

    // Note: Monitoring .send() response for send confirmation
    // is unreliable and buggy
    // Instead, successful sends are detected by balance changes
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
      transactionHistory: {transactions: transactionHistory},
    },
  });

};
