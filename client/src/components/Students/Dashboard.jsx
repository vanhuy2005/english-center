import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Dashboard.css";
import PieChart from "./Charts/PieChart";
import LineChart from "./Charts/LineChart";

function Dashboard({ student }) {
  const [stats, setStats] = useState({
    examScore: 72,
    attendance: 95,
    monthlyData: [],
  });
  const [timeRange, setTimeRange] = useState("thisMonth");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Có thể gọi API để lấy dữ liệu thực tế
      // const response = await axios.get(`http://localhost:5000/api/students/${student._id}/stats`);
      // setStats(response.data);

      // Dữ liệu mẫu
      setStats({
        examScore: 72,
        attendance: 95,
        monthlyData: [
          { month: "Jan", examScore: 65, attendance: 85 },
          { month: "Feb", examScore: 68, attendance: 88 },
          { month: "Mar", examScore: 70, attendance: 90 },
          { month: "Apr", examScore: 72, attendance: 92 },
          { month: "May", examScore: 75, attendance: 88 },
          { month: "Jun", examScore: 78, attendance: 95 },
          { month: "Jul", examScore: 80, attendance: 97 },
          { month: "Aug", examScore: 82, attendance: 96 },
          { month: "Sep", examScore: 80, attendance: 95 },
          { month: "Oct", examScore: 78, attendance: 94 },
          { month: "Nov", examScore: 75, attendance: 93 },
          { month: "Dec", examScore: 72, attendance: 92 },
        ],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pieData = [
    { name: "Content", value: 65, color: "#1e3a5f" },
    { name: "Content", value: 35, color: "#8b0000" },
  ];

  if (loading) {
    return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-content">
        {/* Left Section - Pie Chart */}
        <div className="dashboard-left">
          <div className="pie-chart-section">
            <PieChart data={pieData} />
          </div>
        </div>

        {/* Right Section - Statistics */}
        <div className="dashboard-right">
          <div className="statistics-section">
            <h3>Statistics</h3>

            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-icon">📝</div>
                <div className="stat-label">Avg. Exam Score</div>
                <div className="stat-value">72%</div>
              </div>

              <div className="stat-item">
                <div className="stat-icon">✅</div>
                <div className="stat-label">Avg. Attendance</div>
                <div className="stat-value">95%</div>
              </div>
            </div>

            {/* Line Chart */}
            <div className="line-chart-section">
              <div className="chart-header">
                <h4>Monthly Performance</h4>
                <select
                  className="month-select"
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                >
                  <option value="thisMonth">This Month</option>
                  <option value="lastMonth">Last Month</option>
                  <option value="last3Months">Last 3 Months</option>
                  <option value="lastYear">Last Year</option>
                </select>
              </div>
              <LineChart data={stats.monthlyData} />

              <div className="chart-legend">
                <div className="legend-item">
                  <span className="legend-color exam-score"></span>
                  <span>Exam Score</span>
                </div>
                <div className="legend-item">
                  <span className="legend-color attendance"></span>
                  <span>Attendance</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
