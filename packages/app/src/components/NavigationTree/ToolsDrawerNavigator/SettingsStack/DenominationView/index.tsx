import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import Button from "@selene/app/src/components/atoms/Button";
import TYPOGRAPHY from "@selene/common/design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons/faCoins";
import COLOURS from "@selene/common/design/colours";
import { ReduxState } from "@selene/app/src/types";
import Divider from "@selene/app/src/components/atoms/Divider";
import SPACING from "@selene/common/design/spacing";
import { updateBitcoinDenomination } from "@selene/app/src/redux/reducers/settingsReducer";
import StackSubheader from "@selene/app/src/components/atoms/StackSubheader";
import { BITCOIN_DENOMINATIONS } from "@selene/app/src/utils/consts";

function DenominationView() {
  const dispatch = useDispatch();
  const { bitcoinDenomination } = useSelector(
    (state: ReduxState) => state.settings
  );

  const denominations = [
    {
      units: "1",
      abbreviation: "BCH",
      name: "(Bitcoin Cash)",
      setting: BITCOIN_DENOMINATIONS.bitcoins,
    },
    {
      units: "1 000",
      abbreviation: "mBCH",
      name: "(millibits)",
      setting: BITCOIN_DENOMINATIONS.millibits,
    },
    {
      units: "1 000 000",
      abbreviation: "bits",
      name: "(bits)",
      setting: BITCOIN_DENOMINATIONS.bits,
    },
    {
      units: "100 000 000",
      abbreviation: "sats",
      name: "(satoshis)",
      setting: BITCOIN_DENOMINATIONS.satoshis,
    },
  ];

  return (
    <View style={{ flex: 1 }}>
      <StackSubheader title={"Denomination"} isBackButton />
      <ScrollView style={styles.scrollView}>
        <View style={styles.container as any}>
          <View style={styles.iconContainer}>
            <FontAwesomeIcon
              icon={faCoins}
              size={50}
              color={COLOURS.bchGreen}
            />
          </View>
          <Text style={TYPOGRAPHY.pWhite as any}>
            The smallest unit of a bitcoin is a satoshi, named after the
            currency's creator. Like there are 100 cents in a US dollar, there
            are 100 million sats (satoshis) in a bitcoin.
          </Text>
          <Divider />
          <Text style={TYPOGRAPHY.pWhite as any}>Display 1 bitcoin as:</Text>
          {denominations.map(({ name, abbreviation, units, setting }) => {
            const isSelected = setting === bitcoinDenomination;
            const onPress = () => {
              dispatch(
                updateBitcoinDenomination({ bitcoinDenomination: setting })
              );
            };

            return (
              <Pressable
                key={abbreviation}
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
                  {units}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={
                      {
                        ...TYPOGRAPHY.h2,
                        textAlign: "left",
                        paddingLeft: SPACING.five,
                        color: isSelected ? COLOURS.bchGreen : COLOURS.white,
                      } as any
                    }
                  >
                    {abbreviation}
                  </Text>
                  <Text
                    style={
                      {
                        ...TYPOGRAPHY.pWhite,
                        textAlign: "left",
                        marginLeft: SPACING.five,
                        color: isSelected ? COLOURS.bchGreen : COLOURS.white,
                      } as any
                    }
                  >
                    {name}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

export default DenominationView;
