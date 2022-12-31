import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import store from "@selene-wallet/app/src/redux/store";
import { updateWalletMaxAddressIndex } from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import {
  fetchActiveWalletBalance,
  scanAddressAtIndex,
} from "@selene-wallet/app/src/components/BackgroundIntervals";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  getWalletUTXOs,
  getWalletUTXOcount,
  getWalletSatoshiBalance,
} from "@selene-wallet/app/src/utils/wallets";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";

const CoinsView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const addAddresses = () => {
    store.dispatch(
      updateWalletMaxAddressIndex({
        name: wallet.name,
        maxAddressIndex: wallet.maxAddressIndex + 10,
      })
    );

    fetchActiveWalletBalance(wallet, isTestNet);
  };

  const resetAddresses = () => {
    console.log("resetting address");
    store.dispatch(
      updateWalletMaxAddressIndex({
        name: wallet.name,
        maxAddressIndex: 0,
      })
    );

    fetchActiveWalletBalance(wallet, isTestNet);
  };

  const scanAddress = () => {
    scanAddressAtIndex(wallet, 12, isTestNet);
  };

  const walletBalance = getWalletSatoshiBalance(wallet);
  const addressCount = wallet?.addresses?.length;
  const utxos = getWalletUTXOs(wallet);
  const utxoCount = getWalletUTXOcount(wallet);

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Coins"} isBackButton />
      <View style={styles.whiteBackground}>
        <Button onPress={addAddresses} variant={"primary"}>
          Scan 10 more addresses
        </Button>
        <Button onPress={resetAddresses} variant={"primary"}>
          Reset to 0 addresses scanned
        </Button>
        <Button onPress={scanAddress} variant={"primary"}>
          Scan address
        </Button>

        <Text style={TYPOGRAPHY.h2black as any}>Balance</Text>
        <Text style={TYPOGRAPHY.p as any}>{walletBalance} satoshis</Text>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>
          Addresses ({addressCount})
        </Text>

        {wallet?.addresses?.map((address) => {
          const balance = address.coins.reduce(
            (sum, coin) => sum + coin.satoshis,
            0
          );

          return (
            <View key={address?.cashaddr}>
              <Text>#{address.hdWalletIndex}</Text>
              <Text>{balance} satoshis</Text>
              <Text>{address.cashaddr}</Text>
            </View>
          );
        })}
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>UTXOs ({utxoCount})</Text>
        {utxos?.map((val) => (
          <View
            style={styles.coinView as any}
            key={`${val?.transactionId}:${val.outputIndex}`}
          >
            <Text>Coin index: {val.addressIndex}</Text>
            <Text>Address: {val.address.split(":")[1].slice(0, 30)}...</Text>
            <Text>Value: {val.satoshis} satoshis</Text>
            <Text>
              Outpoint:{" "}
              {`${val?.transactionId?.slice(0, 30)}...:${val.outputIndex}`}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default CoinsView;
