import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useQuery, gql } from "@apollo/client";
import moment from "moment";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import Chart from "./Chart";

const GET_ACTIVE_BITCOINERS = gql`
  query GetActiveBitcoiners($period: String!) {
    activeBitcoiners(period: $period) {
      date
      count
    }
  }
`;

const ActiveBitcoinersChart = () => {
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

  const activeUserCount = data?.activeBitcoiners?.map?.(({ count }) => count);
  const labels = data?.activeBitcoiners?.map?.(({ date }) =>
    moment(date).format("D MMM")
  );

  console.log({ labels, data });

  return (
    <View>
      {period !== CHECK_IN_PERIOD_TYPES.daily && (
        <Pressable
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.daily);
          }}
        >
          <Text>Daily</Text>
        </Pressable>
      )}
      {period !== CHECK_IN_PERIOD_TYPES.weekly && (
        <Pressable
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.weekly);
          }}
        >
          <Text>Weekly</Text>
        </Pressable>
      )}
      {period !== CHECK_IN_PERIOD_TYPES.monthly && (
        <Pressable
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.monthly);
          }}
        >
          <Text>Monthly</Text>
        </Pressable>
      )}
      {period !== CHECK_IN_PERIOD_TYPES.yearly && (
        <Pressable
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.yearly);
          }}
        >
          <Text>Yearly</Text>
        </Pressable>
      )}
      <Chart data={activeUserCount} labels={labels} />
    </View>
  );
};

export default ActiveBitcoinersChart;
