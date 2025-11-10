import React from "react";
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

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

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex flex-col items-center justify-center"
        style={{ height }}
      >
        {title && (
          <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
        )}
        <div className="flex items-center justify-center w-full h-full text-gray-400 text-base">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-primary mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={showLabels}
            label={renderLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={chartColors[index % chartColors.length]}
              />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PieChart;
