import React from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@selene-wallet/common/design/colours";
import { ReduxState } from "@selene-wallet/common/dist/types";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { convertBalanceToDisplay } from "@selene-wallet/app/src/utils/formatting";
import {
  updateActiveWalletName,
  updateNavigatedWalletName,
} from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";
import styles from "./styles";
import { BITCOIN_DENOMINATIONS } from "@selene-wallet/common/dist/utils/consts";
import { getWalletSatoshiBalance } from "@selene-wallet/app/src/utils/wallet";

const WalletRow = ({ navigation, wallet }) => {
  const { name, description, transactions } = wallet;
  const dispatch = useDispatch();
  const { activeWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const { isBchDenominated, bitcoinDenomination, contrastCurrency } =
    useSelector((state: ReduxState) => state.settings);

  const isActive = activeWalletName === name;

  const onPressActivate = (newActiveWalletName: string) => {
    dispatch(updateActiveWalletName({ activeWalletName: newActiveWalletName }));
  };

  const onPressTransactions = (transactionsWalletName: string) => {
    dispatch(
      updateNavigatedWalletName({ navigatedWalletName: transactionsWalletName })
    );
    navigation.navigate("Transactions");
  };

  const onPressCoins = (transactionsWalletName: string) => {
    dispatch(
      updateNavigatedWalletName({ navigatedWalletName: transactionsWalletName })
    );
    navigation.navigate("Coins");
  };

  const bitcoinBalance = convertBalanceToDisplay(
    getWalletSatoshiBalance(wallet),
    BITCOIN_DENOMINATIONS.satoshis,
    bitcoinDenomination
  );

  const contrastBalance = convertBalanceToDisplay(
    getWalletSatoshiBalance(wallet),
    BITCOIN_DENOMINATIONS.satoshis,
    contrastCurrency
  );

  const primaryBalance = isBchDenominated ? bitcoinBalance : contrastBalance;
  const secondaryBalance = isBchDenominated ? contrastBalance : bitcoinBalance;
  const transactionCount = transactions?.length;
  const isTooManyTransactions = transactions?.length >= 100;
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
          {transactionCount}
          {isTooManyTransactions ? "+" : ""} transaction{s}
        </Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{secondaryBalance}</Text>
      </Pressable>
      <View style={styles.fixedWidth as any}>
        {isActive && <Text style={styles.coinActive as any}>ACTIVE</Text>}
        {!isActive && (
          <Pressable
            onPress={() => {
              onPressActivate(name);
            }}
          >
            <Text style={styles.coinButton as any}>Activate</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onPressTransactions(name)}>
          <Text style={styles.coinButton as any}>More {">"}</Text>
        </Pressable>
        <Pressable onPress={() => onPressCoins(name)}>
          <Text style={styles.coinButton as any}>Coins {">"}</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default WalletRow;
