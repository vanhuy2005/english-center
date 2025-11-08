import { useState } from "react";
import { Card, Button } from "@components/common";
import { Download, FileText } from "lucide-react";
import api from "@services/api";

const ExportReportsPage = () => {
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    reportType: "revenue",
  });

  const handleExport = async () => {
    try {
      const response = await api.post(
        "/api/staff/accountant/reports/export",
        filters,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `report-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      alert("Có lỗi xảy ra khi xuất báo cáo!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xuất Báo Cáo</h1>
          <p className="text-gray-600 mt-1">
            Xuất báo cáo tài chính ra Excel/PDF
          </p>
        </div>
      </div>

      <Card>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại báo cáo
              </label>
              <select
                value={filters.reportType}
                onChange={(e) =>
                  setFilters({ ...filters, reportType: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="revenue">Doanh thu</option>
                <option value="debt">Công nợ</option>
                <option value="receipts">Phiếu thu</option>
                <option value="refunds">Hoàn tiền</option>
              </select>
            </div>
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
          </div>

          <Button
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Xuất Báo Cáo Excel
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ExportReportsPage;
