import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../design/colours";

function BackupView({ wallet, navigation }) {
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  const onPressResetWallet = () => {
    navigation.navigate("Reset Wallet");
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
      <Text style={TYPOGRAPHY.h1}>Mnemonic phrase</Text>
      <Text style={TYPOGRAPHY.pWhite}>
        With your mnemonic phrase, you can restore your wallet if your phone is
        ever lost or broken.
      </Text>
      <Text style={TYPOGRAPHY.pWhite}>
        It is recommended to make two backups of your phrase in safe locations
        such as a locked box or password manager. Do NOT store it as a
        screenshot!
      </Text>
      <Text style={TYPOGRAPHY.pWhite}>
        The order of the words is important.
      </Text>
      <Text style={TYPOGRAPHY.pWhite}>
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
          <Text style={TYPOGRAPHY.pWhite}>{wallet?.mnemonic}</Text>
        </Pressable>
      )}
      <Text style={TYPOGRAPHY.h2}>Derivation path</Text>
      <Text style={TYPOGRAPHY.pWhite}>{wallet?.derivationPath}</Text>
      <Pressable onPress={onPressResetWallet}>
        <Text style={TYPOGRAPHY.pWhite}>Reset Wallet</Text>
      </Pressable>
    </View>
  );
}

const mapStateToProps = ({ root: { wallet } }) => ({ wallet });

export default connect(mapStateToProps)(BackupView);
