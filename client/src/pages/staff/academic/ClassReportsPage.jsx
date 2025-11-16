import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import { Card, Button, Badge, Loading } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const ClassReportsPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/staff/academic/classes");
      setClasses(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách lớp");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Báo cáo lớp học</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card key={cls._id}>
            <h3 className="font-semibold text-lg mb-2">{cls.name}</h3>
            <p className="text-sm text-gray-600 mb-1">Khóa học: {cls.course?.name || "N/A"}</p>
            <p className="text-sm text-gray-600 mb-1">Giáo viên: {cls.teacher?.fullName || "Chưa phân công"}</p>
            <p className="text-sm text-gray-600 mb-3">Học viên: {cls.students?.length || 0}/{cls.capacity || 0}</p>
            <Button size="sm" className="w-full">Xem báo cáo</Button>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClassReportsPage;
