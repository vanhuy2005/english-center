import React, { useState, useEffect } from "react";
import { ClipboardList, Search } from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
} from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const AttendanceGradingPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
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

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
      // Lấy thông tin lớp học với danh sách học viên
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data?.data || response.data;

      // Lấy danh sách student IDs từ lớp học
      const studentIds = classData.students || [];

      if (studentIds.length > 0) {
        // Lấy thông tin chi tiết của từng học viên
        const studentsPromises = studentIds.map((id) =>
          api.get(`/students/${id}`).catch((err) => null)
        );
        const studentsResponses = await Promise.all(studentsPromises);
        const studentsData = studentsResponses
          .filter((res) => res !== null)
          .map((res) => res.data?.data || res.data);

        setStudents(studentsData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !selectedClass) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <ClipboardList className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">
          Điểm danh & Nhập điểm
        </h1>
      </div>

      {/* Class Selection */}
      <Card>
        <div className="space-y-4">
          <Select
            label="Chọn lớp học"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
          >
            <option value="">-- Vui lòng chọn lớp học --</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.className} ({cls.classCode}) - {cls.students?.length || 0}{" "}
                học viên
              </option>
            ))}
          </Select>

          {selectedClass && (
            <Input
              placeholder="Tìm kiếm học viên (tên, mã SV)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          )}
        </div>
      </Card>

      {/* Students List */}
      {selectedClass && (
        <>
          {loading ? (
            <Loading />
          ) : filteredStudents.length > 0 ? (
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        STT
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Mã SV
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Họ và tên
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Số điện thoại
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredStudents.map((student, index) => (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {student.studentCode}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {student.fullName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {student.email || "N/A"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {student.phone}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge
                            variant={
                              student.status === "active" ? "success" : "danger"
                            }
                          >
                            {student.status === "active"
                              ? "Đang học"
                              : "Đã nghỉ"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex gap-2 justify-center">
                            <Button variant="outline" size="sm">
                              Điểm danh
                            </Button>
                            <Button variant="primary" size="sm">
                              Nhập điểm
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Không có học viên
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Không tìm thấy học viên nào phù hợp"
                    : "Lớp học này chưa có học viên nào"}
                </p>
              </div>
            </Card>
          )}
        </>
      )}

      {!selectedClass && (
        <Card>
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Vui lòng chọn lớp học
            </h3>
            <p className="text-gray-500">
              Chọn lớp học từ danh sách bên trên để xem danh sách học viên
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceGradingPage;
