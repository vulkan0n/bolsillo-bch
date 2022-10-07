import React from "react";
import { View, Text, Pressable } from "react-native";
import moment from "moment";
import { CHECK_IN_PERIOD_TYPES } from "@selene-wallet/common/dist/utils/consts";
import Chart from "./Chart";
import COLOURS from "@selene-wallet/common/design/colours";
import TYPOGRAPHY from "@selene-wallet/common/design/typography";
import SPACING from "@selene-wallet/common/design/spacing";

const ActiveBitcoinersChart = ({ data, period, setPeriod }) => {
  const activeUserCount = data?.activeBitcoiners?.map?.(({ count }) => count);
  const labels = data?.activeBitcoiners?.map?.(({ date }) =>
    moment(date).format(
      period === CHECK_IN_PERIOD_TYPES.yearly ? "YYYY" : "D MMM"
    )
  );

  console.log({ labels, data });

  return (
    <View>
      <Chart data={activeUserCount} labels={labels} />
      <View
        style={{
          height: 50,
          width: "100%",
          borderWidth: 1,
          flexDirection: "row",
          borderColor: COLOURS.lightGrey,
          borderRadius: SPACING.borderRadius,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Pressable
          style={{
            backgroundColor:
              period === CHECK_IN_PERIOD_TYPES.daily
                ? COLOURS.bchGreen
                : COLOURS.white,
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.daily);
          }}
        >
          <Text
            style={{
              ...TYPOGRAPHY.p,
              color:
                period === CHECK_IN_PERIOD_TYPES.daily
                  ? COLOURS.white
                  : COLOURS.bchGreen,
            }}
          >
            Daily
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor:
              period === CHECK_IN_PERIOD_TYPES.weekly
                ? COLOURS.bchGreen
                : COLOURS.white,
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.weekly);
          }}
        >
          <Text
            style={{
              ...TYPOGRAPHY.p,
              color:
                period === CHECK_IN_PERIOD_TYPES.weekly
                  ? COLOURS.white
                  : COLOURS.bchGreen,
            }}
          >
            Weekly
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor:
              period === CHECK_IN_PERIOD_TYPES.monthly
                ? COLOURS.bchGreen
                : COLOURS.white,
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.monthly);
          }}
        >
          <Text
            style={{
              ...TYPOGRAPHY.p,
              color:
                period === CHECK_IN_PERIOD_TYPES.monthly
                  ? COLOURS.white
                  : COLOURS.bchGreen,
            }}
          >
            Monthly
          </Text>
        </Pressable>
        <Pressable
          style={{
            backgroundColor:
              period === CHECK_IN_PERIOD_TYPES.yearly
                ? COLOURS.bchGreen
                : COLOURS.white,
            flex: 1,
            width: "100%",
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={() => {
            setPeriod(CHECK_IN_PERIOD_TYPES.yearly);
          }}
        >
          <Text
            style={{
              ...TYPOGRAPHY.p,
              color:
                period === CHECK_IN_PERIOD_TYPES.yearly
                  ? COLOURS.white
                  : COLOURS.bchGreen,
            }}
          >
            Yearly
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

export default ActiveBitcoinersChart;
