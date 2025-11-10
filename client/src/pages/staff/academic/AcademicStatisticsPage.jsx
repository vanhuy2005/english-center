import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import { BarChart3 } from "lucide-react";
import { BarChart, LineChart, DoughnutChart } from "@components/charts";

const AcademicStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    attendanceTrend: { labels: [], datasets: [] },
    gradeDistribution: { labels: [], datasets: [] },
    classPerformance: { labels: [], datasets: [] },
  });
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    classId: "",
    level: "",
  });

  useEffect(() => {
    loadStatistics();
  }, [filters]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/academic/statistics", {
        params: filters,
      });
      if (response.data.success) {
        setStatistics(response.data.data);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <BarChart3 className="text-purple-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống Kê Học Vụ</h1>
          <p className="text-gray-600 mt-1">
            Biểu đồ thống kê điểm danh và kết quả học tập
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cấp độ
            </label>
            <select
              value={filters.level}
              onChange={(e) =>
                setFilters({ ...filters, level: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tất cả</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Charts */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Xu Hướng Điểm Danh
        </h3>
        <LineChart data={statistics.attendanceTrend} height={300} />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phân Bố Điểm
        </h3>
        <DoughnutChart data={statistics.gradeDistribution} height={300} />
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Hiệu Suất Lớp Học
        </h3>
        <BarChart data={statistics.classPerformance} height={350} />
      </Card>
    </div>
  );
};

export default AcademicStatisticsPage;
