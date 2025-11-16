import React, { useState, useEffect } from "react";
import { BarChart3, Users, BookOpen, TrendingUp } from "lucide-react";
import { Card, Loading } from "@components/common";
import { LineChart, BarChart, DoughnutChart } from "@components/charts";
import api from "@services/api";
import { toast } from "react-hot-toast";

const AcademicStatisticsPage = () => {
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    averageGrade: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await api.get("/staff/academic/statistics");
      setStats(response.data || {});
    } catch (error) {
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const attendanceData = {
    labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"],
    datasets: [{
      label: "Tỷ lệ điểm danh (%)",
      data: [85, 88, 90, 87, 92, 78, 0],
      borderColor: "#3B9797",
      backgroundColor: "rgba(59, 151, 151, 0.1)"
    }]
  };

  const gradeData = {
    labels: ["Xuất sắc", "Giỏi", "Khá", "Trung bình", "Yếu"],
    datasets: [{
      label: "Số học viên",
      data: [45, 120, 180, 85, 20],
      backgroundColor: ["#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#6b7280"]
    }]
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Thống kê học vụ</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng lớp học</p>
              <p className="text-3xl font-bold mt-1">{stats.totalClasses}</p>
            </div>
            <BookOpen className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Tổng học viên</p>
              <p className="text-3xl font-bold mt-1">{stats.totalStudents}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Điểm danh TB</p>
              <p className="text-3xl font-bold mt-1">{stats.averageAttendance}%</p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Điểm TB</p>
              <p className="text-3xl font-bold mt-1">{stats.averageGrade}</p>
            </div>
            <BarChart3 className="w-12 h-12 opacity-80" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="font-semibold text-lg mb-4">Tỷ lệ điểm danh theo ngày</h3>
          <LineChart data={attendanceData} />
        </Card>
        <Card>
          <h3 className="font-semibold text-lg mb-4">Phân bố điểm số</h3>
          <BarChart data={gradeData} />
        </Card>
      </div>
    </div>
  );
};

export default AcademicStatisticsPage;
