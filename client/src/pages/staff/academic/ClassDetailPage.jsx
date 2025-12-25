import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import {
  ArrowLeft,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Plus,
  X,
} from "lucide-react";

const ClassDetailPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadClassDetail();
  }, [classId]);

  const loadClassDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/academic/classes/${classId}`);
      if (response.data.success) {
        setClassData(response.data.data.class);
        setStudents(response.data.data.students);
      }
    } catch (error) {
      console.error("Error loading class detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableStudents = async () => {
    try {
      const response = await api.get(
        `/staff/academic/students/available?classId=${classId}`
      );
      if (response.data.success) {
        setAvailableStudents(response.data.data);
      }
    } catch (error) {
      console.error("Error loading available students:", error);
    }
  };

  const handleAddStudents = async () => {
    if (selectedStudents.length === 0) {
      alert("Vui lòng chọn ít nhất 1 học viên");
      return;
    }

    try {
      const response = await api.post(
        `/staff/academic/classes/${classId}/add-students`,
        { studentIds: selectedStudents }
      );
      if (response.data.success) {
        loadClassDetail();
        setShowAddStudentModal(false);
        setSelectedStudents([]);
        setSearchTerm("");
      }
    } catch (error) {
      alert("Lỗi thêm học viên: " + error.message);
    }
  };

  const handleAttendanceToggle = async (studentId, status) => {
    try {
      const response = await api.post(`/staff/academic/attendance/mark`, {
        classId,
        studentId,
        date: attendanceDate,
        status: status === "present" ? "absent" : "present",
      });
      if (response.data.success) {
        setStudents(
          students.map((student) =>
            student._id === studentId
              ? {
                  ...student,
                  attendance: {
                    ...student.attendance,
                    [attendanceDate]:
                      status === "present" ? "absent" : "present",
                  },
                }
              : student
          )
        );
      }
    } catch (error) {
      console.error("Error updating attendance:", error);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    if (
      !window.confirm("Bạn có chắc chắn muốn xóa học viên này khỏi lớp không?")
    ) {
      return;
    }

    try {
      const response = await api.post(
        `/staff/academic/classes/${classId}/remove-student`,
        { studentId }
      );
      if (response.data.success) {
        setStudents(students.filter((s) => s._id !== studentId));
      }
    } catch (error) {
      alert("Lỗi xóa học viên: " + error.message);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Không tìm thấy lớp học</p>
      </div>
    );
  }

  const attendanceToday = students.filter(
    (s) => s.attendance?.[attendanceDate] === "present"
  ).length;
  const absentToday = students.filter(
    (s) => s.attendance?.[attendanceDate] === "absent"
  ).length;
  const totalAttendanceRate = students.length
    ? (
        (students.filter((s) => s.totalPresent || 0).length / students.length) *
        100
      ).toFixed(1)
    : 0;

  const filteredAvailableStudents = availableStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
     
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/academic/classes")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{classData.name}</h1>
          <p className="text-gray-600 mt-1">{classData.code}</p>
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div>
            <p className="text-blue-100 text-sm font-medium">Tổng Học Viên</p>
            <h3 className="text-3xl font-bold mt-2">{students.length}</h3>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div>
            <p className="text-green-100 text-sm font-medium">Có Mặt Hôm Nay</p>
            <h3 className="text-3xl font-bold mt-2">{attendanceToday}</h3>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div>
            <p className="text-red-100 text-sm font-medium">Vắng Hôm Nay</p>
            <h3 className="text-3xl font-bold mt-2">{absentToday}</h3>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div>
            <p className="text-purple-100 text-sm font-medium">
              Tỉ Lệ Chuyên Cần
            </p>
            <h3 className="text-3xl font-bold mt-2">{totalAttendanceRate}%</h3>
          </div>
        </Card>
      </div>

      
      <Card>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600 font-medium">Mã Lớp</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {classData.code}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Giáo Viên</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {classData.instructor?.fullName || "Chưa phân công"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Ngày Bắt Đầu</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">
              {new Date(classData.startDate).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 font-medium">Trạng Thái</p>
            <span
              className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${
                classData.status === "active"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {classData.status === "active" ? "Đang học" : "Đã kết thúc"}
            </span>
          </div>
        </div>
      </Card>

     
      {students.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-gray-300">
          <Users size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-lg font-semibold text-gray-700 mb-2">
            Chưa có học viên nào
          </p>
          <p className="text-gray-600 mb-6">
            Lớp này hiện chưa có học viên đăng ký. Hãy thêm học viên để bắt đầu.
          </p>
          <button
            onClick={() => {
              loadAvailableStudents();
              setShowAddStudentModal(true);
            }}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Thêm Học Viên
          </button>
        </Card>
      ) : (
        <>
       
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="text-blue-600" size={24} />
                <h3 className="text-lg font-semibold text-gray-900">
                  Điểm Danh
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Ngày:
                  </label>
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  onClick={() => {
                    loadAvailableStudents();
                    setShowAddStudentModal(true);
                  }}
                  className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  <Plus size={18} />
                  Thêm
                </button>
              </div>
            </div>

            {/* Attendance Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Tên Học Viên
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Mã Học Viên
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Có Mặt Hôm Nay
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Tổng Có Mặt
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-900">
                      Tỉ Lệ (%)
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-900">
                      Thao Tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map((student) => {
                    const attendanceStatus =
                      student.attendance?.[attendanceDate] || "unmarked";
                    const attendanceRate = student.totalSessions
                      ? (
                          ((student.totalPresent || 0) /
                            student.totalSessions) *
                          100
                        ).toFixed(1)
                      : 0;

                    return (
                      <tr key={student._id} className="hover:bg-gray-50">
                        <td className="px-6 py-3">
                          <div>
                            <p className="font-medium text-gray-900">
                              {student.fullName}
                            </p>
                            <p className="text-xs text-gray-600">
                              {student.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="text-gray-900">
                            {student.studentCode}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-2">
                            {attendanceStatus === "present" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                                <CheckCircle size={14} />
                                Có Mặt
                              </span>
                            ) : attendanceStatus === "absent" ? (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                                <XCircle size={14} />
                                Vắng
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                                <AlertCircle size={14} />
                                Chưa Điểm
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-3">
                          <span className="font-semibold text-gray-900">
                            {student.totalPresent || 0}/
                            {student.totalSessions || 0}
                          </span>
                        </td>
                        <td className="px-6 py-3">
                          <span
                            className={`font-semibold ${
                              attendanceRate >= 80
                                ? "text-green-600"
                                : attendanceRate >= 60
                                ? "text-yellow-600"
                                : "text-red-600"
                            }`}
                          >
                            {attendanceRate}%
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() =>
                                handleAttendanceToggle(
                                  student._id,
                                  attendanceStatus === "present"
                                    ? "present"
                                    : "absent"
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                attendanceStatus === "present"
                                  ? "bg-green-100 hover:bg-green-200 text-green-600"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                              }`}
                              title="Có Mặt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleAttendanceToggle(
                                  student._id,
                                  attendanceStatus === "absent"
                                    ? "absent"
                                    : "present"
                                )
                              }
                              className={`p-2 rounded-lg transition-colors ${
                                attendanceStatus === "absent"
                                  ? "bg-red-100 hover:bg-red-200 text-red-600"
                                  : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                              }`}
                              title="Vắng"
                            >
                              <XCircle size={18} />
                            </button>
                            <button
                              onClick={() => handleRemoveStudent(student._id)}
                              className="p-2 rounded-lg transition-colors bg-gray-100 hover:bg-red-100 text-gray-600 hover:text-red-600"
                              title="Xóa khỏi lớp"
                            >
                              <X size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

         
          {students.some((s) => {
            const rate = s.totalSessions
              ? ((s.totalPresent || 0) / s.totalSessions) * 100
              : 0;
            return rate < 80 && rate > 0;
          }) && (
            <Card className="border-l-4 border-yellow-500 bg-yellow-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="text-yellow-600" size={20} />
                <h4 className="font-semibold text-yellow-900">
                  Cảnh báo Chuyên Cần Kém
                </h4>
              </div>
              <div className="space-y-1">
                {students
                  .filter((s) => {
                    const rate = s.totalSessions
                      ? ((s.totalPresent || 0) / s.totalSessions) * 100
                      : 0;
                    return rate < 80 && rate > 0;
                  })
                  .map((student) => (
                    <p key={student._id} className="text-sm text-yellow-800">
                      • {student.fullName} - Chuyên cần:{" "}
                      {(
                        ((student.totalPresent || 0) / student.totalSessions) *
                        100
                      ).toFixed(1)}
                      %
                    </p>
                  ))}
              </div>
            </Card>
          )}
        </>
      )}

      
      {showAddStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Thêm Học Viên Vào Lớp
              </h2>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSelectedStudents([]);
                  setSearchTerm("");
                }}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={24} />
              </button>
            </div>

         
            <div className="mb-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã học viên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          
            <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
              {filteredAvailableStudents.length > 0 ? (
                filteredAvailableStudents.map((student) => (
                  <label
                    key={student._id}
                    className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedStudents.includes(student._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedStudents([
                            ...selectedStudents,
                            student._id,
                          ]);
                        } else {
                          setSelectedStudents(
                            selectedStudents.filter((id) => id !== student._id)
                          );
                        }
                      }}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <div className="ml-3 flex-1">
                      <p className="font-medium text-gray-900">
                        {student.fullName}
                      </p>
                      <p className="text-sm text-gray-600">
                        {student.studentCode} - {student.email}
                      </p>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    {searchTerm
                      ? "Không tìm thấy học viên phù hợp"
                      : "Không có học viên nào có sẵn"}
                  </p>
                </div>
              )}
            </div>

        
            <div className="flex gap-3 border-t pt-6">
              <button
                onClick={handleAddStudents}
                disabled={selectedStudents.length === 0}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                Thêm ({selectedStudents.length})
              </button>
              <button
                onClick={() => {
                  setShowAddStudentModal(false);
                  setSelectedStudents([]);
                  setSearchTerm("");
                }}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 rounded-lg transition-colors"
              >
                Hủy
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassDetailPage;
