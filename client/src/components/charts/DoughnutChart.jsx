import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * Doughnut Chart Component (for student progress)
 * @param {object} props
 * @param {Array|object} props.data - Chart data [{label, value}] or Chart.js format {labels, datasets}
 * @param {string} props.title - Chart title
 * @param {number} props.height - Chart height
 * @param {Array} props.colors - Custom colors array
 */
export const DoughnutChart = ({ data = [], title, height = 300, colors }) => {
  const defaultColors = ["#132440", "#3B9797", "#16476A", "#BF092F", "#770000"];
  const chartColors = colors || defaultColors;

  let chartData;

  // Handle different data formats and null/undefined cases
  if (!data) {
    // Empty data
    chartData = {
      labels: [],
      datasets: [
        { data: [], backgroundColor: [], borderColor: "#fff", borderWidth: 2 },
      ],
    };
  } else if (Array.isArray(data)) {
    // Format: [{label, value}]
    chartData = {
      labels: data.map((item) => item?.label || "").filter(Boolean),
      datasets: [
        {
          data: data.map((item) => item?.value || 0),
          backgroundColor: chartColors,
          borderColor: "#fff",
          borderWidth: 2,
        },
      ],
    };
  } else if (data.labels && data.datasets) {
    // Chart.js format
    chartData = {
      labels: data.labels || [],
      datasets: (data.datasets || []).map((dataset) => ({
        ...dataset,
        backgroundColor: dataset.backgroundColor || chartColors,
        borderColor: dataset.borderColor || "#fff",
        borderWidth: dataset.borderWidth || 2,
      })),
    };
  } else {
    // Empty data
    chartData = {
      labels: [],
      datasets: [
        { data: [], backgroundColor: [], borderColor: "#fff", borderWidth: 2 },
      ],
    };
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 15,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: "#fff",
        titleColor: "#132440",
        bodyColor: "#6b7280",
        borderColor: "#e5e7eb",
        borderWidth: 1,
        padding: 12,
        displayColors: true,
      },
    },
    cutout: "70%",
  };

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <div style={{ height: `${height}px` }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
};

export default DoughnutChart;

