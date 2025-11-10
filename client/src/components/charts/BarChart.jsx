import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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
}) => {
  const colors = ["#132440", "#3B9797", "#16476A", "#BF092F", "#770000"];

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
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
          {bars.map((bar, index) => (
            <Bar
              key={bar.dataKey}
              dataKey={bar.dataKey}
              fill={bar.fill || colors[index % colors.length]}
              name={bar.name || bar.dataKey}
              stackId={stacked ? "stack" : undefined}
              radius={[8, 8, 0, 0]}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChart;
