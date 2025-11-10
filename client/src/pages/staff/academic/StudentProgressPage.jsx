import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Badge } from "@components/common";
import { Users, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import { LineChart, DoughnutChart } from "@components/charts";

const StudentProgressPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/students/progress");
      if (response.data.success) {
        setStudents(response.data.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <TrendingUp className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tiến Độ Học Viên</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi tiến độ học tập của học viên
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {students.map((student) => (
          <Card
            key={student._id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(`/academic/students/${student._id}`)}
          >
            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {student.fullName}
                  </h3>
                  <p className="text-sm text-gray-600">{student.email}</p>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Điểm trung bình</span>
                  <span className="text-lg font-bold text-blue-600">
                    {student.averageGrade?.toFixed(1) || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Điểm danh</span>
                  <span className="text-lg font-bold text-green-600">
                    {student.attendanceRate?.toFixed(0) || 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Số lớp</span>
                  <span className="text-lg font-bold text-gray-900">
                    {student.classCount || 0}
                  </span>
                </div>
              </div>

              {/* Status */}
              {student.attendanceRate < 80 ? (
                <Badge variant="danger">Điểm danh thấp</Badge>
              ) : (
                <Badge variant="success">Tốt</Badge>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudentProgressPage;
