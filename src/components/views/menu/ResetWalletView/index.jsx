import React from "react";
import { View, Text } from "react-native";
import { connect } from "react-redux";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../design/colours";
import Toast from "react-native-toast-message";
import { BRIDGE_MESSAGE_TYPES } from "../../../../utils/bridgeMessages";

function ResetWalletView({ isTestNet, navigation, route }) {
  const { emit } = route?.params;

  const onResetWallet = () => {
    emit({
      type: BRIDGE_MESSAGE_TYPES.CREATE_WALLET,
      data: { isTestNet },
    });

    Toast.show({
      type: "customSuccess",
      props: {
        title: "New wallet created",
        text: "Generated new mnemonic phrase.",
      },
    });
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <FontAwesomeIcon
          icon={faPiggyBank}
          size={75}
          color={COLOURS.bchGreen}
        />
      </View>
      <Text style={TYPOGRAPHY.h1}>Reset Wallet</Text>
      <Text style={TYPOGRAPHY.pWhite}>
        Note, this will erase all of your current data, including your mnemonic
        phrase!!
      </Text>
      <Text style={TYPOGRAPHY.pWhite}>Ensure you have a backup first.</Text>
      <Button onPress={onResetWallet}>Create new wallet</Button>
    </View>
  );
}

const mapStateToProps = ({ settings: { isTestNet } }) => ({ isTestNet });

export default connect(mapStateToProps)(ResetWalletView);
