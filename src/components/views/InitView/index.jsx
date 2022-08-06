import React from "react";
import { View, Text, Image } from "react-native";
import Button from "../../atoms/Button/index";
import styles from "./styles";
import TYPOGRAPHY from "../../../design/typography";

function InitView({ navigation, route }) {
  const onPressNewWallet = () => {
    const { emit } = route.params;
    emit({ type: "success", data: "succeeded!" });
    navigation.navigate("Wallet");
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../assets/images/logo.jpg")}
      />
      <View style={styles.titleWrapper}>
        <Text style={TYPOGRAPHY.title}>SELENE</Text>
        <Text style={TYPOGRAPHY.subtitle}>Join the Cash economy</Text>
      </View>
      <Button onPress={onPressNewWallet}>
        <Text>New Wallet</Text>
      </Button>
      <Button variant={"secondary"}>
        <Text>Import</Text>
      </Button>
      <Text style={TYPOGRAPHY.whiteLink}>Help me choose?</Text>
    </View>
  );
}
export default InitView;
