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
} from "@selene-wallet/app/src/utils/wallet";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";

const CoinsView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  // Scan 10 new addresses, starting at index 0
  // and skipping over any addresses that are already known
  // Note that new UTXOs (coins) on addresses at known indices
  // will not be detected
  const scan10NewAddresses = () => {
    let counter = 0;
    let index = 0;

    while (counter < 10) {
      const isAddressAtIndex =
        wallet?.addresses?.find((a) => a?.hdWalletIndex === index) || false;

      if (!isAddressAtIndex) {
        scanAddressAtIndex(wallet, index, isTestNet);
        counter += 1;
      }

      index += 1;
    }
  };

  const checkExistingAddresses = () => {
    const walletAddressLength = wallet?.addresses?.length;
    const walletLastAddress = wallet?.addresses?.[walletAddressLength - 1];
    const lastAddressHdIndex = walletLastAddress?.hdWalletIndex;

    for (let i = 0; i <= lastAddressHdIndex; i++) {
      scanAddressAtIndex(wallet, i, isTestNet);
    }
  };

  const walletBalance = getWalletSatoshiBalance(wallet);
  const addressCount = wallet?.addresses?.length || 0;
  const utxos = getWalletUTXOs(wallet);
  const utxoCount = getWalletUTXOcount(wallet);

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Coins"} isBackButton />
      <View style={styles.whiteBackground}>
        <Button onPress={scan10NewAddresses} variant={"primary"}>
          Scan 10 new addresses
        </Button>

        <Button onPress={checkExistingAddresses} variant={"primary"}>
          Check existing addresses
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
