/*import {
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
import { DateTime } from "luxon";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function DailyActiveUsersChart({ data }) {
  const labels = data.activeBitcoiners.map(({ date }) =>
    DateTime(date).format("ddd Do")
  );

  const dataPoints = data.activeBitcoiners.map(({ count }) => count);

  const maxCount = Math.max(
    ...data.activeBitcoiners.map(({ count }) => parseInt(count))
  );
  const maxCountRoundedUpToNearest10 = Math.ceil(maxCount / 10) * 10;

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Active Selene Users",
        data: dataPoints,
        borderColor: "#478559",
        backgroundColor: "#478559",
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
        max: maxCountRoundedUpToNearest10,
      },
    },
  };

  return (
    <div className="flex justify-center align-center">
      <Line options={options} data={chartData} />
    </div>
  );
}

export default DailyActiveUsersChart;*/
