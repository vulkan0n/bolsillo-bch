import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  getWalletUTXOs,
  getWalletUTXOcount,
} from "@selene-wallet/app/src/utils/wallet";

const UTXOsView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));

  const utxos = getWalletUTXOs(wallet);
  const utxoCount = getWalletUTXOcount(wallet);

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"UTXOs"} isBackButton />
      <View style={styles.whiteBackground}>
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

export default UTXOsView;
