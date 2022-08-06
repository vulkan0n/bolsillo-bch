import React from "react";
import { View, Text, Image } from "react-native";
import Button from "../../atoms/Button/index";
import styles from "./styles";
import TYPOGRAPHY from "../../../design/typography";
import { BRIDGE_MESSAGE_TYPES } from "../../../utils/bridgeMessages";
import { connect } from "react-redux";
import { useEffect } from "react";

function InitView({ navigation, route, wallet }) {
  useEffect(() => {
    if (wallet) {
      navigation.reset({
        index: 0,
        routes: [{ name: "Wallet" }],
      });
    }
  }, []);

  const onPressNewWallet = () => {
    if (!wallet) {
      const { emit } = route.params;
      emit({ type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET, data: null });
    }
    navigation.reset({
      index: 0,
      routes: [{ name: "Wallet" }],
    });
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

const mapStateToProps = ({ wallet }) => ({
  wallet,
});

export default connect(mapStateToProps)(InitView);
