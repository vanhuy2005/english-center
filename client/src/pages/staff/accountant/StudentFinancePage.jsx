import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading, Input, Button, Badge } from "@components/common";
import { Users, Search, Eye, DollarSign, AlertCircle } from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

const StudentFinancePage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/academic/students");
      if (response.data.success) {
        // Get payment info for each student
        const studentsWithPayments = await Promise.all(
          response.data.data.map(async (student) => {
            try {
              const paymentResponse = await api.get(
                `/staff/accountant/students/${student._id}/payments`
              );
              return {
                ...student,
                paymentSummary: paymentResponse.data.data?.summary || {
                  totalAmount: 0,
                  paidAmount: 0,
                  remainingAmount: 0,
                },
              };
            } catch (error) {
              return {
                ...student,
                paymentSummary: {
                  totalAmount: 0,
                  paidAmount: 0,
                  remainingAmount: 0,
                },
              };
            }
          })
        );
        setStudents(studentsWithPayments);
      }
    } catch (error) {
      console.error("Load students error:", error);
      toast.error("Không thể tải danh sách học viên");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      student.fullName?.toLowerCase().includes(searchLower) ||
      student.studentCode?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower)
    );
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-8 h-8 text-[#3B9797]" />
          <h1 className="text-2xl font-bold text-gray-800">
            Tài chính học viên
          </h1>
        </div>
      </div>

      {/* Search */}
      <Card>
        <Input
          placeholder="Tìm kiếm học viên (tên, mã, email)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mã HV
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tổng học phí
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đã thanh toán
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Còn nợ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const summary = student.paymentSummary || {};
                  const hasDebt = summary.remainingAmount > 0;

                  return (
                    <tr
                      key={student._id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/accountant/students/${student._id}/payments`)
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-[#3B9797] flex items-center justify-center text-white font-semibold">
                              {student.fullName?.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(summary.totalAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                        {formatCurrency(summary.paidAmount || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            hasDebt
                              ? "text-red-600 font-medium"
                              : "text-gray-900"
                          }
                        >
                          {formatCurrency(summary.remainingAmount || 0)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasDebt ? (
                          <Badge variant="warning">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Còn nợ
                          </Badge>
                        ) : summary.totalAmount > 0 ? (
                          <Badge variant="success">Đã thanh toán</Badge>
                        ) : (
                          <Badge variant="secondary">Chưa có giao dịch</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/accountant/students/${student._id}/payments`
                            );
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Chi tiết
                        </Button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    {searchTerm
                      ? "Không tìm thấy học viên nào"
                      : "Chưa có học viên"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default StudentFinancePage;
