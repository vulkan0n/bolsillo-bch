import React from "react";
import { View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "@design/typography";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@design/colours";
import { ReduxState } from "@types";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import { convertBalanceToDisplay } from "@utils/formatting";
import {
  updateActiveWalletName,
  updateNavigatedWalletName,
} from "@redux/reducers/walletManagerReducer";
import styles from "./styles";

const WalletRow = ({ navigation, name, description, balance }) => {
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

  const onPressBackup = (backupWalletName) => {
    dispatch(
      updateNavigatedWalletName({ navigatedWalletName: backupWalletName })
    );
    navigation.navigate("Backup");
  };

  const onPressDelete = (deleteWalletName) => {
    dispatch(
      updateNavigatedWalletName({ navigatedWalletName: deleteWalletName })
    );
    navigation.navigate("Delete");
  };

  const bitcoinBalance = convertBalanceToDisplay(
    balance,
    "satoshis",
    bitcoinDenomination
  );

  const contrastBalance = convertBalanceToDisplay(
    balance,
    "satoshis",
    contrastCurrency
  );

  const primaryBalance = isBchDenominated ? bitcoinBalance : contrastBalance;
  const secondaryBalance = isBchDenominated ? contrastBalance : bitcoinBalance;

  return (
    <View style={styles.container as any}>
      <View style={{ width: 30 }}>
        <FontAwesomeIcon
          icon={faWallet}
          size={isActive ? 30 : 20}
          color={COLOURS.white}
        />
      </View>
      <View style={styles.padding as any}>
        <Text style={TYPOGRAPHY.h2Left as any}>{name}</Text>
        {!!description && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>{description}</Text>
        )}
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{primaryBalance}</Text>
        <Text style={TYPOGRAPHY.pWhiteLeft as any}>{secondaryBalance}</Text>
      </View>
      <View style={styles.fixedWidth as any}>
        {!isActive && (
          <Pressable
            onPress={() => {
              onPressActivate(name);
            }}
          >
            <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Activate</Text>
          </Pressable>
        )}
        <Pressable onPress={() => onPressBackup(name)}>
          <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Backup</Text>
        </Pressable>
        {!isActive && (
          <Pressable onPress={() => onPressDelete(name)}>
            <Text style={TYPOGRAPHY.pWhiteUnderlined as any}>Delete</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

export default WalletRow;
