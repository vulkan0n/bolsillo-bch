import React from "react";
import { View, Text, Dimensions } from "react-native";
import {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
} from "react-native-chart-kit";
import COLOURS from "@selene/common/design/colours";
import SPACING from "@selene/common/design/spacing";

const DailyActiveBitcoinersChart = () => {
  return (
    <View>
      <LineChart
        data={{
          labels: ["23/9", "24/9", "25/9", "26/9"],
          datasets: [
            {
              data: [1, 5, 10, 10],
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
