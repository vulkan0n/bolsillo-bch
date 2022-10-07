import React, { useState } from "react";
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
import ActiveBitcoinersChart from "./ActiveBitcoinersChart";
import { useQuery, gql } from "@apollo/client";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";

const GET_ACTIVE_BITCOINERS = gql`
  query GetActiveBitcoiners($period: String!) {
    activeBitcoiners(period: $period) {
      date
      count
    }
  }
`;

function StatsView({ navigation }) {
  const [period, setPeriod] = useState(CHECK_IN_PERIOD_TYPES.daily);

  const { loading, error, data } = useQuery(GET_ACTIVE_BITCOINERS, {
    variables: {
      period,
    },
  });

  if (loading) {
    return <Text>Loading...</Text>;
  }

  console.log({ error });

  if (error) {
    return <Text>Error!</Text>;
  }

  const activeBitcoiners =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 0;
  const missionPercentage = (ONE_HUNDRED / TEN_MILLION) * activeBitcoiners;
  const title = () => {
    switch (period) {
      case CHECK_IN_PERIOD_TYPES.daily:
        return "Today:";
      case CHECK_IN_PERIOD_TYPES.weekly:
        return "This week:";
      case CHECK_IN_PERIOD_TYPES.monthly:
        return "This month:";
      case CHECK_IN_PERIOD_TYPES.yearly:
        return "This year:";
      default:
        return "Today";
    }
  };

  return (
    <ScrollView style={styles.scrollView as any}>
      <View style={styles.container as any}>
        <Text style={TYPOGRAPHY.h1black as any}>Stats</Text>
        <Text style={TYPOGRAPHY.p as any}>
          Selene Wallet is on a mission to make Bitcoin Cash the most used
          currency in the world.
        </Text>
        <View style={styles.activeBitcoiners}>
          <Text style={TYPOGRAPHY.h2black as any}>{title()}</Text>
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
            10 million active Selene Bitcoiners will form a vibrant economy
            larger than many countries, and quickly snowball globally.
          </Text>
          <ActiveBitcoinersChart
            data={data}
            period={period}
            setPeriod={setPeriod}
          />
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
