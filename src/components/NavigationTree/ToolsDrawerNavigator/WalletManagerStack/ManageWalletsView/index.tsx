import React from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import { ReduxState } from "../../../../../types";
import WalletActions from "./WalletActions";
import WalletRow from "./WalletRow";
import Divider from "../../../../atoms/Divider";
import TYPOGRAPHY from "../../../../../design/typography";
import COLOURS from "../../../../../design/colours";
import SPACING from "../../../../../design/spacing";
import StackSubheader from "../../../../atoms/StackSubheader";

function ManageWalletsView({ navigation }) {
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);

  // console.log({ wallets });

  const renderWallets = ({ item: { name, description, balance } }) => (
    <WalletRow
      navigation={navigation}
      name={name}
      description={description}
      balance={balance}
    />
  );

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Manage"} />
      <View style={styles.container as any}>
        <FlatList
          style={
            {
              flex: 1,
              color: "white",
              width: "100%",
            } as any
          }
          ItemSeparatorComponent={() => <Divider />}
          data={wallets}
          renderItem={renderWallets}
          keyExtractor={({ name }) => name}
          ListFooterComponent={<WalletActions navigation={navigation} />}
        />
      </View>
    </View>
  );
}

export default ManageWalletsView;
