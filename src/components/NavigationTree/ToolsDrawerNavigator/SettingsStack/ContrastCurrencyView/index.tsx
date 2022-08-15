import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMoneyBillWave } from "@fortawesome/free-solid-svg-icons/faMoneyBillWave";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import Divider from "../../../../atoms/Divider";
import SPACING from "../../../../../design/spacing";
import { updateContrastCurrency } from "../../../../../redux/reducers/settingsReducer";
import { SUPPORTED_CURRENCIES } from "../../../../../utils/consts";

function ContrastCurrencyView() {
  const dispatch = useDispatch();
  const { contrastCurrency } = useSelector(
    (state: ReduxState) => state.settings
  );

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container as any}>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon
            icon={faMoneyBillWave}
            size={50}
            color={COLOURS.bchGreen}
          />
        </View>
        <Text style={TYPOGRAPHY.h2 as any}>Contrast Currency</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          Transacting and thinking in Bitcoin Cash becomes natural over time via
          exposure to the Bitcoin Cash economy. However it's still helpful to
          retain a reference to other currencies for interacting with legacy
          financial systems or new BCH adopters.
        </Text>
        <Divider />
        <Text style={TYPOGRAPHY.pWhite as any}>
          Contrast BCH prices with the:
        </Text>
        {SUPPORTED_CURRENCIES.map(({ code, fullName }) => {
          const isSelected = code === contrastCurrency;
          const onPress = () => {
            dispatch(updateContrastCurrency({ contrastCurrency: code }));
          };

          return (
            <Pressable
              key={code}
              onPress={onPress}
              style={
                {
                  flex: 1,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  width: "100%",
                } as any
              }
            >
              <Text
                style={
                  {
                    ...TYPOGRAPHY.h2,
                    textAlign: "right",
                    flex: 1,
                    paddingRight: SPACING.five,
                    color: isSelected ? COLOURS.bchGreen : COLOURS.white,
                  } as any
                }
              >
                {code.toUpperCase()}
              </Text>
              <Text
                style={
                  {
                    ...TYPOGRAPHY.h2,
                    flex: 3,
                    textAlign: "left",
                    paddingLeft: SPACING.five,
                    color: isSelected ? COLOURS.bchGreen : COLOURS.white,
                  } as any
                }
              >
                {fullName}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

export default ContrastCurrencyView;
