import React from "react";
import { View, Text } from "react-native";
import { useSelector } from "react-redux";
import {
  ReduxState,
  SeleneAddressType,
} from "@selene-wallet/common/dist/types";
import { selectActiveWallet } from "@selene-wallet/app/src/redux/selectors";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import styles from "./styles";
import { ScrollView } from "react-native-gesture-handler";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import { getSatoshiBalanceFromWalletAddress } from "@selene-wallet/app/src/utils/wallet";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";

const AddressesView = ({}) => {
  const wallet = useSelector((state: ReduxState) => selectActiveWallet(state));
  const addressCount = wallet?.addresses?.length || 0;

  return (
    <ScrollView style={styles.scrollView}>
      <StackSubheader title={"Addresses"} isBackButton />
      <View style={styles.whiteBackground}>
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

export default AddressesView;
