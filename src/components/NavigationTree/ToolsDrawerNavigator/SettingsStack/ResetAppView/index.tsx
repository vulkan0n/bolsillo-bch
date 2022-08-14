import React from "react";
import { View, Text, ScrollView } from "react-native";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "../../../../../types";
import Divider from "../../../../atoms/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../../../design/colours";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons/faTrashCan";
import { deleteWallet } from "../../../../../redux/reducers/walletManagerReducer";

const ResetAppView = ({ navigation }) => {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );
  const { name, description } = useSelector((state: ReduxState) =>
    state.walletManager.wallets?.find(
      ({ name }) => name === navigatedWalletName
    )
  );
  const dispatch = useDispatch();

  const onPressBackup = () => {
    navigation.navigate("Backup");
  };

  const onPressDelete = () => {
    navigation.navigate("Manage");
    dispatch(
      deleteWallet({
        name: navigatedWalletName,
      })
    );
    Toast.show({
      type: "customSuccess",
      props: {
        title: "Wallet deleted",
        text: "Goodbye wallet.",
      },
    });
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container as any}>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon
            icon={faTrashCan}
            size={50}
            color={COLOURS.bchGreen}
          />
        </View>
        <Text style={TYPOGRAPHY.h2 as any}>{name}</Text>
        {!!description && (
          <Text style={TYPOGRAPHY.pWhite as any}>{description}</Text>
        )}
        <Divider />
        <Text style={TYPOGRAPHY.pWhite as any}>
          Note, this will erase all of this wallet's:
        </Text>
        <Text style={TYPOGRAPHY.pWhite as any}>- Wallet data</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>- Settings</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>- Mnemonic phrase</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          You will lose access to any future coins sent to addresses in this
          wallet!!
        </Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          Ensure you have your mnemonic backup saved first!!
        </Text>
        <Button icon={"faTrashCan"} variant="danger" onPress={onPressDelete}>
          Reset app
        </Button>
      </View>
    </ScrollView>
  );
};

export default ResetAppView;
