import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../design/colours";
import { ReduxState } from "../../../../types";

function BackupView({ navigation }) {
  const { wallet } = useSelector((state: ReduxState) => state.bridge);
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  const onPressResetWallet = () => {
    navigation.navigate("Reset Wallet");
  };

  return (
    <View style={styles.container as any}>
      <View style={styles.iconContainer}>
        <FontAwesomeIcon
          icon={faPiggyBank}
          size={75}
          color={COLOURS.bchGreen}
        />
      </View>
      <Text style={TYPOGRAPHY.h1 as any}>Mnemonic phrase</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        With your mnemonic phrase, you can restore your wallet if your phone is
        ever lost or broken.
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        It is recommended to make two backups of your phrase in safe locations
        such as a locked box or password manager. Do NOT store it as a
        screenshot!
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        The order of the words is important.
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        NEVER tell anyone your mnemonic, if they have these words they can TAKE
        ALL YOUR MONEY!!
      </Text>
      {!isMnemonicVisible && (
        <Button onPress={toggleIsMnemonicVisible}>Reveal mnemonic</Button>
      )}
      {isMnemonicVisible && (
        <Pressable
          onPress={toggleIsMnemonicVisible}
          style={styles.mnemonicContainer}
        >
          <Text style={TYPOGRAPHY.pWhite as any}>{wallet?.mnemonic}</Text>
        </Pressable>
      )}
      <Text style={TYPOGRAPHY.h2 as any}>Derivation path</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>{wallet?.derivationPath}</Text>
      <Pressable onPress={onPressResetWallet}>
        <Text style={TYPOGRAPHY.pWhite as any}>Reset Wallet</Text>
      </Pressable>
    </View>
  );
}

export default BackupView;
