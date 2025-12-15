import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Card, Button, Badge, Loading, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const GradeManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchGrades();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/staff/academic/classes");
      const data = response.data || response || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrades = async () => {
    try {
      const response = await api.get(`/staff/academic/grades/${selectedClass}`);
      const data = response.data || response || [];
      setGrades(Array.isArray(data) ? data : []);
    } catch (error) {
      setGrades([]);
    }
  };

  const handleApprove = async (gradeId) => {
    try {
      await api.put(`/staff/academic/grades/${gradeId}/approve`);
      toast.success("Đã phê duyệt điểm");
      fetchGrades();
    } catch (error) {
      toast.error("Không thể phê duyệt điểm");
    }
  };

  const columns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và tên" },
    { key: "midterm", label: "Giữa kỳ", render: (row) => row.midterm || "-" },
    { key: "final", label: "Cuối kỳ", render: (row) => row.final || "-" },
    { key: "average", label: "Trung bình", render: (row) => {
      const avg = row.average || 0;
      return <span className={avg >= 8 ? "text-green-600 font-semibold" : avg >= 5 ? "text-yellow-600" : "text-red-600"}>{avg.toFixed(1)}</span>;
    }},
    { key: "status", label: "Trạng thái", render: (row) => (
      <Badge variant={row.status === "approved" ? "success" : "warning"}>
        {row.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
      </Badge>
    )},
    { key: "actions", label: "Thao tác", render: (row) => (
      row.status === "pending" && <Button size="sm" onClick={() => handleApprove(row._id)}>Phê duyệt</Button>
    )}
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Quản lý điểm</h1>
      </div>

      <Card>
        <div className="mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9797]"
          >
            <option value="">Chọn lớp học</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>{cls.name}</option>
            ))}
          </select>
        </div>

        {selectedClass ? <Table columns={columns} data={grades} /> : (
          <div className="text-center py-12 text-gray-500">Vui lòng chọn lớp học</div>
        )}
      </Card>
    </div>
  );
};

export default GradeManagementPage;
