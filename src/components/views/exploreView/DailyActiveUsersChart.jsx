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
import { useQuery } from "@apollo/client";
import GET_ACTIVE_BITCOINERS from "./getActiveBitcoiners";
import { THIRTY_SECONDS } from "@/util/time";
import { ONE_HUNDRED, TEN_MILLION } from "@/util/numbers";

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

const DailyActiveUsersChart = () => {
  const { loading, error, data, startPolling, stopPolling } = useQuery(
    GET_ACTIVE_BITCOINERS,
    {
      variables: {
        period: "DAILY",
      },
    }
  );

  useEffect(() => {
    startPolling(THIRTY_SECONDS);

    return stopPolling;
  }, []);

  console.log({ data });

  const activeBitcoiners =
    data?.activeBitcoiners?.[data?.activeBitcoiners.length - 1]?.count || 1;
  const missionPercentage = parseFloat(
    ((ONE_HUNDRED / TEN_MILLION) * activeBitcoiners).toFixed(5)
  );

  return (
    <div className={"flex justify-center align-center"}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default DailyActiveUsersChart;
