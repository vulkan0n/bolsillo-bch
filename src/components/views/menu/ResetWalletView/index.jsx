import React, { useState } from "react";
import { View, Image, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../design/colours";

function ResetWalletView({ emit, navigation }) {
  const onResetWallet = () => {
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

const mapStateToProps = ({}) => ({});

export default connect(mapStateToProps)(ResetWalletView);
