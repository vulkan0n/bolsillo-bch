import React, { useEffect } from "react";
import { View, Text, DeviceEventEmitter } from "react-native";
import Button from "../../../atoms/Button";
import TYPOGRAPHY from "../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faPiggyBank } from "@fortawesome/free-solid-svg-icons/faPiggyBank";
import COLOURS from "../../../../design/colours";
import Toast from "react-native-toast-message";
import { BRIDGE_MESSAGE_TYPES } from "../../../../utils/bridgeMessages";
import { useSelector } from "react-redux";
import { EmitEvent, ReduxState } from "../../../../types";

const ResetWalletView = ({ navigation, route }) => {
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);

  const emit = (event: EmitEvent) =>
    DeviceEventEmitter.emit("event.emitEvent", event);

  useEffect(() => {
    return () => {
      DeviceEventEmitter.removeAllListeners("event.emitEvent");
    };
  }, []);

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
    <View style={styles.container as any}>
      <View style={styles.iconContainer as any}>
        <FontAwesomeIcon
          icon={faPiggyBank}
          size={75}
          color={COLOURS.bchGreen}
        />
      </View>
      <Text style={TYPOGRAPHY.h1 as any}>Reset Wallet</Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Note, this will erase all of your current data, including your mnemonic
        phrase!!
      </Text>
      <Text style={TYPOGRAPHY.pWhite as any}>
        Ensure you have a backup first.
      </Text>
      <Button onPress={onResetWallet}>Create new wallet</Button>
    </View>
  );
};

export default ResetWalletView;
