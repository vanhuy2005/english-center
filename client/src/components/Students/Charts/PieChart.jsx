import React from "react";

function PieChart({ data }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  let cumulativePercentage = 0;
  const slices = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    const endAngle = ((cumulativePercentage + percentage) / 100) * 360;

    cumulativePercentage += percentage;

    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
    };
  });

  const radius = 80;

  return (
    <div className="pie-chart-wrapper">
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        className="pie-chart-svg"
      >
        <circle
          cx="110"
          cy="110"
          r={radius}
          fill="none"
          stroke="#e8ecf1"
          strokeWidth="35"
        />

        {slices.map((slice, index) => {
          const startRadians = (slice.startAngle * Math.PI) / 180;
          const endRadians = (slice.endAngle * Math.PI) / 180;

          const x1 = 110 + radius * Math.cos(startRadians);
          const y1 = 110 + radius * Math.sin(startRadians);
          const x2 = 110 + radius * Math.cos(endRadians);
          const y2 = 110 + radius * Math.sin(endRadians);

          const largeArc = slice.percentage > 50 ? 1 : 0;

          const pathData = [
            `M 110 110`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
            "Z",
          ].join(" ");

          const offset = (slice.startAngle + slice.endAngle) / 2;
          const labelRadius = radius * 0.7;
          const labelX = 110 + labelRadius * Math.cos((offset * Math.PI) / 180);
          const labelY = 110 + labelRadius * Math.sin((offset * Math.PI) / 180);

          return (
            <g key={index}>
              <path d={pathData} fill={slice.color} className="pie-slice" />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dy="0.3em"
                className="pie-label"
                fill="white"
                fontSize="16"
                fontWeight="bold"
              >
                {Math.round(slice.percentage)}%
              </text>
            </g>
          );
        })}
      </svg>

      <div className="pie-legend">
        {data.map((item, index) => (
          <div key={index} className="pie-legend-item">
            <span
              className="pie-legend-color"
              style={{ backgroundColor: item.color }}
            ></span>
            <span className="pie-legend-name">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieChart;
