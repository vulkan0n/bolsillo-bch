import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const Chart = ({ labels, data }) => {
  return (
    <LineChart
      data={{
        labels,
        datasets: [
          {
            data,
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
  );
};

export default Chart;
