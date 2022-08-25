import React from "react";
import { View } from "react-native";
import Button from "../../../../../atoms/Button";
import Divider from "../../../../../atoms/Divider";

const WalletActions = ({ navigation }) => {
  const onPressNew = () => {
    navigation.navigate("New");
  };

  const onPressImport = () => {
    navigation.navigate("Import");
  };

  return (
    <View>
      <Divider />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          width: "100%",
        }}
      >
        <Button
          onPress={onPressNew}
          variant={"blackOutlined"}
          size={"small"}
          icon={"faPlusCircle"}
        >
          New
        </Button>
        <Button
          onPress={onPressImport}
          variant={"blackOutlined"}
          size={"small"}
          icon={"faFileImport"}
        >
          Import
        </Button>
      </View>
    </View>
  );
};

export default WalletActions;
