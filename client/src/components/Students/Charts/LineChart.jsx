import React, { useState } from "react";

function LineChart({ data }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const width = 500;
  const height = 300;
  const padding = { top: 20, right: 30, bottom: 40, left: 50 };

  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  const maxScore = 100;
  const maxValue = Math.max(
    ...data.map((d) => Math.max(d.examScore, d.attendance))
  );

  const getX = (index) =>
    padding.left + (index / (data.length - 1)) * graphWidth;
  const getY = (value) =>
    padding.top + graphHeight - (value / maxValue) * graphHeight;

  // Generate exam score line path
  const examScorePath = data
    .map((d, i) => `${getX(i)} ${getY(d.examScore)}`)
    .join("L");

  // Generate attendance line path
  const attendancePath = data
    .map((d, i) => `${getX(i)} ${getY(d.attendance)}`)
    .join("L");

  const handlePointHover = (index, type, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left,
      y: rect.top - 60,
    });
    setHoveredPoint({ index, type });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  return (
    <div className="line-chart-wrapper">
      <svg width={width} height={height} className="line-chart-svg">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => {
          const y = getY((value / 100) * maxValue);
          return (
            <g key={value}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="#e8ecf1"
                strokeDasharray="5,5"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={y}
                textAnchor="end"
                dy="0.3em"
                fontSize="12"
                fill="#999"
              >
                {value}
              </text>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padding.left}
          y1={height - padding.bottom}
          x2={width - padding.right}
          y2={height - padding.bottom}
          stroke="#999"
          strokeWidth="2"
        />

        {/* Y-axis */}
        <line
          x1={padding.left}
          y1={padding.top}
          x2={padding.left}
          y2={height - padding.bottom}
          stroke="#999"
          strokeWidth="2"
        />

        {/* X-axis labels */}
        {data.map((d, i) => (
          <text
            key={`label-${i}`}
            x={getX(i)}
            y={height - padding.bottom + 20}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            {d.month}
          </text>
        ))}

        {/* Exam Score Line */}
        <polyline
          points={examScorePath}
          fill="none"
          stroke="#1e3a5f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Attendance Line */}
        <polyline
          points={attendancePath}
          fill="none"
          stroke="#8b0000"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points - Exam Score */}
        {data.map((d, i) => (
          <circle
            key={`exam-${i}`}
            cx={getX(i)}
            cy={getY(d.examScore)}
            r="5"
            fill="#1e3a5f"
            className="chart-point"
            onMouseEnter={(e) => handlePointHover(i, "exam", e)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* Data points - Attendance */}
        {data.map((d, i) => (
          <circle
            key={`attendance-${i}`}
            cx={getX(i)}
            cy={getY(d.attendance)}
            r="5"
            fill="#8b0000"
            className="chart-point"
            onMouseEnter={(e) => handlePointHover(i, "attendance", e)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: "pointer" }}
          />
        ))}

        {/* Hover circle highlight */}
        {hoveredPoint && (
          <circle
            cx={getX(hoveredPoint.index)}
            cy={getY(
              hoveredPoint.type === "exam"
                ? data[hoveredPoint.index].examScore
                : data[hoveredPoint.index].attendance
            )}
            r="8"
            fill="none"
            stroke={hoveredPoint.type === "exam" ? "#1e3a5f" : "#8b0000"}
            strokeWidth="2"
            opacity="0.5"
          />
        )}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          className="chart-tooltip"
          style={{
            position: "fixed",
            left: tooltipPos.x,
            top: tooltipPos.y,
          }}
        >
          <div className="tooltip-header">
            {data[hoveredPoint.index].month} 2024
          </div>
          <div className="tooltip-content">
            {hoveredPoint.type === "exam" ? (
              <>
                <p>
                  <strong>Exam Score:</strong>{" "}
                  {data[hoveredPoint.index].examScore}%
                </p>
                <p>
                  <strong>Attendance:</strong>{" "}
                  {data[hoveredPoint.index].attendance}%
                </p>
              </>
            ) : (
              <>
                <p>
                  <strong>Attendance:</strong>{" "}
                  {data[hoveredPoint.index].attendance}%
                </p>
                <p>
                  <strong>Exam Score:</strong>{" "}
                  {data[hoveredPoint.index].examScore}%
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineChart;
