import React from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  ONE_HUNDRED,
  TEN_MILLION,
} from "@selene-wallet/common/dist/utils/consts";
import styles from "./styles";
import Button from "@selene-wallet/app/src/components/atoms/Button";
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
        <View style={styles.activeBitcoiners}>
          <Text style={TYPOGRAPHY.h2black as any}>Last 24 hours:</Text>
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
            style={TYPOGRAPHY.p as any}
          >{`${missionPercentage}% of 10 000 000 target`}</Text>
          <Text style={TYPOGRAPHY.p as any}>
            10 million active Bitcoiners will form a vibrant economy larger than
            many countries, and quickly snowball globally.
          </Text>
          <DailyActiveBitcoinersChart />
        </View>

        <Text style={TYPOGRAPHY.h2black as any}>Get involved!</Text>
        <Text style={TYPOGRAPHY.p as any}>
          You are not included in the statistics. Selene respects your privacy.
          User activity tracking is opt-in and no individual data is collected,
          only anonymous aggregates.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          By opting in, you can help the BCH community and Selene developers
          observe growing engagement with the BCH economy.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          All Selene source code and data is publically available.
        </Text>
        <Text style={TYPOGRAPHY.p as any}>
          Once activated, you can opt out any time in Tools {">"} Settings.
        </Text>
        <Button onPress={() => {}}>Activate</Button>
        <Button onPress={() => {}}>Read more</Button>
      </View>
    </ScrollView>
  );
}

export default StatsView;
