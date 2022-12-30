import React from "react";
import { View, FlatList } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import { ReduxState } from "@selene-wallet/common/dist/types";
import WalletActions from "./WalletActions";
import WalletRow from "./WalletRow";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import GreyBar from "@selene-wallet/app/src/components/atoms/GreyBar";

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

  const onPressToWallets = () => {
    navigation.goBack();
  };

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Wallets"} />
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
      <GreyBar text={"Back"} onPress={onPressToWallets} />
    </View>
  );
}

export default ManageWalletsView;
