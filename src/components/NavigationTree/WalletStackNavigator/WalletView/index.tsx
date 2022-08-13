import React, { useEffect } from "react";
import { View, Pressable, Image } from "react-native";
import { useSelector } from "react-redux";
import TransactionPad from "./TransactionPad";
import styles from "./styles";
import { BRIDGE_MESSAGE_TYPES } from "../../../../utils/bridgeMessages";
import { displaySats, displaySatsAsUsd } from "../../../../utils/formatting";
import { ReduxState } from "../../../../types";
import emit from "../../../../utils/emit";
import AvailableBalance from "./AvailableBalance";

function WalletView({ route, navigation }) {
  const wallet = useSelector((state: ReduxState) =>
    state.walletManager?.wallets?.find(
      ({ name }) => name === state.walletManager?.activeWalletName
    )
  );
  const { balance } = wallet;
  const { tempTxId } = useSelector((state: ReduxState) => state.bridge);
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { isShowAvailableBalance } = useSelector(
    (state: ReduxState) => state.settings
  );

  const requestBalance = () =>
    emit({
      type: BRIDGE_MESSAGE_TYPES.REQUEST_BALANCE,
      data: {
        name: wallet?.name,
        mnemonic: wallet?.mnemonic,
        derivationPath: wallet?.derivationPath,
        isTestNet,
      },
    });

  // Create a wallet if none exists
  // I.e. first time app is opened
  useEffect(() => {
    if (!wallet?.mnemonic) {
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: { isTestNet } });
    }
  }, []);

  // Refresh wallet when toggling to/from test net
  useEffect(() => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.REFRESH_WALLET,
      data: { wallet, isTestNet },
    });
  }, [isTestNet]);

  useEffect(() => {
    if (!wallet) {
      return;
    }

    console.log("triggering");
    requestBalance();
  }, [wallet?.name, wallet?.mnemonic, wallet?.cashaddr]);

  // Transaction id set to non null means new transaction just completed
  useEffect(() => {
    if (!tempTxId) {
      return;
    }

    console.log("sent tx id!!");
    console.log({ tempTxId });
    navigation.reset({
      index: 0,
      routes: [{ name: "Transaction Success" }],
    });
  }, [tempTxId]);

  const onPressLogo = () => {
    navigation.navigate("Menu");
  };

  const satBalance = displaySats(balance?.sat);
  const usdBalance = displaySatsAsUsd(balance?.sat);

  return (
    <View style={styles.container as any}>
      <Pressable onPress={onPressLogo}>
        <Image
          style={styles.logo}
          source={require("../../../../assets/images/logo.jpg")}
        />
      </Pressable>

      {isShowAvailableBalance && <AvailableBalance />}
      <TransactionPad />
    </View>
  );
}

export default WalletView;
