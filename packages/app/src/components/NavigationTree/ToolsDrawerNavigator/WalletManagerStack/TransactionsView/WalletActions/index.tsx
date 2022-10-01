import React from "react";
import { View, Text } from "react-native";
import Button from "@selene/app/src/components/atoms/Button";
import Divider from "@selene/app/src/components/atoms/Divider";
import { useSelector } from "react-redux";
import { ReduxState } from "@selene/common/dist/types";
import TYPOGRAPHY from "@selene/common/design/typography";
import SPACING from "@selene/common/design/spacing";
import COLOURS from "@selene/common/design/colours";

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
    <View style={{ backgroundColor: COLOURS.white }}>
      <Divider />

      {isActive && (
        <Text style={TYPOGRAPHY.p as any}>Can't delete Active wallet.</Text>
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
          variant={"primary"}
          size={"small"}
          icon={"faPiggyBank"}
        >
          Backup
        </Button>
        <Button
          isDisabled={isActive}
          onPress={onPressDelete}
          variant={"secondary"}
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
