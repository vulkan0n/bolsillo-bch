import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { useSelector } from "react-redux";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import { ReduxState } from "@selene-wallet/common/dist/types";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import TransactionRow from "./TransactionRow";
import { BRIDGE_MESSAGE_TYPES } from "@selene-wallet/app/src/utils/bridgeMessages";
import emit from "@selene-wallet/app/src/utils/emit";

function TransactionsView({ navigation }) {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const {
    name,
    description,
    mnemonic,
    derivationPath,
    maxAddressIndex,
    transactions,
  } = useSelector((state: ReduxState) =>
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
        maxAddressIndex,
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
          ListFooterComponent={() => {
            return (
              <Text style={TYPOGRAPHY.p}>
                Only latest 100 transactions shown.
              </Text>
            );
          }}
        />
      </View>
    </View>
  );
}

export default TransactionsView;
