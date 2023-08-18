import React, { useEffect } from "react";
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

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: "top",
    },
    title: {
      display: false,
      text: "Chart.js Line Chart",
    },
  },
};

const DailyActiveUsersChart = ({ data }) => {
  const labels = data.activeBitcoiners.map(({ date }) =>
    moment(date).format("ddd Do MMM")
  );
  console.log({ labels });

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Active Selene Users",
        data: labels.map((_, i) => i + 100),
        borderColor: "#8dc451",
        backgroundColor: "#8dc451",
      },
    ],
  };

  return (
    <div className={"flex justify-center align-center"}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default DailyActiveUsersChart;
