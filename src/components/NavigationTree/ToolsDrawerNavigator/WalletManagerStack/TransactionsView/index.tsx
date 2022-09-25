import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import TYPOGRAPHY from "@design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@design/colours";
import { ReduxState } from "@types";
import Divider from "@atoms/Divider";
import StackSubheader from "@atoms/StackSubheader";
import { iconImport } from "@design/icons";
import WalletActions from "./WalletActions";
import TransactionRow from "./TransactionRow";
import { BRIDGE_MESSAGE_TYPES } from "@utils/bridgeMessages";
import emit from "@utils/emit";

function TransactionsView({ navigation }) {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const { name, description, mnemonic, derivationPath, transactions } =
    useSelector((state: ReduxState) =>
      state.walletManager.wallets?.find(
        ({ name }) => name === navigatedWalletName
      )
    );
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  useEffect(() => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.GET_WALLET_HISTORY,
      data: {
        name,
        mnemonic,
        derivationPath,
        isTestNet,
      },
    });
  }, []);

  const [editNoteHash, setEditNoteHash] = useState("");

  const isNoTransactions = transactions?.length === 0;

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={name} subtitle={description} isBackButton />
      <View style={styles.container as any}>
        {isNoTransactions && (
          <Text style={TYPOGRAPHY.p as any}>No transactions.</Text>
        )}
        <FlatList
          style={
            {
              flex: 1,
              color: "white",
              width: "100%",
            } as any
          }
          ItemSeparatorComponent={() => <Divider />}
          data={transactions}
          renderItem={({ item }) => (
            <TransactionRow
              transaction={item}
              editNoteHash={editNoteHash}
              setEditNoteHash={setEditNoteHash}
            />
          )}
          keyExtractor={({ txn }) => txn}
        />
        <WalletActions navigation={navigation} />
      </View>
    </View>
  );
}

export default TransactionsView;
