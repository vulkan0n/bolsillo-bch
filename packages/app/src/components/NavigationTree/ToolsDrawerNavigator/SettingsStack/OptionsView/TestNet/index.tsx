import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "../styles";
import COLOURS from "@selene-wallet/common/design/colours";
import { toggleIsTestNet } from "@selene-wallet/app/src/redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";

const TestNet = () => {
  const dispatch = useDispatch();
  const { isTestNet } = useSelector((state: ReduxState) => state.settings);
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsTestNet = () => {
    dispatch(toggleIsTestNet());
  };

  const TestNetSwitch = (
    <View style={styles.control}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.lightGrey }}
        thumbColor={COLOURS.white}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsTestNet}
        value={isTestNet}
        style={{
          borderColor: COLOURS.bchGreen,
          borderWidth: 2,
        }}
      />
    </View>
  );

  return (
    <Pressable onPress={handleToggleIsTestNet} style={styles.optionRow as any}>
      {!isRightHandedMode && TestNetSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Test Net</Text>
        {isTestNet && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Connected to the BCH TestNet.
          </Text>
        )}
        {!isTestNet && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Currently connected to BCH main network. If you don't know about
            TestNet, don't change this.
          </Text>
        )}
      </View>
      {isRightHandedMode && TestNetSwitch}
    </Pressable>
  );
};

export default TestNet;
