import React from "react";
import { View, Text, Pressable, Linking } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectNavigatedWallet } from "@selene-wallet/app/src/redux/selectors";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  getWalletUTXOs,
  getWalletUTXOcount,
} from "@selene-wallet/app/src/utils/wallet";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
import { CoinType } from "@selene-wallet/common/types";
import { scanAddressAtIndex } from "@selene-wallet/app/src/utils/wallet";

const UTXOsView = ({}) => {
  const wallet = useSelector((state: ReduxState) =>
    selectNavigatedWallet(state)
  );

  const utxos = getWalletUTXOs(wallet);
  const utxoCount = getWalletUTXOcount(wallet);

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"UTXOs"} isBackButton />
      <View style={styles.whiteBackground}>
        <Text style={TYPOGRAPHY.h2black as any}>UTXOs ({utxoCount})</Text>
        {utxos?.map(
          ({
            address,
            transactionId,
            outputIndex,
            addressIndex,
            satoshis,
          }: CoinType) => {
            const onPressAddress = async () => {
              await Clipboard.setStringAsync(address);

              Toast.show({
                type: "customSuccess",
                props: {
                  title: `Copied payment address.`,
                  text: address ?? "",
                },
              });
            };

            const onPressRescan = async () => {
              scanAddressAtIndex(wallet, parseInt(addressIndex));

              Toast.show({
                type: "customSuccess",
                props: {
                  title: `Rescan started.`,
                  text: address ?? "",
                },
              });
            };

            const onPressBlockExplorer = async () => {
              const url = `https://explorer.melroy.org/address/${address}`;
              Linking.openURL(url);
            };

            return (
              <View
                style={styles.coinView as any}
                key={`${transactionId}:${outputIndex}`}
              >
                <Pressable onPress={onPressAddress}>
                  <Text style={TYPOGRAPHY.pLeft as any}>
                    Coin index: {addressIndex}
                  </Text>
                  <Text style={TYPOGRAPHY.pLeft as any}>
                    Address: {address.split(":")[1].slice(0, 30)}...
                  </Text>
                  <Text style={TYPOGRAPHY.pLeft as any}>
                    Value: {satoshis} satoshis
                  </Text>
                  <Text style={TYPOGRAPHY.pLeft as any}>
                    Outpoint:{" "}
                    {`${transactionId?.slice(0, 30)}...:${outputIndex}`}
                  </Text>
                </Pressable>

                <Divider />

                <Pressable onPress={() => onPressRescan()}>
                  <Text style={TYPOGRAPHY.pUnderlined as any}>
                    Rescan Address
                  </Text>
                </Pressable>
                <Pressable onPress={() => onPressBlockExplorer()}>
                  <Text style={TYPOGRAPHY.pUnderlined as any}>
                    Block Explorer
                  </Text>
                </Pressable>
              </View>
            );
          }
        )}
      </View>
    </ScrollView>
  );
};

export default UTXOsView;
