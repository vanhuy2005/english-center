import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Badge } from "../../components/common";
import { LineChart } from "../../components/charts";
import api from "../../services/api";
import toast from "react-hot-toast";

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [finance, setFinance] = useState([]);

  useEffect(() => {
    fetchStudentDetails();
  }, [id]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const [studentRes, attendanceRes, gradesRes, financeRes] =
        await Promise.all([
          api.get(`/students/${id}`),
          api.get(`/attendance/student/${id}`),
          api.get(`/grades?student=${id}`),
          api.get(`/finance/student/${id}`),
        ]);

      setStudent(studentRes.data.data);
      setAttendance(attendanceRes.data.data);
      setGrades(gradesRes.data.data);
      setFinance(financeRes.data.data);
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Không thể tải thông tin học viên");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      active: { label: "Đang học", variant: "success" },
      inactive: { label: "Chưa học", variant: "secondary" },
      completed: { label: "Hoàn thành", variant: "info" },
      suspended: { label: "Tạm dừng", variant: "warning" },
      expelled: { label: "Đình chỉ", variant: "danger" },
    };
    return statusMap[status] || { label: status, variant: "secondary" };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy học viên</h2>
        <Button onClick={() => navigate("/students")}>
          Quay lại danh sách
        </Button>
      </div>
    );
  }

  const statusBadge = getStatusBadge(student.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{student.fullName}</h1>
            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
          </div>
          <p className="text-gray-600 mt-1">
            Mã học viên:{" "}
            <span className="font-semibold">{student.studentCode}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate(`/students/${id}/edit`)}
          >
            Chỉnh sửa
          </Button>
          <Button variant="secondary" onClick={() => navigate("/students")}>
            Quay lại
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: "overview", label: "Tổng quan" },
            { id: "attendance", label: "Điểm danh" },
            { id: "grades", label: "Điểm số" },
            { id: "finance", label: "Tài chính" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Info */}
          <Card title="Thông tin cá nhân" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem label="Email" value={student.email} />
              <InfoItem label="Số điện thoại" value={student.phone} />
              <InfoItem
                label="Ngày sinh"
                value={
                  student.dateOfBirth
                    ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN")
                    : "N/A"
                }
              />
              <InfoItem label="Giới tính" value={student.gender || "N/A"} />
              <InfoItem
                label="Địa chỉ"
                value={student.address || "N/A"}
                className="col-span-2"
              />
            </div>
          </Card>

          {/* Statistics */}
          <Card title="Thống kê">
            <div className="space-y-4">
              <StatItem
                label="Số khóa học"
                value={student.classes?.length || 0}
                icon="📚"
              />
              <StatItem
                label="Tỷ lệ điểm danh"
                value={`${attendance.stats?.attendanceRate || 0}%`}
                icon="✓"
              />
              <StatItem
                label="Điểm trung bình"
                value={
                  grades.length > 0
                    ? (
                        grades.reduce(
                          (sum, g) => sum + (g.totalScore || 0),
                          0
                        ) / grades.length
                      ).toFixed(1)
                    : "N/A"
                }
                icon="🎓"
              />
              <StatItem
                label="Học phí đã đóng"
                value={
                  finance.length > 0
                    ? `${finance
                        .reduce((sum, f) => sum + (f.paidAmount || 0), 0)
                        .toLocaleString()} VND`
                    : "0 VND"
                }
                icon="💰"
              />
            </div>
          </Card>

          {/* Contact Info */}
          <Card title="Thông tin liên hệ" className="lg:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <InfoItem
                label="Người liên hệ khẩn cấp"
                value={student.emergencyContact?.name || "N/A"}
              />
              <InfoItem
                label="SĐT khẩn cấp"
                value={student.emergencyContact?.phone || "N/A"}
              />
              <InfoItem
                label="Quan hệ"
                value={student.emergencyContact?.relationship || "N/A"}
              />
            </div>
          </Card>

          {/* Notes */}
          {student.notes && (
            <Card title="Ghi chú" className="lg:col-span-3">
              <p className="text-gray-700">{student.notes}</p>
            </Card>
          )}
        </div>
      )}

      {activeTab === "attendance" && (
        <Card title="Lịch sử điểm danh">
          {attendance.attendance && attendance.attendance.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {attendance.stats?.present || 0}
                  </div>
                  <div className="text-sm text-gray-600">Có mặt</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">
                    {attendance.stats?.absent || 0}
                  </div>
                  <div className="text-sm text-gray-600">Vắng</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">
                    {attendance.stats?.late || 0}
                  </div>
                  <div className="text-sm text-gray-600">Muộn</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {attendance.stats?.attendanceRate || 0}%
                  </div>
                  <div className="text-sm text-gray-600">Tỷ lệ</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ngày
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Lớp học
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ghi chú
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendance.attendance.map((record) => (
                      <tr key={record._id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.class?.className || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              record.status === "present"
                                ? "success"
                                : record.status === "absent"
                                ? "danger"
                                : "warning"
                            }
                          >
                            {record.status === "present"
                              ? "Có mặt"
                              : record.status === "absent"
                              ? "Vắng"
                              : "Muộn"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {record.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Chưa có dữ liệu điểm danh
            </p>
          )}
        </Card>
      )}

      {activeTab === "grades" && (
        <Card title="Bảng điểm">
          {grades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khóa học
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lớp
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm giữa kỳ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Điểm cuối kỳ
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng điểm
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xếp loại
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {grades.map((grade) => (
                    <tr key={grade._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {grade.course?.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {grade.class?.className || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {grade.scores?.midterm || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                        {grade.scores?.final || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-gray-900">
                        {grade.totalScore?.toFixed(1) || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge
                          variant={
                            grade.letterGrade?.startsWith("A")
                              ? "success"
                              : grade.letterGrade?.startsWith("B")
                              ? "info"
                              : grade.letterGrade?.startsWith("C")
                              ? "warning"
                              : "danger"
                          }
                        >
                          {grade.letterGrade || "-"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge
                          variant={
                            grade.status === "completed"
                              ? "success"
                              : grade.status === "in_progress"
                              ? "warning"
                              : "danger"
                          }
                        >
                          {grade.status === "completed"
                            ? "Hoàn thành"
                            : grade.status === "in_progress"
                            ? "Đang học"
                            : "Chưa đạt"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Chưa có dữ liệu điểm số
            </p>
          )}
        </Card>
      )}

      {activeTab === "finance" && (
        <Card title="Lịch sử tài chính">
          {finance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mã GD
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Số tiền
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đã đóng
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {finance.map((transaction) => (
                    <tr key={transaction._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transaction.transactionCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.type === "tuition"
                          ? "Học phí"
                          : transaction.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {transaction.amount?.toLocaleString()} VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                        {transaction.paidAmount?.toLocaleString()} VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <Badge
                          variant={
                            transaction.status === "paid"
                              ? "success"
                              : transaction.status === "partial"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {transaction.status === "paid"
                            ? "Đã đóng"
                            : transaction.status === "partial"
                            ? "Một phần"
                            : "Chưa đóng"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString(
                          "vi-VN"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">
              Chưa có dữ liệu tài chính
            </p>
          )}
        </Card>
      )}
    </div>
  );
};

// Helper Components
const InfoItem = ({ label, value, className = "" }) => (
  <div className={className}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{value}</dd>
  </div>
);

const StatItem = ({ label, value, icon }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
    <div>
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
    <div className="text-3xl">{icon}</div>
  </div>
);

export default StudentDetailPage;
