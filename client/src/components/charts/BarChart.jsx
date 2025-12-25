import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * Bar Chart Component
 * @param {object} props
 * @param {Array} props.data - Chart data
 * @param {Array} props.bars - Bars configuration [{dataKey, fill, name}]
 * @param {string} props.xKey - X-axis data key
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height
 * @param {boolean} props.stacked - Stacked bars
 */
export const BarChart = ({
  data = [],
  bars = [],
  xKey = "name",
  title,
  height = 300,
  stacked = false,
  options: optionsOverride,
}) => {
  const defaultData = {
    labels: [],
    datasets: [],
  };

  const chartData = data || defaultData;

  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
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
  const options = {
    ...baseOptions,
    ...(optionsOverride || {}),
    plugins: {
      ...baseOptions.plugins,
      ...(optionsOverride?.plugins || {}),
    },
    scales: {
      ...baseOptions.scales,
      ...(optionsOverride?.scales || {}),
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
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarChart;
