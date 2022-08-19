import React from "react";
import { View, Text, ScrollView } from "react-native";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import COLOURS from "../../../../../design/colours";
import { faPowerOff } from "@fortawesome/free-solid-svg-icons/faPowerOff";
import persistor from "../../../../../redux/persistor";
import StackSubheader from "../../../../atoms/StackSubheader";

const ResetView = ({ navigation }) => {
  const onPressReset = () => {
    persistor.purge();
    navigation.reset({
      index: 0,
      routes: [{ name: "Wallet" }],
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Reset"} isBackButton />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container as any}>
          <View style={styles.iconContainer}>
            <FontAwesomeIcon
              icon={faPowerOff}
              size={50}
              color={COLOURS.bchGreen}
            />
          </View>
          <Text style={TYPOGRAPHY.h2 as any}>Reset</Text>
          <Text style={TYPOGRAPHY.pWhite as any}>
            Reset your Selene wallet to a freshly installed state.
          </Text>
          <Text style={TYPOGRAPHY.pWhite as any}>
            This will erase everything in the app:
          </Text>
          <Text style={TYPOGRAPHY.pWhite as any}>- Wallet data</Text>
          <Text style={TYPOGRAPHY.pWhite as any}>- Settings</Text>
          <Text style={TYPOGRAPHY.pWhite as any}>- Mnemonic phrases</Text>
          <Text style={TYPOGRAPHY.pWhite as any}>This cannot be undone.</Text>
          <Text style={TYPOGRAPHY.pWhite as any}>
            You will lose access to any future coins sent to addresses in those
            wallets!!
          </Text>
          <Text style={TYPOGRAPHY.pWhite as any}>
            Ensure you have your mnemonic backups saved first!!
          </Text>
          <Button icon={"faPowerOff"} variant="danger" onPress={onPressReset}>
            Reset app
          </Button>
        </View>
      </ScrollView>
    </View>
  );
};

export default ResetView;
