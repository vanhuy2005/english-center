import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ data, height = 300 }) => {
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
        position: "bottom",
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
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

export default DoughnutChart;
