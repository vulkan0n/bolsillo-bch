import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "../styles";
import COLOURS from "@selene-wallet/common/design/colours";
import { toggleIsRightHandedMode } from "@selene-wallet/app/src/redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";

const RightHandedMode = () => {
  const dispatch = useDispatch();
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsRightHandedMode = () => {
    dispatch(toggleIsRightHandedMode());
  };

  const RightHandedModeSwitch = (
    <View style={styles.control}>
      <Switch
        trackColor={{ true: COLOURS.white, false: COLOURS.black }}
        thumbColor={isRightHandedMode ? COLOURS.bchGreen : COLOURS.lightGrey}
        ios_backgroundColor={COLOURS.black}
        onValueChange={handleToggleIsRightHandedMode}
        value={isRightHandedMode}
        style={{
          borderColor: COLOURS.bchGreen,
          borderWidth: 2,
        }}
      />
    </View>
  );

  return (
    <Pressable
      onPress={handleToggleIsRightHandedMode}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && RightHandedModeSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Right Handed Mode</Text>
        {isRightHandedMode && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Interactive components tend to appear on right of screen for easy
            thumb access. Change if left-hand dominant.
          </Text>
        )}
        {!isRightHandedMode && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Interactive components tend to appear on left of screen for easy
            thumb access. Change if right-hand dominant.
          </Text>
        )}
      </View>
      {isRightHandedMode && RightHandedModeSwitch}
    </Pressable>
  );
};

export default RightHandedMode;
