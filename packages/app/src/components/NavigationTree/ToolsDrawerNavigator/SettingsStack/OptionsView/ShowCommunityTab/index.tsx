import React from "react";
import { View, Text, Switch, Pressable } from "react-native";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import styles from "../styles";
import COLOURS from "@selene-wallet/common/design/colours";
import { toggleIsShowCommunityTab } from "@selene-wallet/app/src/redux/reducers/settingsReducer";
import { useSelector, useDispatch } from "react-redux";
import { ReduxState } from "@selene-wallet/common/dist/types";

const BchDenominated = () => {
  const dispatch = useDispatch();
  const { isShowCommunityTab } = useSelector(
    (state: ReduxState) => state.settings
  );
  const { isRightHandedMode } = useSelector(
    (state: ReduxState) => state.settings
  );

  const handleToggleIsShowCommunityTab = () => {
    dispatch(toggleIsShowCommunityTab());
  };

  const BchDenominatedSwitch = (
    <View style={styles.control as any}>
      <Switch
        trackColor={{ true: COLOURS.bchGreen, false: COLOURS.white }}
        thumbColor={isShowCommunityTab ? COLOURS.white : COLOURS.bchGreen}
        ios_backgroundColor={COLOURS.white}
        onValueChange={handleToggleIsShowCommunityTab}
        value={isShowCommunityTab}
      />
    </View>
  );

  return (
    <Pressable
      onPress={handleToggleIsShowCommunityTab}
      style={styles.optionRow as any}
    >
      {!isRightHandedMode && BchDenominatedSwitch}
      <View style={{ width: 250 }}>
        <Text style={TYPOGRAPHY.h2Left as any}>Show Community Tab</Text>
        {isShowCommunityTab && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Dive into the latest from the BCH community any time!
          </Text>
        )}
        {!isShowCommunityTab && (
          <Text style={TYPOGRAPHY.pWhiteLeft as any}>
            Community tab hidden.
          </Text>
        )}
      </View>
      {isRightHandedMode && BchDenominatedSwitch}
    </Pressable>
  );
};

export default BchDenominated;
