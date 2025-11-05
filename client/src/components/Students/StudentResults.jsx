import React from "react";
import "./Tables.css";

function StudentResults() {
  const results = [
    {
      test: "Bài kiểm tra giữa kỳ",
      date: "10/01/2024",
      score: 8.5,
      maxScore: 10,
      status: "Đạt",
    },
    {
      test: "Bài kiểm tra cuối kỳ",
      date: "15/01/2024",
      score: 9.0,
      maxScore: 10,
      status: "Đạt",
    },
    {
      test: "Bài kiểm tra trắc nghiệm",
      date: "05/01/2024",
      score: 7.5,
      maxScore: 10,
      status: "Đạt",
    },
    {
      test: "Bài kiểm tra nói",
      date: "08/01/2024",
      score: 8.0,
      maxScore: 10,
      status: "Đạt",
    },
  ];

  const getScoreColor = (score) => {
    if (score >= 9) return "#27ae60";
    if (score >= 8) return "#3498db";
    if (score >= 7) return "#f39c12";
    return "#e74c3c";
  };

  return (
    <div className="table-container">
      <h2>📊 Kết quả học tập</h2>

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Bài kiểm tra</th>
              <th>Ngày thi</th>
              <th>Điểm số</th>
              <th>Kết quả</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td className="test-name">{result.test}</td>
                <td>{result.date}</td>
                <td>
                  <div className="score-display">
                    <span
                      className="score-value"
                      style={{ color: getScoreColor(result.score) }}
                    >
                      {result.score}/{result.maxScore}
                    </span>
                  </div>
                </td>
                <td>
                  <span className="status-badge pass-badge">
                    {result.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="results-summary">
        <p>
          📌 <strong>Trung bình chung:</strong> 8.25/10
        </p>
        <p>
          📌 <strong>Số bài kiểm tra:</strong> {results.length}
        </p>
        <p>
          📌 <strong>Tỷ lệ đạt:</strong> 100%
        </p>
      </div>
    </div>
  );
}

export default StudentResults;
