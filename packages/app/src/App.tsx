import * as React from "react";
import { DeviceEventEmitter, View, Text, AppState } from "react-native";
import {
  useFonts,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from "@expo-google-fonts/montserrat";
import WebView from "react-native-webview";
import { useWebViewMessage } from "react-native-react-bridge";
import NavigationTree from "./components/NavigationTree";
import BackgroundIntervals from "./components/BackgroundIntervals";
import Bridge from "./components/Bridge";
import Button from "./components/atoms/Button";
import { RESPONSE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store from "./redux/store";
import persistor from "./redux/persistor";
import Toast from "react-native-toast-message";
import toastConfig from "./config/toast";
import preloadMainNetScript from "./config/preloadMainNetScript";
import {
  WalletType,
  CoinType,
  SeleneAddressType,
} from "@selene-wallet/common/dist/types";
import {
  createDefaultWallet,
  updateNewWalletScratchPadDetails,
  importWalletTransactionHistory,
  mergeSeleneAddressToWallet,
  mergeSeleneAddressesToWallet,
  updateSpendingWalletAddressesAndUTXOs,
} from "./redux/reducers/walletManagerReducer";
import {
  updateTransactionPadIsSendingCoins,
  clearTransactionPad,
} from "./redux/reducers/transactionPadReducer";
import { navigate } from "./components/NavigationTree/rootNavigation";
import { updateLocalLastSentTransactionHash } from "./redux/reducers/localReducer";
import { IS_WEB } from "@selene-wallet/app/src/utils/isWeb";
import { ApolloProvider } from "@apollo/client";
import apolloClient from "./apolloClient";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import COLOURS from "@selene-wallet/common/design/colours";
import {
  electrum,
  loadElectrumCash,
  getCashAddressUTXOs,
} from "@selene-wallet/app/src/utils/electrum-cash";

export interface TransactionHistoryTxType {
  blockheight: number;
  txn: string;
  transactionId: string;
  balance: number;
  fee: number;
  from: string;
  to: string;
  index: number;
  unit: string;
  value: number;
}

interface BridgeResponseMessage {
  type: string;
  data: {
    name?: string;
    wallet?: WalletType;
    balance?: string;
    lastSentTransactionHash?: string;
    title?: string;
    text?: string;
    cashaddr?: string;
    maxAddressIndex?: number;
    coins?: CoinType[];
    spentUTXOs: CoinType[];
    transactionHistory?: {
      transactions: TransactionHistoryTxType[];
    };
    seleneAddress: SeleneAddressType;
    updatedChangeAddress: SeleneAddressType;
    addressFragments?: [
      {
        hdWalletIndex: number;
        cashaddr: string;
      }
    ];
  };
}

export default function App() {
  // For the list of possible font faces
  // https://github.com/expo/google-fonts/tree/master/font-packages/montserrat
  const [fontsLoaded] = useFonts({
    Montserrat_400Regular,
    Montserrat_500Medium,
    Montserrat_600SemiBold,
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
  });

  const [isReloading, setIsReloading] = React.useState(false);

  // useWebViewMessage hook create props for WebView and handle communication
  // The argument is callback to receive message from React
  const { ref, onMessage, emit } = useWebViewMessage(
    async (message: BridgeResponseMessage) => {
      // console.log("Bridge Response Message: ", message);
      switch (message.type) {
        case RESPONSE_MESSAGE_TYPES.CREATE_DEFAULT_WALLET_RESPONSE:
          store.dispatch(
            createDefaultWallet({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
              maxAddressIndex: 0,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.CREATE_SCRATCHPAD_WALLET_RESPONSE:
          store.dispatch(
            updateNewWalletScratchPadDetails({
              mnemonic: message.data.wallet.mnemonic,
              derivationPath: message.data.wallet.derivationPath,
              cashaddr: message.data.wallet.cashaddr,
              maxAddressIndex: 0,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.GRAB_CASHADDRESS_AT_INDICES_RESPONSE:
          const seleneAddresses = await Promise.all(
            message?.data?.addressFragments.map(async (chosenAddress) => {
              console.log({ chosenAddress });
              const unspentUTXOsRawData = await getCashAddressUTXOs(
                chosenAddress?.cashaddr
              );

              const unspentUTXOs = unspentUTXOsRawData.map((coin) => ({
                height: coin.height,
                transactionId: coin.tx_hash,
                outputIndex: coin.tx_pos,
                satoshis: coin.value,
                address: chosenAddress.cashaddr,
                addressIndex: chosenAddress.hdWalletIndex,
              }));

              const seleneAddress = {
                hdWalletIndex: chosenAddress?.hdWalletIndex,
                cashaddr: chosenAddress.cashaddr,
                coins: unspentUTXOs,
                // await getTransactionDetails(hash)
                // TODO: Import the transaction history from above
                // const addressWithTransactions = await extractTransactionHistory(
                //   message?.data?.addressFragments[1]
                // );
                // const hash = addressWithTransactions.transactions[0].tx_hash;
                // console.log({ addressWithTransactions, hash });
                // const transactionDetails = await getTransactionDetails(hash);
                // console.log(transactionDetails);
                transactions: [],
              };

              return seleneAddress;
            })
          );

          store.dispatch(
            mergeSeleneAddressesToWallet({
              name: message.data.name,
              seleneAddresses,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.SCAN_ADDRESS_AT_INDEX_RESPONSE:
          store.dispatch(
            mergeSeleneAddressToWallet({
              name: message.data.name,
              seleneAddress: message.data.seleneAddress,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE_FAIL:
          store.dispatch(
            updateTransactionPadIsSendingCoins({
              isSendingCoins: false,
            })
          );

          const text = message?.data?.text ?? "";
          Toast.show({
            type: "customError",
            props: {
              title: "Transaction failed",
              text,
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.GET_WALLET_HISTORY_RESPONSE:
          store.dispatch(
            importWalletTransactionHistory({
              name: message?.data?.name,
              transactionHistory: message?.data?.transactionHistory,
            })
          );
          break;

        case RESPONSE_MESSAGE_TYPES.ERROR:
          Toast.show({
            type: "customError",
            props: {
              title: message?.data?.title ?? "",
              text: message?.data?.text ?? "",
            },
          });
          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_SUBMITTED:
          const isSendingCoins =
            store.getState()?.transactionPad?.isSendingCoins;

          if (isSendingCoins) {
            navigate("Transaction Success Modal");
          }

          store.dispatch(
            updateTransactionPadIsSendingCoins({
              isSendingCoins: false,
            })
          );

          break;

        case RESPONSE_MESSAGE_TYPES.SEND_COINS_RESPONSE:
          if (message?.data?.transactionHistory) {
            store.dispatch(
              importWalletTransactionHistory({
                name: message?.data?.name,
                transactionHistory: message?.data?.transactionHistory,
              })
            );

            const history = message?.data?.transactionHistory?.transactions;
            const lastTransaction = history?.[history.length - 1];
            const lastTransactionHash = lastTransaction?.txn;

            store.dispatch(
              updateLocalLastSentTransactionHash({
                lastSentTransactionHash: lastTransactionHash || "",
              })
            );
          }

          store.dispatch(
            updateSpendingWalletAddressesAndUTXOs({
              name: message?.data?.name,
              spentUTXOs: message?.data?.spentUTXOs,
              updatedChangeAddress: message?.data?.updatedChangeAddress,
            })
          );

          // Force reload the bridge
          // There is some kind of bug that makes the 2nd (but not 1st) send on
          // the bridge send a transaction but not return a result at
          // const result = await tempWallet.submitTransaction(finalTx, true);
          // I cannot figure out why
          // But reloading the bridge (and thus the injected javascript)
          // after each successful send confirmation does the job
          setIsReloading(true);
          setInterval(() => {
            // Wrapping this in an interval ensures
            // that the isReloading state toggles
            // are not batched by React
            setIsReloading(false);
          }, 10);

          store.dispatch(clearTransactionPad());
          break;

        default:
          break;
      }
    }
  );

  const [isWebViewLoaded, setIsWebViewLoaded] = React.useState(false);

  React.useEffect(() => {
    // Listens for components that need to send a message to the Bridge
    DeviceEventEmitter.addListener("event.emitEvent", (event) => {
      emit(event);
    });

    const unsubscribe = () => {
      DeviceEventEmitter.removeAllListeners();
    };

    return () => unsubscribe();
  }, []);

  // Establish connection to Electrum Cash network
  // And close connection when app is closed
  React.useEffect(() => {
    console.log("app is opened!");
    const appStateId = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    loadElectrumCash();

    return () => {
      const callback = async () => {
        console.log("the app is closed");
        await electrum.disconnect();
      };
      appStateId.remove(callback());
    };
  }, []);

  const handleAppStateChange = (
    newAppState: "active" | "inactive" | "background"
  ) => {
    console.log(`wow, this is ${newAppState}`);
  };

  const onWebViewLoad = () => {
    setIsWebViewLoaded(true);
  };

  // Only app versions need to be empty while waiting for fonts to load
  if (!IS_WEB && !fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={<Text>Loading...</Text>} persistor={persistor}>
        <ApolloProvider client={apolloClient}>
          <View style={{ flex: 1, backgroundColor: COLOURS.black }}>
            <SafeAreaProvider>
              <SafeAreaView style={{ flex: 1 }}>
                <View style={{ height: 0 }}>
                  {!IS_WEB && !isReloading && (
                    <WebView
                      ref={ref} // (r) => (this.ref = r), then this.ref.reload() or other methods
                      onMessage={onMessage}
                      source={{ html: Bridge }}
                      injectedJavaScript={preloadMainNetScript}
                      allowFileAccess={true}
                      javaScriptEnabled={true}
                      domStorageEnabled={true}
                      onLoad={onWebViewLoad}
                    />
                  )}
                </View>
                {isWebViewLoaded && <BackgroundIntervals />}
                <NavigationTree />
                <Toast config={toastConfig} />
              </SafeAreaView>
            </SafeAreaProvider>
          </View>
        </ApolloProvider>
      </PersistGate>
    </Provider>
  );
}
