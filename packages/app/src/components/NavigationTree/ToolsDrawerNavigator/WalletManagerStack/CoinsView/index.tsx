import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import {
  selectActiveWallet,
} from "@selene-wallet/app/src/redux/selectors";
import store from "@selene-wallet/app/src/redux/store";
import { updateWalletMaxAddressIndex } from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { fetchActiveWalletBalance } from "@selene-wallet/app/src/components/BackgroundIntervals";

const ReceivePad = ({ }) => {

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
  }

  return (
    <View>
      <StackSubheader title={"Coins"} isBackButton />
      <Text>Tracked addresses: {wallet.maxAddressIndex}</Text>
      <Button
        onPress={addAddresses}
        variant={"primary"}
      >
        Scan 10 more addresses
      </Button>
      {wallet.coins && wallet.coins?.map(val =>
        <View style={styles.coinView as any} key={`${val.transactionId}:${val.outputIndex}`}>
          <Text>Coin index: {val.addressIndex}</Text>
          <Text>Address: {val.address.split(":")[1].slice(0,30)}...</Text>
          <Text>Value: {val.satoshis}</Text>
          <Text>Outpoint: {`${val.transactionId.slice(0,30)}...:${val.outputIndex}`}</Text>
        </View>
      )}
    </View>
  );
};

export default ReceivePad;
