import React, { useState } from "react";
import { View, Image, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import COLOURS from "../../../../design/colours";

function SettingsView() {
  const [isEnabled, setIsEnabled] = useState(false);

  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../../../../assets/images/logo.jpg")}
      />
      <Text style={TYPOGRAPHY.h1}>Settings</Text>
      <View style={styles.container}>
        <Switch
          trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
          thumbColor={isEnabled ? COLOURS.white : COLOURS.black}
          ios_backgroundColor={COLOURS.lightGrey}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
      </View>
    </View>
  );
}

export default SettingsView;
