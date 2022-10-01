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
        width={Dimensions.get("window").width - 40} // from react-native
        height={220}
        yAxisLabel=""
        yAxisSuffix=""
        yAxisInterval={1} // optional, defaults to 1
        chartConfig={{
          backgroundColor: COLOURS.white,
          //   backgroundGradientFrom: "#fb8c00",
          //   backgroundGradientTo: "#ffa726",
          decimalPlaces: 0, // optional, defaults to 2dp
          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
          style: {
            borderRadius: SPACING.borderRadius,
            borderColor: COLOURS.black,
            borderWidth: 2,
          },
          propsForDots: {
            // r: "6",
            // strokeWidth: "2",
            stroke: COLOURS.bchGreen,
          },
        }}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default DailyActiveBitcoinersChart;
