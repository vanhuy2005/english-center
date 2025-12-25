import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Pie Chart Component
 * @param {object} props
 * @param {Array} props.data - Chart data [{name, value}]
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height
 * @param {Array} props.colors - Custom colors array
 * @param {boolean} props.showLabels - Show labels on slices
 */
export const PieChart = ({
  data = [],
  title,
  height = 300,
  colors,
  showLabels = true,
  options: optionsOverride,
}) => {
  const defaultColors = [
    "#132440",
    "#3B9797",
    "#16476A",
    "#BF092F",
    "#770000",
    "#4ade80",
    "#fb923c",
  ];
  const chartColors = colors || defaultColors;

  const renderLabel = (entry) => {
    if (!showLabels) return null;
    return `${entry.name}: ${entry.value}`;
  };

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
        position: "bottom",
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
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default PieChart;
