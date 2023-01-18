import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  getWalletUTXOcount,
  getWalletSatoshiBalance,
} from "@selene-wallet/app/src/utils/wallet";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import WalletActions from "./WalletActions";

const WalletView = ({ navigation }) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { name } = wallet;
  const [activityText, setActivityText] = useState("");
  const isActivityText = activityText.length > 0;

  const walletBalance = getWalletSatoshiBalance(wallet);
  const addressCount = wallet?.addresses?.length || 0;
  const utxoCount = getWalletUTXOcount(wallet);

  useEffect(() => {
    if (!isActivityText) {
      return;
    }

    setTimeout(() => {
      setActivityText("");
    }, 5000);
  }, [activityText]);

  const onPressCoins = (walletName: string) => {
    navigation.navigate("Coins");
  };

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Wallet - " + name} isBackButton />
      <View style={styles.whiteBackground}>
        <Text style={TYPOGRAPHY.h2black as any}>Balance</Text>
        <Text style={TYPOGRAPHY.p as any}>{walletBalance} satoshis</Text>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>UTXOs ({utxoCount})</Text>
        <Divider />

        <Pressable onPress={() => onPressCoins(name)}>
          <Text style={TYPOGRAPHY.h2black as any}>Coins {">"}</Text>
        </Pressable>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>
          Addresses ({addressCount})
        </Text>

        <WalletActions navigation={navigation} />
      </View>
    </ScrollView>
  );
};

export default WalletView;
