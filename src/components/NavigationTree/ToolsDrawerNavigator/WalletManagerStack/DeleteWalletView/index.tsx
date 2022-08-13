import React from "react";
import { View, Text } from "react-native";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import Toast from "react-native-toast-message";
import { useSelector } from "react-redux";
import { ReduxState } from "../../../../../types";

const DeleteWalletView = ({ navigation }) => {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );

  const onPressBackup = () => {
    navigation.navigate("Backup");
  };

  const onPressDelete = () => {
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
      <Button icon={"faPiggyBank"} onPress={onPressBackup}>
        Backup
      </Button>
      <Button icon={"faTrashCan"} variant="danger" onPress={onPressDelete}>
        Delete forever
      </Button>
    </View>
  );
};

export default DeleteWalletView;
