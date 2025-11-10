import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
  const colors = ["#132440", "#3B9797", "#16476A", "#BF092F", "#770000"];

  let chartData = data;

  // Convert Chart.js format to Recharts format
  if (!data) {
    chartData = [];
  } else if (!Array.isArray(data) && data.labels && data.datasets) {
    chartData = (data.labels || []).map((label, index) => {
      const item = { [xKey]: label };
      (data.datasets || []).forEach((dataset, datasetIndex) => {
        item[dataset.label || `dataset${datasetIndex}`] =
          (dataset.data || [])[index] || 0;
      });
      return item;
    });
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey={xKey} stroke="#6b7280" style={{ fontSize: "12px" }} />
          <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          {lines.length > 0
            ? lines.map((line, index) => (
                <Line
                  key={line.dataKey}
                  type="monotone"
                  dataKey={line.dataKey}
                  stroke={line.stroke || colors[index % colors.length]}
                  strokeWidth={2}
                  name={line.name || line.dataKey}
                  activeDot={{ r: 6 }}
                />
              ))
            : // Auto-generate lines from data keys
              chartData.length > 0 &&
              Object.keys(chartData[0])
                .filter((key) => key !== xKey)
                .map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    name={key}
                    activeDot={{ r: 6 }}
                  />
                ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default LineChart;
