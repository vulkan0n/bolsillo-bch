import React from "react";
import { View, Text, Switch } from "react-native";
import TYPOGRAPHY from "../../../../../../design/typography";
import styles from "../styles";
import COLOURS from "../../../../../../design/colours";
import { toggleIsRightHandedMode } from "../../../../../../redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "../../../../../../types";

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
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isRightHandedMode ? COLOURS.white : COLOURS.black}
        ios_backgroundColor={COLOURS.lightGrey}
        onValueChange={handleToggleIsRightHandedMode}
        value={isRightHandedMode}
      />
    </View>
  );

  return (
    <View style={styles.optionRow as any}>
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
    </View>
  );
};

export default RightHandedMode;
