import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import {
  ONE_HUNDRED,
  TEN_MILLION,
  CHECK_IN_PERIOD_TYPES,
} from "@selene-wallet/common/dist/utils/consts";
import styles from "./styles";
import ActiveBitcoinersChart from "./ActiveBitcoinersChart";
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "@selene-wallet/common/dist/graphql/queries/getActiveBitcoiners";

interface GraphQlResponse {
  loading: boolean;
  error?: ApolloError;
  data: QueryResult<{
    activeBitcoiners: TODO;
  }>;
}

function StatsView() {
  const [period, setPeriod] = useState(CHECK_IN_PERIOD_TYPES.daily);

  const { loading, error, data }: GraphQlResponse = useQuery(
    GET_ACTIVE_BITCOINERS,
    {
      variables: {
        period,
      },
    }
  );

  const activeBitcoiners =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 1;
  const missionPercentage = parseFloat(
    ((ONE_HUNDRED / TEN_MILLION) * activeBitcoiners).toFixed(5)
  );

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
            loading={loading}
            error={error}
            data={data}
            period={period}
            setPeriod={setPeriod}
          />
        </View>
      </View>
    </ScrollView>
  );
}

export default StatsView;
