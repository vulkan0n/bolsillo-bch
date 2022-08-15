import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "../../../../design/colours";
import SPACING from "../../../../design/spacing";
import TYPOGRAPHY from "../../../../design/typography";
import { ONE_HUNDRED, TEN_MILLION } from "../../../../utils/consts";
import styles from "./styles";

function OnlineView({ navigation }) {
  const activeBitcoiners = 1;
  const missionPercentage = (ONE_HUNDRED / TEN_MILLION) * activeBitcoiners;

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1black as any}>
          Welcome to the BCH community!
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Selene Wallet is on a mission to make Bitcoin Cash the most used
          currency in the world.
        </Text>
        <View style={styles.activeBitcoiners}>
          <Text style={TYPOGRAPHY.h2 as any}>Last 24 hours:</Text>
          <Text
            style={
              {
                ...TYPOGRAPHY.subtitle,
                color: COLOURS.bchGreen,
                marginBottom: 10,
              } as any
            }
          >
            {activeBitcoiners} Active Bitcoiners
          </Text>
          <Text
            style={TYPOGRAPHY.pWhite as any}
          >{`${missionPercentage}% of 10 000 000`}</Text>
        </View>
        <Text style={TYPOGRAPHY.p as any}>
          10 million daily active Bitcoiners will form a vibrant economy larger
          than many countries, and quickly snowball to the rest of the world.
        </Text>
        <Text style={TYPOGRAPHY.h2black as any}>Get involved!</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Use the menu bar to learn more about Bitcoin Cash, connect and trade
          with other Bitcoiners.
        </Text>
      </View>
    </ScrollView>
  );
}

export default OnlineView;
