import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@design/colours";
import SPACING from "@design/spacing";
import TYPOGRAPHY from "@design/typography";
import { ONE_HUNDRED, TEN_MILLION } from "@utils/consts";
import styles from "./styles";
import Button from "@atoms/Button";
import DailyActiveBitcoinersChart from "./DailyActiveBitcoinersChart";

function StatsView({ navigation }) {
  const activeBitcoiners = 1;
  const missionPercentage = (ONE_HUNDRED / TEN_MILLION) * activeBitcoiners;

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1black as any}>Stats</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Selene Wallet is on a mission to make Bitcoin Cash the most used
          currency in the world.
        </Text>
        <Text style={TYPOGRAPHY.h2black as any}>Daily Active Bitcoiners</Text>
        <DailyActiveBitcoinersChart />
        <Text>You are untracked. Tap to learn more.</Text>
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
          >{`${missionPercentage}% of 10 000 000 target`}</Text>
        </View>
        <Text style={TYPOGRAPHY.p as any}>
          10 million daily active Bitcoiners will form a vibrant economy larger
          than many countries, and quickly snowball to the rest of the world.
        </Text>
        <Text style={TYPOGRAPHY.h2black as any}>Get involved!</Text>
        <Text style={TYPOGRAPHY.p as any}>
          You are not included in the statistics. Selene respects your
          privacy. User activity tracking is opt-in and no individual data is
          collected, only anonymous aggregates.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          By opting in, you can help the BCH community and Selene developers
          observe growing engagement with the BCH economy.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          All Selene source code and data is publically available.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Once activated, you can opt out any time in Tools > Settings.
        </Text>
        <Button>Activate</Button>
        <Button>Read more</Button>
      </View>
    </ScrollView>
  );
}

export default StatsView;
