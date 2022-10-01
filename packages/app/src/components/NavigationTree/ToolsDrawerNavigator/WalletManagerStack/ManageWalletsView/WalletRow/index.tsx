import React from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "@selene/common/design/typography";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";
import { ReduxState } from "@selene/common/dist/types";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { convertBalanceToDisplay } from "@selene/app/src/utils/formatting";
import {
  updateActiveWalletName,
  updateNavigatedWalletName,
} from "@selene/app/src/redux/reducers/walletManagerReducer";
import styles from "./styles";
import { BITCOIN_DENOMINATIONS } from "@selene/app/src/utils/consts";

const WalletRow = ({
  navigation,
  name,
  description,
  balance,
  transactions,
}) => {
  const dispatch = useDispatch();
  const { activeWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    useSelector((state: ReduxState) => state.settings);

  const isActive = activeWalletName === name;

  const onPressActivate = (newActiveWalletName) => {
    dispatch(updateActiveWalletName({ activeWalletName: newActiveWalletName }));
  };

  const onPressTransactions = (transactionsWalletName) => {
    dispatch(
      updateNavigatedWalletName({ navigatedWalletName: transactionsWalletName })
    );
    navigation.navigate("Transactions");
  };

  const bitcoinBalance = convertBalanceToDisplay(
    balance,
    BITCOIN_DENOMINATIONS.satoshis,
    bitcoinDenomination
  );

  const contrastBalance = convertBalanceToDisplay(
    balance,
    BITCOIN_DENOMINATIONS.satoshis,
    contrastCurrency
  );

  const primaryBalance = isBchDenominated ? bitcoinBalance : contrastBalance;
  const secondaryBalance = isBchDenominated ? contrastBalance : bitcoinBalance;
  const transactionCount = transactions?.length;
  const s = transactions?.length === 1 ? "" : "s";

  return (
    <View style={styles.container as any}>
      <Pressable
        onPress={() => onPressTransactions(name)}
        style={{ width: 30 }}
      >
        <FontAwesomeIcon
          icon={faWallet}
          size={isActive ? 30 : 20}
          color={COLOURS.white}
        />
      </Pressable>
      <Pressable
        onPress={() => onPressTransactions(name)}
        style={styles.padding as any}
      >
        <Text style={TYPOGRAPHY.h2Left as any}>{name}</Text>
        {!!description && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>{description}</Text>
        )}
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>
          {transactionCount} transaction{s}
        </Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{secondaryBalance}</Text>
      </Pressable>
      <View style={styles.fixedWidth as any}>
        {!isActive && (
          <Pressable
            onPress={() => {
              onPressActivate(name);
            }}
          >
            <Text
              style={
                {
                  ...TYPOGRAPHY.pGreenUnderlined,
                  paddingBottom: SPACING.ten,
                } as any
              }
            >
              Activate
            </Text>
          </Pressable>
        )}
        <Pressable onPress={() => onPressTransactions(name)}>
          <Text
            style={
              {
                ...TYPOGRAPHY.pGreenUnderlined,
                paddingBottom: SPACING.ten,
              } as any
            }
          >
            More {">"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default WalletRow;
