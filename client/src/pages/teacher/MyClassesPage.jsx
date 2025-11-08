import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Loading, Badge } from "@components/common";
import { School, Users, Calendar, ChevronRight } from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * My Classes Page - Teacher view their assigned classes
 */
const MyClassesPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, upcoming, completed

  useEffect(() => {
    fetchMyClasses();
  }, [filter]);

  const fetchMyClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/teachers/classes", {
        params: filter !== "all" ? { status: filter } : {},
      });
      setClasses(response.data?.data?.classes || []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { variant: "success", label: "Đang học" },
      upcoming: { variant: "info", label: "Sắp bắt đầu" },
      completed: { variant: "secondary", label: "Đã kết thúc" },
      cancelled: { variant: "danger", label: "Đã hủy" },
    };
    return badges[status] || badges.active;
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Lớp Học Của Tôi
          </h1>
          <p className="text-gray-600 mt-1">Quản lý các lớp đang giảng dạy</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {["all", "active", "upcoming", "completed"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "primary" : "secondary"}
            size="small"
            onClick={() => setFilter(status)}
          >
            {status === "all"
              ? "Tất cả"
              : status === "active"
              ? "Đang học"
              : status === "upcoming"
              ? "Sắp diễn ra"
              : "Đã kết thúc"}
          </Button>
        ))}
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <Card className="p-8 text-center">
          <School className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600">Không có lớp học nào</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <Card
              key={classItem._id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(`/teacher/classes/${classItem._id}`)}
            >
              <div className="p-6 space-y-4">
                {/* Class Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {classItem.course?.name}
                    </p>
                  </div>
                  <Badge {...getStatusBadge(classItem.status)} />
                </div>

                {/* Class Info */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>
                      {classItem.students?.filter((s) => s.status === "active")
                        .length || 0}{" "}
                      / {classItem.capacity} học viên
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(classItem.startDate).toLocaleDateString(
                        "vi-VN"
                      )}
                      {classItem.endDate &&
                        ` - ${new Date(classItem.endDate).toLocaleDateString(
                          "vi-VN"
                        )}`}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <School className="w-4 h-4 mr-2" />
                    <span>Phòng: {classItem.room || "Chưa xếp"}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    size="small"
                    variant="primary"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/classes/${classItem._id}/students`);
                    }}
                  >
                    Xem học viên
                  </Button>
                  <Button
                    size="small"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/teacher/classes/${classItem._id}/attendance`);
                    }}
                  >
                    Điểm danh
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClassesPage;
