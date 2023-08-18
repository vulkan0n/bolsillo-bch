import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";
import moment from "moment";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const DailyActiveUsersChart = ({ data }) => {
  const labels = data.activeBitcoiners.map(({ date }) =>
    moment(date).format("ddd Do MMM")
  );

  const dataPoints = data.activeBitcoiners.map(({ count }) => count);

  const maxCount = Math.max(
    ...data.activeBitcoiners.map(({ count }) => parseInt(count))
  );

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Active Selene Users",
        data: dataPoints,
        borderColor: "#8dc451",
        backgroundColor: "#8dc451",
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        display: false,
      },
      title: {
        display: false,
        text: "Chart.js Line Chart",
      },
    },
    scales: {
      y: {
        min: 0,
        max: maxCount,
      },
    },
  };

  return (
    <div className={"flex justify-center align-center"}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default DailyActiveUsersChart;
