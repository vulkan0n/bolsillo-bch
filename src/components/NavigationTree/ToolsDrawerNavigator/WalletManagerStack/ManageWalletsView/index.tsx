import React, { useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import styles from "./styles";
import { ReduxState } from "@types";
import WalletActions from "./WalletActions";
import WalletRow from "./WalletRow";
import Divider from "@atoms/Divider";
import StackSubheader from "@atoms/StackSubheader";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import emit from "@utils/emit";
import { useFocusEffect } from "@react-navigation/native";

function ManageWalletsView({ navigation }) {
  const { wallets } = useSelector((state: ReduxState) => state.walletManager);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  useFocusEffect(() => {
    wallets.map(({ name, mnemonic, derivationPath }) => {
      emit({
        type: BRIDGE_MESSAGE_TYPES.GET_WALLET_HISTORY,
        data: {
          name,
          mnemonic,
          derivationPath,
          isTestNet,
        },
      });
    });
  });

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
