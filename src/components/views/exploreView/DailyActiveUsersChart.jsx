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

const labels = ["January", "February", "March", "April", "May", "June", "July"];

const data = {
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

const DailyActiveUsersChart = () => {
  return (
    <div className={"flex justify-center align-center"}>
      <Line options={options} data={data} />
    </div>
  );
};

export default DailyActiveUsersChart;
