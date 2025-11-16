import React, { useState, useEffect } from "react";
import { ClipboardCheck } from "lucide-react";
import { Card, Badge, Loading, Input, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const AttendanceTrackingPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchAttendance();
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/staff/academic/classes");
      setClasses(response.data || []);
      setLoading(false);
    } catch (error) {
      toast.error("Không thể tải danh sách lớp");
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/staff/academic/attendance/${selectedClass}?date=${date}`);
      setAttendanceData(response.data || []);
    } catch (error) {
      setAttendanceData([]);
    }
  };

  const columns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và tên" },
    { key: "status", label: "Trạng thái", render: (row) => (
      <Badge variant={row.status === "present" ? "success" : "danger"}>
        {row.status === "present" ? "Có mặt" : "Vắng"}
      </Badge>
    )},
    { key: "note", label: "Ghi chú" }
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Theo dõi điểm danh</h1>
      </div>

      <Card>
        <div className="flex gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9797]"
          >
            <option value="">Chọn lớp học</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-48" />
        </div>

        {selectedClass ? (
          <Table columns={columns} data={attendanceData} />
        ) : (
          <div className="text-center py-12 text-gray-500">Vui lòng chọn lớp học</div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTrackingPage;
