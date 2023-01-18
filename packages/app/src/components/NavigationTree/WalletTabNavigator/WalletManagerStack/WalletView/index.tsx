import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import {
  ReduxState,
  SeleneAddressType,
} from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  getWalletUTXOs,
  getWalletUTXOcount,
  getWalletSatoshiBalance,
  scanWalletXNewAddresses,
  checkWalletExistingAddresses,
  checkWalletRecentAddresses,
  getSatoshiBalanceFromWalletAddress,
} from "@selene-wallet/app/src/utils/wallet";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
const WalletView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
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

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Coins"} isBackButton />
      <View style={styles.whiteBackground}>
        <Text style={TYPOGRAPHY.h2black as any}>Balance</Text>
        <Text style={TYPOGRAPHY.p as any}>{walletBalance} satoshis</Text>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>UTXOs ({utxoCount})</Text>
        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>
          Addresses ({addressCount})
        </Text>
      </View>
    </ScrollView>
  );
};

export default WalletView;
