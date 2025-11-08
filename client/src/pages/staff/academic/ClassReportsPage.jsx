import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Button } from "@components/common";
import { FileText, Download } from "lucide-react";
import { BarChart, DoughnutChart } from "@components/charts";

const ClassReportsPage = () => {
  const { classId } = useParams();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    if (classId) {
      loadReport();
    }
  }, [classId]);

  const loadReport = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        `/api/staff/academic/reports/class/${classId}`
      );
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Implement export
    alert("Chức năng xuất báo cáo đang được phát triển");
  };

  if (loading) return <Loading />;
  if (!report) return <div>Không tìm thấy báo cáo</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="text-blue-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Báo Cáo Lớp Học
            </h1>
            <p className="text-gray-600 mt-1">{report.className}</p>
          </div>
        </div>
        <Button onClick={handleExport} className="flex items-center gap-2">
          <Download size={18} />
          Xuất báo cáo
        </Button>
      </div>

      {/* Attendance Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tổng Quan Điểm Danh
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-600">Tổng buổi học</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {report.attendanceSummary?.totalSessions || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tỷ lệ có mặt</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {report.attendanceSummary?.averageRate?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Có mặt</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {report.attendanceSummary?.presentCount || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Vắng mặt</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {report.attendanceSummary?.absentCount || 0}
            </p>
          </div>
        </div>
      </Card>

      {/* Grade Summary */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Tổng Quan Điểm
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Điểm trung bình</p>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {report.gradeSummary?.averageScore?.toFixed(1) || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tỷ lệ đạt</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {report.gradeSummary?.passRate?.toFixed(1) || 0}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Đạt</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              {report.gradeSummary?.passedCount || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Không đạt</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {report.gradeSummary?.failedCount || 0}
            </p>
          </div>
        </div>

        {report.gradeDistribution && (
          <div className="mt-6">
            <h4 className="text-md font-semibold text-gray-700 mb-3">
              Phân Bố Điểm
            </h4>
            <DoughnutChart data={report.gradeDistribution} height={300} />
          </div>
        )}
      </Card>

      {/* Students List */}
      {report.students && report.students.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Danh Sách Học Viên
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    Họ tên
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Điểm danh
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Điểm số
                  </th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Kết quả
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {report.students.map((student) => (
                  <tr key={student._id}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {student.fullName}
                      </p>
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-green-600">
                        {student.attendanceRate?.toFixed(0) || 0}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-blue-600">
                        {student.score?.toFixed(1) || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {student.passed ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          Đạt
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                          Không đạt
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ClassReportsPage;
