import React, { useState } from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { useSelector } from "react-redux";
import Button from "../../../../atoms/Button";
import TYPOGRAPHY from "../../../../../design/typography";
import styles from "./styles";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons/faCoins";
import COLOURS from "../../../../../design/colours";
import { ReduxState } from "../../../../../types";
import Divider from "../../../../atoms/Divider";
import SPACING from "../../../../../design/spacing";

function DenominationView() {
  const { navigatedWalletName } = useSelector(
    (state: ReduxState) => state.walletManager
  );

  const denominations = [
    {
      units: "1",
      abbreviation: "BCH",
      name: "(Bitcoin Cash)",
    },
    {
      units: "1 000",
      abbreviation: "mBCH",
      name: "(millibits)",
    },
    {
      units: "1 000 000",
      abbreviation: "bits",
      name: "",
    },
    {
      units: "100 000 000",
      abbreviation: "sats",
      name: "(satoshis)",
    },
  ];

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container as any}>
        <View style={styles.iconContainer}>
          <FontAwesomeIcon icon={faCoins} size={50} color={COLOURS.bchGreen} />
        </View>
        <Text style={TYPOGRAPHY.h2 as any}>Denomination</Text>
        <Text style={TYPOGRAPHY.pWhite as any}>
          The smallest unit of a bitcoin is a satoshi, named after the
          currency's creator. Like there are 100 cents in a US dollar, there are
          100 million satoshis (sats) in a bitcoin.
        </Text>
        <Divider />
        <Text style={TYPOGRAPHY.pWhite as any}>Display 1 bitcoin as:</Text>
        {denominations.map(({ name, abbreviation, units }) => (
          <View
            style={
              {
                flex: 1,
                flexDirection: "row",
                borderColor: COLOURS.white,
                justifyContent: "space-between",
                alignItems: "flex-start",
                width: "100%",
                backgroundColor: "red",
              } as any
            }
          >
            <Text
              style={
                {
                  ...TYPOGRAPHY.h2,
                  textAlign: "right",
                  flex: 1,
                  backgroundColor: "blue",
                  marginRight: SPACING.five,
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
                    marginLeft: SPACING.five,
                    flex: 8,
                    backgroundColor: "green",
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
                    flex: 20,
                    backgroundColor: "green",
                  } as any
                }
              >
                {name}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

export default DenominationView;
