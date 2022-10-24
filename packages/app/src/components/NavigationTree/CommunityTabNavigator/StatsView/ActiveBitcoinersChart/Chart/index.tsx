import React from "react";
import { Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import COLOURS from "@selene-wallet/common/design/colours";
import SPACING from "@selene-wallet/common/design/spacing";

const Chart = ({ labels, data, chartHeight }) => (
  <LineChart
    data={{
      labels,
      datasets: [
        {
          data,
        },
      ],
    }}
    width={Dimensions.get("window").width - 60}
    height={chartHeight}
    yAxisLabel=""
    yAxisSuffix=""
    yAxisInterval={1}
    chartConfig={{
      backgroundColor: COLOURS.white,
      backgroundGradientFrom: COLOURS.white,
      backgroundGradientTo: COLOURS.white,
      decimalPlaces: 0,
      color: () => COLOURS.bchGreen,
      labelColor: () => COLOURS.black,
      propsForDots: {
        stroke: COLOURS.bchGreen,
      },
    }}
    bezier
    style={{
      backgroundColor: COLOURS.veryLightGrey,
      marginTop: SPACING.fifteen,
      marginBottom: SPACING.five,
    }}
  />
);

export default Chart;
