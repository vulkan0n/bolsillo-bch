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
import Loading from "@selene-wallet/app/src/components/atoms/Loading";

const CoinsView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const [activityText, setActivityText] = useState("");
  const isActivityText = activityText.length > 0;

  // console.log(
  //   "wallet.addresses",
  //   wallet.addresses.map(({ hdWalletIndex, cashaddr }) => ({
  //     hdWalletIndex,
  //     cashaddr,
  //   }))
  // );

  const walletBalance = getWalletSatoshiBalance(wallet);
  const addressCount = wallet?.addresses?.length || 0;
  const utxos = getWalletUTXOs(wallet);
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

        <Text style={TYPOGRAPHY.h2black as any}>Balance</Text>
        <Text style={TYPOGRAPHY.p as any}>{walletBalance} satoshis</Text>
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

        <Divider />

        <Text style={TYPOGRAPHY.h2black as any}>
          Addresses ({addressCount})
        </Text>

        {wallet?.addresses?.map((address: SeleneAddressType) => {
          const balance: number = getSatoshiBalanceFromWalletAddress(address);

          return (
            <View key={address?.cashaddr}>
              <Text>#{address?.hdWalletIndex}</Text>
              <Text>{balance} satoshis</Text>
              <Text>{address?.cashaddr}</Text>
              <Text>Transactions COUNT: {address?.transactions?.length}</Text>
              {/* <Text>Transactions: {JSON.stringify(address?.transactions)}</Text> */}

              <Divider />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default CoinsView;
