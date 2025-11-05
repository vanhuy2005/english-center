import React from "react";

function StudentResults() {
  const results = [
    {
      studentId: "HV001",
      fullName: "Nguyễn Văn A",
      test: "TOEIC",
      score: 8.5,
      date: "15/01/2025",
      status: "Đạt",
    },
    {
      studentId: "HV002",
      fullName: "Trần Thị B",
      test: "TOEIC",
      score: 7.5,
      date: "15/01/2025",
      status: "Đạt",
    },
    {
      studentId: "HV003",
      fullName: "Lê Văn C",
      test: "TOEIC",
      score: 6.5,
      date: "15/01/2025",
      status: "Đạt",
    },
  ];

  return (
    <div className="results-container">
      <h2>📈 Kết Quả Học Viên</h2>

      <div className="results-table">
        <table>
          <thead>
            <tr>
              <th>Mã Học Viên</th>
              <th>Họ và Tên</th>
              <th>Bài Kiểm Tra</th>
              <th>Điểm Số</th>
              <th>Ngày Thi</th>
              <th>Kết Quả</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index}>
                <td>{result.studentId}</td>
                <td>{result.fullName}</td>
                <td>{result.test}</td>
                <td className="score">{result.score}/10</td>
                <td>{result.date}</td>
                <td>
                  <span className="status-badge pass">{result.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentResults;
