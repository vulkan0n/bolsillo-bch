import React, { useState } from "react";
import { View, Image, Text, Pressable } from "react-native";
import { connect } from "react-redux";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";

function BackupView({ wallet }) {
  const [isMnemonicVisible, setIsMnemonicVisible] = useState(false);

  const toggleIsMnemonicVisible = () => {
    setIsMnemonicVisible(!isMnemonicVisible);
  };

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1}>Backup</Text>
      <Text style={TYPOGRAPHY.h2}>Mnemonic phrase</Text>
      <Text style={TYPOGRAPHY.pWhite}>
        With the mnemonic phrase, you can restore your wallet if your phone is
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
    </View>
  );
}

const mapStateToProps = ({ wallet }) => ({ wallet });

export default connect(mapStateToProps)(BackupView);
