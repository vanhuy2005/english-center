import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Loading,
  Badge,
  Modal,
  Input,
} from "../../components/common";
import { BarChart, DoughnutChart } from "../../components/charts";
import api from "../../services/api";
import toast from "react-hot-toast";

const EnrollmentStaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalStudents: 0,
      newStudentsThisMonth: 0,
      pendingEnrollments: 0,
      activeClasses: 0,
    },
    recentStudents: [],
    pendingRequests: [],
    classesCapacity: [],
    enrollmentStats: [],
    notifications: [],
  });
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes, requestsRes, dashboardRes] =
        await Promise.all([
          api.get("/staff/enrollment/students", {
            params: { limit: 10, sort: "-createdAt" },
          }),
          api.get("/staff/enrollment/classes", {
            params: { limit: 50 }, // No status filter - get all classes
          }),
          api.get("/staff/enrollment/requests", {
            params: { status: "pending", limit: 10 },
          }),
          api.get("/staff/enrollment/dashboard"),
        ]);

      console.log("API Responses:", {
        students: studentsRes.data,
        classes: classesRes.data,
        requests: requestsRes.data,
        dashboard: dashboardRes.data,
      });

      // Extract data from API responses - backend returns {success: true, data: {students/classes/requests: [...], pagination: {...}}}
      let students = [];
      if (studentsRes.data?.data?.students) {
        students = studentsRes.data.data.students;
      } else if (Array.isArray(studentsRes.data?.data)) {
        students = studentsRes.data.data;
      } else if (Array.isArray(studentsRes.data)) {
        students = studentsRes.data;
      }

      let classes = [];
      console.log("🔍 Classes response structure:", classesRes.data);
      if (classesRes.data?.data?.classes) {
        classes = classesRes.data.data.classes;
        console.log("✅ Classes extracted from data.data.classes");
      } else if (Array.isArray(classesRes.data?.data)) {
        classes = classesRes.data.data;
        console.log("✅ Classes extracted from data.data array");
      } else if (Array.isArray(classesRes.data)) {
        classes = classesRes.data;
        console.log("✅ Classes extracted from data array");
      }
      console.log(
        "📊 Final classes array:",
        classes,
        "Length:",
        classes.length
      );

      let requests = [];
      if (requestsRes.data?.data?.requests) {
        requests = requestsRes.data.data.requests;
      } else if (Array.isArray(requestsRes.data?.data)) {
        requests = requestsRes.data.data;
      } else if (Array.isArray(requestsRes.data)) {
        requests = requestsRes.data;
      }

      const dashboardStats = dashboardRes.data?.data || dashboardRes.data || {};

      console.log("Extracted Data:", {
        students,
        classes,
        requests,
        dashboardStats,
      });

      // Ensure students is an array
      if (!Array.isArray(students)) {
        console.error("Students is not an array:", students);
        throw new Error("Invalid response format: students is not an array");
      }

      // Calculate stats
      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = students.filter(
        (s) => new Date(s.createdAt) >= thisMonthStart
      ).length;

      // Calculate enrollment stats by month (last 6 months)
      const enrollmentStats = calculateEnrollmentStatsByMonth(students);

      // Calculate class capacity
      console.log("📊 Raw classes array:", classes, "Length:", classes.length);
      const classesCapacity = classes.map((c) => ({
        _id: c._id,
        className: c.name, // Backend uses 'name' field, not 'className'
        courseCode: c.course?.courseCode || "N/A",
        currentStudents: c.currentEnrollment || 0,
        maxStudents: c.capacity || 30,
        availableSlots: c.availableSlots || 0,
        status: c.status,
        startDate: c.startDate,
      }));
      console.log("✅ Processed classesCapacity:", classesCapacity);

      setDashboardData({
        stats: dashboardStats.stats || {
          totalStudents:
            studentsRes.data?.data?.pagination?.total || students.length,
          newStudentsThisMonth: newThisMonth,
          pendingEnrollments: requests.length,
          activeClasses: classes.filter((c) => c.status === "active").length,
        },
        recentStudents: students.slice(0, 5),
        pendingRequests: requests.filter((r) =>
          ["transfer", "pause", "resume"].includes(r.type)
        ),
        classesCapacity: classesCapacity.sort(
          (a, b) => b.availableSlots - a.availableSlots
        ),
        enrollmentStats,
        notifications: dashboardStats.notifications || [],
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateEnrollmentStatsByMonth = (students) => {
    const stats = {};
    const now = new Date();

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;
      stats[monthKey] = 0;
    }

    students.forEach((student) => {
      const createdDate = new Date(student.createdAt);
      const monthKey = `${createdDate.getFullYear()}-${String(
        createdDate.getMonth() + 1
      ).padStart(2, "0")}`;
      if (stats.hasOwnProperty(monthKey)) {
        stats[monthKey]++;
      }
    });

    return Object.entries(stats).map(([month, count]) => ({ month, count }));
  };

  const handleNewStudentClick = () => {
    setShowNewStudentModal(true);
  };

  const handleEnrollStudentClick = (student) => {
    setSelectedStudent(student);
    setShowEnrollmentModal(true);
  };

  const handleProcessRequest = async (requestId, action) => {
    try {
      await api.put(`/staff/enrollment/requests/${requestId}`, { action });
      toast.success(
        action === "approve" ? "Đã phê duyệt yêu cầu" : "Đã từ chối yêu cầu"
      );
      fetchDashboardData(); // Refresh data
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error("Không thể xử lý yêu cầu");
    }
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
          <h1 className="text-3xl font-bold">Dashboard Nhân viên Ghi danh</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tuyển sinh và ghi danh học viên
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate("/enrollment/students/search")}
          >
            🔍 Tra cứu học viên
          </Button>
          <Button variant="primary" onClick={handleNewStudentClick}>
            ➕ Thêm học viên mới
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Tổng học viên"
          value={dashboardData.stats.totalStudents}
          icon="👥"
          color="blue"
          onClick={() => navigate("/enrollment/students")}
        />
        <StatsCard
          title="Học viên mới (tháng)"
          value={dashboardData.stats.newStudentsThisMonth}
          icon="✨"
          color="green"
        />
        <StatsCard
          title="Yêu cầu chờ xử lý"
          value={dashboardData.stats.pendingEnrollments}
          icon="⏳"
          color="orange"
          onClick={() => navigate("/enrollment/requests")}
        />
        <StatsCard
          title="Lớp đang hoạt động"
          value={dashboardData.stats.activeClasses}
          icon="📚"
          color="purple"
          onClick={() => navigate("/enrollment/classes")}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Students */}
        <Card title="Học viên mới ghi danh" className="lg:col-span-2">
          <div className="space-y-3">
            {dashboardData.recentStudents.length > 0 ? (
              <>
                {dashboardData.recentStudents.map((student) => (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-xl">👤</span>
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.fullName}</h3>
                        <p className="text-sm text-gray-600">
                          Mã: {student.studentCode} | {student.email}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ngày ghi danh:{" "}
                          {new Date(student.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="small"
                        variant="primary"
                        onClick={() =>
                          navigate(`/enrollment/students/${student._id}`)
                        }
                      >
                        Chi tiết
                      </Button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="secondary"
                  size="small"
                  className="w-full"
                  onClick={() => navigate("/enrollment/students")}
                >
                  Xem tất cả học viên
                </Button>
              </>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Chưa có học viên nào</p>
              </div>
            )}
          </div>
        </Card>

        {/* Notifications */}
        <Card title="Thông báo">
          {dashboardData.notifications.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-3 rounded-lg cursor-pointer ${
                    notification.isRead ? "bg-gray-50" : "bg-blue-50"
                  }`}
                  onClick={() => {
                    if (notification.link) navigate(notification.link);
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
              <Button
                variant="secondary"
                size="small"
                className="w-full"
                onClick={() => navigate("/enrollment/notifications")}
              >
                Xem tất cả
              </Button>
            </div>
          ) : (
            <p className="text-center py-8 text-gray-500">
              Không có thông báo mới
            </p>
          )}
        </Card>
      </div>

      {/* Pending Requests */}
      {dashboardData.pendingRequests.length > 0 && (
        <Card title="Yêu cầu chờ xử lý">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Học viên
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Loại yêu cầu
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Lý do
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {dashboardData.pendingRequests.map((request) => (
                  <tr key={request._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">
                          {request.student?.fullName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.student?.studentCode}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          request.type === "transfer"
                            ? "info"
                            : request.type === "pause"
                            ? "warning"
                            : "success"
                        }
                      >
                        {request.type === "transfer"
                          ? "Đổi lớp"
                          : request.type === "pause"
                          ? "Bảo lưu"
                          : request.type === "resume"
                          ? "Học lại"
                          : request.type}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {request.reason}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(request.createdAt).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          size="small"
                          variant="success"
                          onClick={() =>
                            handleProcessRequest(request._id, "approve")
                          }
                        >
                          ✓ Duyệt
                        </Button>
                        <Button
                          size="small"
                          variant="danger"
                          onClick={() =>
                            handleProcessRequest(request._id, "reject")
                          }
                        >
                          ✗ Từ chối
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Class Capacity Overview */}
      <Card title="Tình trạng lớp học (Số lượng học viên)">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Lớp học
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Khóa học
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Sĩ số
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Chỗ trống
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Ngày bắt đầu
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {dashboardData.classesCapacity.slice(0, 10).map((classItem) => {
                const percentFull =
                  (classItem.currentStudents / classItem.maxStudents) * 100;
                return (
                  <tr key={classItem._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">
                      {classItem.className}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {classItem.courseCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {classItem.currentStudents}/{classItem.maxStudents}
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              percentFull >= 90
                                ? "bg-red-500"
                                : percentFull >= 70
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            style={{ width: `${percentFull}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          classItem.availableSlots === 0
                            ? "danger"
                            : classItem.availableSlots <= 5
                            ? "warning"
                            : "success"
                        }
                      >
                        {classItem.availableSlots} chỗ
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          classItem.status === "active"
                            ? "success"
                            : classItem.status === "upcoming"
                            ? "info"
                            : "secondary"
                        }
                      >
                        {classItem.status === "active"
                          ? "Đang học"
                          : classItem.status === "upcoming"
                          ? "Sắp bắt đầu"
                          : classItem.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {new Date(classItem.startDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="secondary"
            onClick={() => navigate("/enrollment/classes")}
          >
            Xem tất cả lớp học
          </Button>
        </div>
      </Card>

      {/* Enrollment Statistics */}
      <Card title="Thống kê ghi danh (6 tháng gần nhất)">
        <div className="h-64">
          {dashboardData.enrollmentStats.length > 0 ? (
            <BarChart
              data={{
                labels: dashboardData.enrollmentStats.map((s) => s.month),
                datasets: [
                  {
                    label: "Số học viên ghi danh",
                    data: dashboardData.enrollmentStats.map((s) => s.count),
                    backgroundColor: "rgba(59, 130, 246, 0.5)",
                    borderColor: "rgba(59, 130, 246, 1)",
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Không có dữ liệu thống kê
            </div>
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Đăng ký học viên mới"
          icon="📝"
          description="Thêm học viên mới vào hệ thống"
          onClick={handleNewStudentClick}
        />
        <QuickActionCard
          title="Tra cứu học viên"
          icon="🔍"
          description="Tìm kiếm thông tin học viên"
          onClick={() => navigate("/enrollment/students/search")}
        />
        <QuickActionCard
          title="Quản lý lớp học"
          icon="📚"
          description="Xem tình trạng các lớp học"
          onClick={() => navigate("/enrollment/classes")}
        />
        <QuickActionCard
          title="Báo cáo thống kê"
          icon="📊"
          description="Xem báo cáo chi tiết"
          onClick={() => navigate("/enrollment/reports")}
        />
      </div>

      {/* New Student Modal */}
      <NewStudentModal
        isOpen={showNewStudentModal}
        onClose={() => setShowNewStudentModal(false)}
        onSuccess={() => {
          setShowNewStudentModal(false);
          fetchDashboardData();
        }}
      />

      {/* Enrollment Modal */}
      <EnrollmentModal
        isOpen={showEnrollmentModal}
        onClose={() => {
          setShowEnrollmentModal(false);
          setSelectedStudent(null);
        }}
        student={selectedStudent}
        onSuccess={() => {
          setShowEnrollmentModal(false);
          setSelectedStudent(null);
          fetchDashboardData();
        }}
      />
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon, color, onClick }) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <Card
      className={`hover:shadow-lg transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className={`text-4xl p-4 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ title, icon, description, onClick }) => (
  <div
    className="p-6 border rounded-lg hover:shadow-lg transition-shadow cursor-pointer bg-white"
    onClick={onClick}
  >
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm text-gray-600">{description}</p>
  </div>
);

// New Student Modal Component
const NewStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
    gender: "male",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/staff/enrollment/students", formData);
      toast.success("Đã thêm học viên mới thành công!");
      onSuccess();
      setFormData({
        fullName: "",
        email: "",
        phoneNumber: "",
        dateOfBirth: "",
        gender: "male",
        address: "",
      });
    } catch (error) {
      console.error("Error creating student:", error);
      toast.error(error.response?.data?.message || "Không thể thêm học viên");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Thêm học viên mới"
      size="large"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Họ và tên"
            required
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
          <Input
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <Input
            label="Số điện thoại"
            required
            value={formData.phoneNumber}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
          />
          <Input
            label="Ngày sinh"
            type="date"
            required
            value={formData.dateOfBirth}
            onChange={(e) =>
              setFormData({ ...formData, dateOfBirth: e.target.value })
            }
          />
          <div>
            <label className="block text-sm font-medium mb-2">Giới tính</label>
            <select
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
            >
              <option value="male">Nam</option>
              <option value="female">Nữ</option>
              <option value="other">Khác</option>
            </select>
          </div>
          <Input
            label="Địa chỉ"
            value={formData.address}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
          />
        </div>
        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Loading size="small" /> : "Thêm học viên"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

// Enrollment Modal Component
const EnrollmentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvailableClasses();
    }
  }, [isOpen]);

  const fetchAvailableClasses = async () => {
    try {
      const response = await api.get("/staff/enrollment/classes", {
        params: { status: "upcoming,active" },
      });

      console.log("📚 Enrollment Modal - Classes response:", response.data);

      let classList = [];
      if (response.data?.data?.classes) {
        classList = response.data.data.classes;
        console.log("📚 Classes from response.data.data.classes");
      } else if (Array.isArray(response.data?.data)) {
        classList = response.data.data;
        console.log("📚 Classes from response.data.data array");
      } else if (Array.isArray(response.data)) {
        classList = response.data;
        console.log("📚 Classes from response.data array");
      }

      console.log("📊 Total classes loaded:", classList.length);
      setClasses(classList);
    } catch (error) {
      console.error("❌ Error fetching classes:", error);
      console.error("Error details:", error.response?.data);
      setClasses([]);
      toast.error("Không thể tải danh sách lớp học");
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    try {
      setLoading(true);
      await api.post(`/staff/enrollment/students/${student._id}/enroll`, {
        classId: selectedClass,
      });
      toast.success("Đã ghi danh học viên vào lớp thành công!");
      onSuccess();
    } catch (error) {
      console.error("Error enrolling student:", error);
      toast.error(
        error.response?.data?.message || "Không thể ghi danh học viên"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !student) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ghi danh học viên: ${student.fullName}`}
      size="medium"
    >
      <form onSubmit={handleEnroll} className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm">
            <span className="font-medium">Mã học viên:</span>{" "}
            {student.studentCode}
          </p>
          <p className="text-sm">
            <span className="font-medium">Email:</span> {student.email}
          </p>
          <p className="text-sm">
            <span className="font-medium">Số điện thoại:</span>{" "}
            {student.phoneNumber}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Chọn lớp học *
          </label>
          <select
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            required
          >
            <option value="">-- Chọn lớp học --</option>
            {Array.isArray(classes) &&
              classes.map((classItem) => {
                const availableSlots =
                  (classItem.maxStudents || 30) -
                  (classItem.students?.length || 0);
                return (
                  <option
                    key={classItem._id}
                    value={classItem._id}
                    disabled={availableSlots === 0}
                  >
                    {classItem.className} - {classItem.course?.name} (
                    {availableSlots > 0
                      ? `Còn ${availableSlots} chỗ`
                      : "Đã đầy"}
                    )
                  </option>
                );
              })}
          </select>
        </div>

        <div className="flex gap-3 justify-end pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Hủy
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Loading size="small" /> : "Ghi danh"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrollmentStaffDashboard;
