import React from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";
import { useQuery, gql } from "@apollo/client";
import moment from "moment";

const DailyActiveBitcoinersChart = () => {
  const { loading, error, data } = useQuery(gql`
    query GetDailyActiveBitcoiners {
      dailyActiveBitcoiners {
        date
        count
      }
    }
  `);

  const dailyActiveUserCount = data?.dailyActiveBitcoiners?.map?.(
    ({ count }) => count
  );
  const labels = data?.dailyActiveBitcoiners?.map?.(({ date }) =>
    moment(date).format("D MMM")
  );

  if (loading) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <LineChart
        data={{
          labels,
          datasets: [
            {
              data: dailyActiveUserCount,
            },
          ],
        }}
        width={Dimensions.get("window").width - 60} // from react-native
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1}
        chartConfig={{
          backgroundColor: COLOURS.white,
          backgroundGradientFrom: COLOURS.white,
          backgroundGradientTo: COLOURS.white,
          decimalPlaces: 0,
          color: (opacity) => COLOURS.bchGreen,
          labelColor: (opacity) => COLOURS.black,
          propsForDots: {
            // r: "6",
            // strokeWidth: "2",
            stroke: COLOURS.bchGreen,
          },
        }}
        bezier
        style={{
          backgroundColor: COLOURS.veryLightGrey,
          // borderColor: COLOURS.lightGrey,
          // borderWidth: 1,
          // borderRadius: SPACING.borderRadius,
          marginTop: SPACING.fifteen,
          marginBottom: SPACING.five,
        }}
      />
    </View>
  );
};

export default DailyActiveBitcoinersChart;
