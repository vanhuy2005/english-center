import React, { useState, useEffect } from "react";
import { School, Plus, Search } from "lucide-react";
import { Card, Button, Badge, Loading, Input, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const ClassManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/staff/academic/classes");
      setClasses(response.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách lớp học");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { key: "name", label: "Tên lớp" },
    { key: "course", label: "Khóa học", render: (row) => row.course?.name || "N/A" },
    { key: "teacher", label: "Giáo viên", render: (row) => row.teacher?.fullName || "Chưa phân công" },
    { key: "students", label: "Học viên", render: (row) => `${row.students?.length || 0}/${row.capacity || 0}` },
    { key: "status", label: "Trạng thái", render: (row) => (
      <Badge variant={row.status === "active" ? "success" : "default"}>
        {row.status === "active" ? "Đang học" : "Hoàn thành"}
      </Badge>
    )},
    { key: "actions", label: "Thao tác", render: () => <Button size="sm" variant="outline">Chi tiết</Button> }
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <School className="w-8 h-8 text-[#3B9797]" />
          <h1 className="text-2xl font-bold text-gray-800">Quản lý lớp học</h1>
        </div>
        <Button className="bg-gradient-to-r from-[#132440] to-[#16476A]">
          <Plus className="w-4 h-4 mr-2" />
          Tạo lớp mới
        </Button>
      </div>

      <Card>
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm lớp học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>
        <Table columns={columns} data={classes} />
      </Card>
    </div>
  );
};

export default ClassManagementPage;
