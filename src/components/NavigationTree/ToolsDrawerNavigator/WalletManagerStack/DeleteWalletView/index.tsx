import React from "react";
import { View, Text, DeviceEventEmitter } from "react-native";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../../design/colours";
import Toast from "react-native-toast-message";
import { BRIDGE_MESSAGE_TYPES } from "../../../../../utils/bridgeMessages";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../../../types";
import emit from "../../../../../utils/emit";

const DeleteWalletView = ({ navigation, route }) => {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );

  const onDeleteWallet = () => {
    deleteWallet({
      name: navigatedWalletName,
    });
    navigation.navigate("Manage");
    Toast.show({
      type: "customSuccess",
      props: {
        title: "Wallet deleted",
        text: "Goodbye wallet.",
      },
    });
  };

  return (
    <View style={styles.container as any}>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Note, this will erase all of this wallet's:
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>- Wallet data</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>- Settings</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>- Mnemonic phrase</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Ensure you have your mnemonic backup saved first!!
      </Text>
      <Button onPress={onDeleteWallet}>Delete</Button>
    </View>
  );
};

export default DeleteWalletView;
