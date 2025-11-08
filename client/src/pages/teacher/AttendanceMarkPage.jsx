import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Table } from "@components/common";
import { classService, attendanceService } from "@services";
import toast from "react-hot-toast";
import { useLanguage } from "@hooks";

/**
 * AttendanceMarkPage - Teacher marks student attendance
 */
const AttendanceMarkPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [session, setSession] = useState("morning");
  const [attendanceData, setAttendanceData] = useState({});

  useEffect(() => {
    fetchData();
  }, [classId, selectedDate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch class details
      const classRes = await classService.getById(classId);
      setClassData(classRes.data);

      // Fetch students in class
      const studentsRes = await classService.getStudents(classId);
      setStudents(studentsRes.data || []);

      // Fetch existing attendance records for this date
      try {
        const attendanceRes = await attendanceService.getByClass(
          classId,
          selectedDate
        );
        if (attendanceRes.data && attendanceRes.data.length > 0) {
          const existingAttendance = {};
          attendanceRes.data.forEach((record) => {
            if (record.session === session) {
              existingAttendance[record.student._id || record.student] =
                record.status;
            }
          });
          setAttendanceData(existingAttendance);
        } else {
          // Initialize with 'present' for all students
          const initialData = {};
          studentsRes.data.forEach((student) => {
            initialData[student._id] = "present";
          });
          setAttendanceData(initialData);
        }
      } catch (err) {
        // No existing attendance, initialize with 'present'
        const initialData = {};
        studentsRes.data.forEach((student) => {
          initialData[student._id] = "present";
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSaving(true);

      // Prepare attendance records
      const records = students.map((student) => ({
        class: classId,
        student: student._id,
        date: selectedDate,
        session,
        status: attendanceData[student._id] || "absent",
      }));

      // Send to backend
      await attendanceService.mark({
        classId,
        date: selectedDate,
        session,
        records,
      });

      toast.success("Điểm danh thành công!");
      navigate(`/classes/${classId}`);
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error(error.response?.data?.message || "Không thể lưu điểm danh");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const statusOptions = [
    { value: "present", label: "Có mặt", color: "bg-success" },
    { value: "absent", label: "Vắng", color: "bg-danger" },
    { value: "late", label: "Muộn", color: "bg-warning" },
    { value: "excused", label: "Có phép", color: "bg-info" },
  ];

  const columns = [
    {
      header: "STT",
      accessor: (_, index) => index + 1,
      className: "w-16 text-center",
    },
    {
      header: "Mã học viên",
      accessor: (row) => row.studentCode || "N/A",
    },
    {
      header: "Họ và tên",
      accessor: (row) => row.fullName || row.user?.fullName || "N/A",
    },
    {
      header: "Trạng thái",
      accessor: (row) => (
        <div className="flex gap-2">
          {statusOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleStatusChange(row._id, option.value)}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${
                attendanceData[row._id] === option.value
                  ? `${option.color} text-white`
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Điểm danh</h1>
          <p className="text-gray-600">
            Lớp: {classData?.className || "N/A"} (
            {classData?.classCode || "N/A"})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      {/* Date and Session Selection */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày điểm danh
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buổi học
            </label>
            <select
              value={session}
              onChange={(e) => setSession(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="morning">Sáng</option>
              <option value="afternoon">Chiều</option>
              <option value="evening">Tối</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tổng số học viên
            </label>
            <div className="px-3 py-2 bg-gray-100 rounded-md text-lg font-semibold">
              {students.length} học viên
            </div>
          </div>
        </div>
      </Card>

      {/* Attendance Table */}
      <Card>
        <Table columns={columns} data={students} />
      </Card>

      {/* Summary */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statusOptions.map((option) => {
            const count = Object.values(attendanceData).filter(
              (status) => status === option.value
            ).length;
            return (
              <div
                key={option.value}
                className={`p-4 rounded-lg ${option.color} bg-opacity-10`}
              >
                <div className="text-2xl font-bold">{count}</div>
                <div className="text-sm text-gray-600">{option.label}</div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Hủy
        </Button>
        <Button onClick={handleSaveAttendance} loading={saving}>
          💾 Lưu điểm danh
        </Button>
      </div>
    </div>
  );
};

export default AttendanceMarkPage;
