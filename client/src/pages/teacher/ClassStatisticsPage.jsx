import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading } from "@components/common";
import { ArrowLeft, TrendingUp, Users, Award, AlertCircle } from "lucide-react";
import { BarChart, PieChart, LineChart } from "@components/charts";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * Class Statistics Page - View statistics and analytics for a class
 */
const ClassStatisticsPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, [classId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const [classResponse, statsResponse] = await Promise.all([
        api.get(`/api/teachers/classes/${classId}`),
        api.get(`/api/teachers/classes/${classId}/statistics`),
      ]);

      setClassInfo(classResponse.data?.data?.class);
      setStats(statsResponse.data?.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      toast.error("Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Thống Kê Lớp Học
          </h1>
          <p className="text-gray-600 mt-1">{classInfo?.name}</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tổng học viên</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats?.totalStudents || 0}
              </p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Điểm TB</p>
              <p className="text-2xl font-bold text-green-600">
                {stats?.averageGrade?.toFixed(1) || "N/A"}
              </p>
            </div>
            <Award className="w-8 h-8 text-green-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Tỷ lệ đi học</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.attendanceRate?.toFixed(0) || 0}%
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-400" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Cảnh báo</p>
              <p className="text-2xl font-bold text-red-600">
                {stats?.warningStudents || 0}
              </p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Phân bố điểm số
          </h3>
          <BarChart
            data={stats?.gradeDistribution}
            xKey="range"
            yKey="count"
            barColor="#3B82F6"
          />
        </Card>

        {/* Attendance Distribution */}
        <Card className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Tỷ lệ điểm danh
          </h3>
          <PieChart
            data={stats?.attendanceDistribution}
            nameKey="status"
            valueKey="count"
          />
        </Card>

        {/* Grade Trend */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold text-lg text-gray-900 mb-4">
            Xu hướng điểm số theo thời gian
          </h3>
          <LineChart
            data={stats?.gradeTrend}
            xKey="date"
            yKey="average"
            lineColor="#3B82F6"
          />
        </Card>
      </div>

      {/* Warning Students */}
      {stats?.warningStudents > 0 && (
        <Card className="p-6">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Học viên cần quan tâm
          </h3>
          <div className="space-y-3">
            {stats?.studentsNeedAttention?.map((student) => (
              <div
                key={student._id}
                className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {student.fullName}
                  </p>
                  <p className="text-sm text-gray-600">{student.studentId}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-center">
                    <p className="text-gray-600">Điểm TB</p>
                    <p className="font-bold text-red-600">
                      {student.averageGrade?.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600">Tỷ lệ đi học</p>
                    <p className="font-bold text-red-600">
                      {student.attendanceRate?.toFixed(0)}%
                    </p>
                  </div>
                </div>
                <Button
                  size="small"
                  variant="primary"
                  onClick={() =>
                    navigate(
                      `/teacher/classes/${classId}/students/${student._id}`
                    )
                  }
                >
                  Xem chi tiết
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassStatisticsPage;
