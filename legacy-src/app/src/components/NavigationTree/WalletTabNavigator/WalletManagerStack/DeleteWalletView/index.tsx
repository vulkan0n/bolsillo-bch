import React from "react";
import { View, Text, ScrollView } from "react-native";
import Button from "@selene-wallet/app/src/components/atoms/Button";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "./styles";
import Toast from "react-native-toast-message";
import { useDispatch, useSelector } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";
import Divider from "@selene-wallet/app/src/components/atoms/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "@selene-wallet/common/design/colours";
import { faTrashCan } from "@fortawesome/free-solid-svg-icons/faTrashCan";
import { deleteWallet } from "@selene-wallet/app/src/redux/reducers/walletManagerReducer";
import StackSubheader from "@selene-wallet/app/src/components/atoms/StackSubheader";
import { selectNavigatedWallet } from "@selene-wallet/app/src/redux/selectors";

const DeleteWalletView = ({ navigation }) => {
  const { name, description } = useSelector((state: ReduxState) =>
    selectNavigatedWallet(state)
  );
  const dispatch = useDispatch();

  const onPressBackup = () => {
    navigation.navigate("Backup");
  };

  const onPressDelete = () => {
    navigation.navigate("Manage");
    dispatch(
      deleteWallet({
        name,
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
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Delete"} isBackButton />
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
          <Button icon={"faPiggyBank"} onPress={onPressBackup}>
            Backup
          </Button>
          <Button icon={"faTrashCan"} variant="danger" onPress={onPressDelete}>
            Delete forever
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default DeleteWalletView;
