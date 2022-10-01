import React from "react";
import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import { ReduxState } from "@selene/common/dist/types";
import WalletActions from "./WalletActions";
import WalletRow from "./WalletRow";
import Divider from "@selene/app/src/components/atoms/Divider";
import StackSubheader from "@selene/app/src/components/atoms/StackSubheader";

function ManageWalletsView({ navigation }) {
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);

  const renderWallets = ({
    item: { name, description, balance, transactions },
  }) => (
    <WalletRow
      navigation={navigation}
      name={name}
      description={description}
      balance={balance}
      transactions={transactions}
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
