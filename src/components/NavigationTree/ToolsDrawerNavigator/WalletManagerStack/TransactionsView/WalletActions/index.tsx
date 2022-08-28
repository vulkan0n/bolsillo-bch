import React from "react";
import { View, Text } from "react-native";
import Button from "@atoms/Button";
import Divider from "@atoms/Divider";
import { useSelector } from "react-redux";
import { ReduxState } from "@types";
import TYPOGRAPHY from "@design/typography";
import SPACING from "@design/spacing";
import COLOURS from "@design/colours";

const WalletActions = ({ navigation }) => {
  const { activeWalletName, navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );

  const isActive = activeWalletName === navigatedWalletName;

  const onPressBackup = () => {
    navigation.navigate("Backup");
  };

  const onPressDelete = () => {
    if (isActive) {
      return;
    }
    navigation.navigate("Delete");
  };

  return (
    <View style={{ backgroundColor: COLOURS.black }}>
      <Divider />

      {isActive && (
        <Text style={TYPOGRAPHY.pWhite as any}>
          Can't delete Active wallet.
        </Text>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <Button
          onPress={onPressBackup}
          variant={"blackOutlined"}
          size={"small"}
          icon={"faPiggyBank"}
        >
          Backup
        </Button>
        <Button
          isDisabled={isActive}
          onPress={onPressDelete}
          variant={"blackOutlined"}
          size={"small"}
          icon={"faTrashCan"}
        >
          Delete
        </Button>
      </View>
    </View>
  );
};

export default WalletActions;
