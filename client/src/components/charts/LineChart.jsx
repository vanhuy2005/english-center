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

/**
 * Line Chart Component
 * @param {object} props
 * @param {Array|object} props.data - Chart data (Recharts format or Chart.js format)
 * @param {Array} props.lines - Lines configuration [{dataKey, stroke, name}]
 * @param {string} props.xKey - X-axis data key
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height
 */

export const LineChart = ({
  data = [],
  lines = [],
  xKey = "name",
  title,
  height = 300,
}) => {
  const defaultData = {
    labels: [],
    datasets: [],
  };

  const chartData = data || defaultData;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  if (!chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        Chưa có dữ liệu
      </div>
    );
  }

  return (
    <div style={{ height: `${height}px` }}>
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineChart;
