import React, { useState, useEffect } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import WalletActions from "./WalletActions";
import Loading from "@selene-wallet/app/src/components/atoms/Loading";
import {
  getWalletUTXOcount,
  getWalletSatoshiBalance,
  scanWalletXNewAddresses,
  checkWalletExistingAddresses,
  checkWalletRecentAddresses,
} from "@selene-wallet/app/src/utils/wallet";
import Button from "@selene-wallet/app/src/components/atoms/Button";

const WalletView = ({ navigation }) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { name } = wallet;
  const [activityText, setActivityText] = useState("");
  const isActivityText = activityText.length > 0;
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

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

  const onPressTransactions = () => {
    navigation.navigate("Transactions");
  };

  const onPressUTXOs = () => {
    navigation.navigate("UTXOs");
  };

  const onPressAddresses = () => {
    navigation.navigate("Addresses");
  };

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Wallet - " + name} isBackButton />

      <View style={styles.whiteBackground}>
        <Text style={TYPOGRAPHY.h2black as any}>Balance</Text>
        <Text style={TYPOGRAPHY.p as any}>{walletBalance} satoshis</Text>
        <Divider />

        <Pressable onPress={() => onPressTransactions()}>
          <Text style={TYPOGRAPHY.h2black as any}>Transactions {">"}</Text>
        </Pressable>
        <Divider />

        <Pressable onPress={() => onPressUTXOs()}>
          <Text style={TYPOGRAPHY.h2black as any}>
            UTXOs ({utxoCount}) {">"}
          </Text>
        </Pressable>
        <Divider />

        <Pressable onPress={() => onPressAddresses()}>
          <Text style={TYPOGRAPHY.h2black as any}>
            Addresses ({addressCount}) {">"}
          </Text>
        </Pressable>

        <WalletActions navigation={navigation} />

        {isActivityText && (
          <>
            <Text style={TYPOGRAPHY.pCentered}>{activityText}</Text>
            <Loading />
            <Text style={TYPOGRAPHY.pCentered}>
              Note: Spinner disappears after 5 seconds even if action still in
              progress.
            </Text>
          </>
        )}

        <Button
          onPress={() => {
            scanWalletXNewAddresses(wallet, 100, isTestNet);
            setActivityText("Scanning 100 new addresses.");
          }}
          variant={"primary"}
        >
          Scan 100 new addresses
        </Button>
        <Button
          onPress={() => {
            scanWalletXNewAddresses(wallet, 10, isTestNet);
            setActivityText("Scanning 10 new addresses.");
          }}
          variant={"primary"}
        >
          Scan 10 new addresses
        </Button>

        <Button
          onPress={() => {
            checkWalletExistingAddresses(wallet, isTestNet);
            setActivityText("Scanning all addresses.");
          }}
          variant={"primary"}
        >
          Check all addresses
        </Button>

        <Button
          onPress={() => {
            checkWalletRecentAddresses(wallet, isTestNet);
            setActivityText("Scanning recent addresses.");
          }}
          variant={"primary"}
        >
          Check recent addresses
        </Button>
      </View>
    </ScrollView>
  );
};

export default WalletView;
