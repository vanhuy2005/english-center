import React, { useState, useEffect } from "react";
import { FileText, Users, TrendingUp, Award, AlertCircle } from "lucide-react";
import { Card, Button, Badge, Loading, Select } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const ClassReportsPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStats(selectedClass);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStats = async (classId) => {
    setLoading(true);
    try {
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data?.data || response.data;

      // Lấy danh sách học viên với điểm
      const studentIds = classData.students || [];
      const studentsPromises = studentIds.map((id) =>
        api.get(`/students/${id}`).catch(() => null)
      );
      const studentsResponses = await Promise.all(studentsPromises);
      const students = studentsResponses
        .filter((res) => res !== null)
        .map((res) => res.data?.data || res.data);

      // Tính toán thống kê
      const stats = calculateStats(classData, students);
      setClassStats(stats);
    } catch (error) {
      console.error("Error fetching class stats:", error);
      toast.error("Không thể tải thống kê lớp học");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (classData, students) => {
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "active").length;

    // Giả sử có điểm trong database (cần model Score hoặc field score trong Student)
    // Đây là mock data, bạn cần thay đổi theo cấu trúc database thực tế
    const scores = students.map(() => Math.floor(Math.random() * 10) + 1); // Mock scores 1-10

    const scoreRanges = {
      excellent: scores.filter((s) => s >= 9).length, // 9-10
      good: scores.filter((s) => s >= 7 && s < 9).length, // 7-8
      average: scores.filter((s) => s >= 5 && s < 7).length, // 5-6
      belowAverage: scores.filter((s) => s < 5).length, // 1-4
    };

    const averageScore =
      scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : 0;

    const passRate =
      scores.length > 0
        ? ((scores.filter((s) => s >= 5).length / scores.length) * 100).toFixed(
            1
          )
        : 0;

    return {
      classInfo: classData,
      totalStudents,
      activeStudents,
      scoreRanges,
      averageScore,
      passRate,
      capacity: classData.capacity || 0,
      teacher: classData.teacher,
      course: classData.course,
    };
  };

  if (loading && !selectedClass) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo lớp học</h1>
      </div>

      {/* Class Selection */}
      <Card>
        <Select
          label="Chọn lớp học"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          required
        >
          <option value="">-- Vui lòng chọn lớp học --</option>
          {classes.map((cls) => (
            <option key={cls._id} value={cls._id}>
              {cls.className} ({cls.classCode})
            </option>
          ))}
        </Select>
      </Card>

      {/* Statistics */}
      {selectedClass && classStats && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tổng học viên</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {classStats.totalStudents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Sức chứa: {classStats.capacity}
                  </p>
                </div>
                <Users className="w-10 h-10 text-blue-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Đang học</p>
                  <p className="text-2xl font-bold text-green-600">
                    {classStats.activeStudents}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {classStats.totalStudents > 0
                      ? Math.round(
                          (classStats.activeStudents /
                            classStats.totalStudents) *
                            100
                        )
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="w-10 h-10 text-green-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Điểm TB</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {classStats.averageScore}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">/10 điểm</p>
                </div>
                <Award className="w-10 h-10 text-purple-500" />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Tỷ lệ đạt</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {classStats.passRate}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">≥ 5 điểm</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-500" />
              </div>
            </Card>
          </div>

          {/* Class Info */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Thông tin lớp học</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Tên lớp</p>
                <p className="font-medium">{classStats.classInfo.className}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Mã lớp</p>
                <p className="font-medium">{classStats.classInfo.classCode}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Khóa học</p>
                <p className="font-medium">
                  {classStats.course?.courseName || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Giáo viên</p>
                <p className="font-medium">
                  {classStats.teacher?.fullName || "Chưa phân công"}
                </p>
              </div>
            </div>
          </Card>

          {/* Score Distribution */}
          <Card>
            <h3 className="text-lg font-semibold mb-4">Phân bố điểm</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Badge variant="success">Xuất sắc (9-10)</Badge>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-green-500 h-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${
                          classStats.totalStudents > 0
                            ? (classStats.scoreRanges.excellent /
                                classStats.totalStudents) *
                              100
                            : 0
                        }%`,
                        minWidth:
                          classStats.scoreRanges.excellent > 0 ? "60px" : "0",
                      }}
                    >
                      {classStats.scoreRanges.excellent} HV
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Badge variant="primary">Giỏi (7-8)</Badge>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${
                          classStats.totalStudents > 0
                            ? (classStats.scoreRanges.good /
                                classStats.totalStudents) *
                              100
                            : 0
                        }%`,
                        minWidth:
                          classStats.scoreRanges.good > 0 ? "60px" : "0",
                      }}
                    >
                      {classStats.scoreRanges.good} HV
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Badge variant="warning">Khá (5-6)</Badge>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-yellow-500 h-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${
                          classStats.totalStudents > 0
                            ? (classStats.scoreRanges.average /
                                classStats.totalStudents) *
                              100
                            : 0
                        }%`,
                        minWidth:
                          classStats.scoreRanges.average > 0 ? "60px" : "0",
                      }}
                    >
                      {classStats.scoreRanges.average} HV
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-32">
                  <Badge variant="danger">Yếu (1-4)</Badge>
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-8 overflow-hidden">
                    <div
                      className="bg-red-500 h-full flex items-center justify-center text-white text-sm font-medium"
                      style={{
                        width: `${
                          classStats.totalStudents > 0
                            ? (classStats.scoreRanges.belowAverage /
                                classStats.totalStudents) *
                              100
                            : 0
                        }%`,
                        minWidth:
                          classStats.scoreRanges.belowAverage > 0
                            ? "60px"
                            : "0",
                      }}
                    >
                      {classStats.scoreRanges.belowAverage} HV
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <Card>
            <div className="flex gap-4">
              <Button variant="primary">Xuất báo cáo Excel</Button>
              <Button variant="outline">In báo cáo</Button>
            </div>
          </Card>
        </div>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vui lòng chọn lớp học
            </h3>
            <p className="text-gray-500">
              Chọn lớp học từ danh sách bên trên để xem báo cáo chi tiết
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassReportsPage;
