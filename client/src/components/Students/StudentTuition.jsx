import React from "react";
import "./Tables.css";

function StudentTuition() {
  const tuitionData = {
    totalTuition: 5000000,
    paid: 5000000,
    owed: 0,
  };

  const transactions = [
    {
      date: "15/01/2024",
      amount: 5000000,
      status: "Đã thanh toán",
      note: "TOEIC 600+",
    },
    {
      date: "10/12/2023",
      amount: 3000000,
      status: "Đã thanh toán",
      note: "Thanh toán lần 1",
    },
    {
      date: "05/11/2023",
      amount: 2000000,
      status: "Đã thanh toán",
      note: "Thanh toán lần 2",
    },
  ];

  return (
    <div className="table-container">
      <h2>💰 Tài chính sinh viên</h2>

      <div className="summary-cards">
        <div className="summary-card">
          <h4>Tổng học phí</h4>
          <p className="amount">
            {tuitionData.totalTuition.toLocaleString("vi-VN")}đ
          </p>
        </div>
        <div className="summary-card paid">
          <h4>Đã thanh toán</h4>
          <p className="amount paid">
            {tuitionData.paid.toLocaleString("vi-VN")}đ
          </p>
        </div>
        <div className="summary-card owed">
          <h4>Còn nợ</h4>
          <p className="amount owed">
            {tuitionData.owed.toLocaleString("vi-VN")}đ
          </p>
        </div>
      </div>

      <h3>Lịch sử thanh toán</h3>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ngày thanh toán</th>
              <th>Số tiền</th>
              <th>Trạng thái</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((trans, index) => (
              <tr key={index}>
                <td>{trans.date}</td>
                <td className="amount-cell">
                  {trans.amount.toLocaleString("vi-VN")}đ
                </td>
                <td>
                  <span className="status-badge paid-badge">
                    {trans.status}
                  </span>
                </td>
                <td>{trans.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StudentTuition;
