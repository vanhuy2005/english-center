import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  DatePicker,
  Modal,
  message,
  Tabs,
  Row,
  Col,
  Statistic,
  Spin,
} from "antd";
import {
  FileTextOutlined,
  EyeOutlined,
  PrinterOutlined,
  SearchOutlined,
  PlusOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { receiptService } from "@services/receiptService";
import dayjs from "dayjs";

const { RangePicker } = DatePicker;
const COLORS = [
  "#1890ff",
  "#52c41a",
  "#faad14",
  "#f5222d",
  "#722ed1",
  "#13c2c2",
];

const ReceiptManagementPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [receipts, setReceipts] = useState([]);
  const [statistics, setStatistics] = useState({
    totalAmount: 0,
    totalReceipts: 0,
    byMethod: [],
  });
  const [detailedData, setDetailedData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [typeFilter, setTypeFilter] = useState(null);
  const [methodFilter, setMethodFilter] = useState(null);
  const [dateRange, setDateRange] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("list");

  const typeLabels = {
    tuition: "Học phí",
    material: "Tài liệu",
    exam: "Thi cử",
    other: "Khác",
  };

  const methodLabels = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    credit_card: "Thẻ tín dụng",
    momo: "MoMo",
    refund: "Hoàn tiền",
    other: "Khác",
  };

  const fetchReceipts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
        search: searchText || undefined,
        type: typeFilter || undefined,
        paymentMethod: methodFilter || undefined,
        startDate:
          dateRange?.[0] && dateRange?.[0].isValid()
            ? dateRange[0].format("YYYY-MM-DD")
            : undefined,
        endDate:
          dateRange?.[1] && dateRange?.[1].isValid()
            ? dateRange[1].format("YYYY-MM-DD")
            : undefined,
      };

      const data = await receiptService.getReceipts(params);
      setReceipts(data.receipts);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (error) {
      message.error("Không thể tải danh sách phiếu thu");
      console.error("Error fetching receipts:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.current,
    pagination.pageSize,
    searchText,
    typeFilter,
    methodFilter,
    dateRange,
  ]);

  const fetchStatistics = useCallback(async () => {
    try {
      const params = {};
      if (dateRange?.[0] && dateRange?.[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const data = await receiptService.getStatistics(params);
      setStatistics({
        totalAmount: data.totalAmount || 0,
        totalReceipts: data.totalReceipts || 0,
        byMethod: data.byMethod || [],
      });

      processChartData(data.byMethod || [], data.dailyStats || []);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  }, [dateRange]);

  // Load data on mount and when filters change
  useEffect(() => {
    fetchReceipts();
    fetchStatistics();
  }, [fetchReceipts, fetchStatistics]);

  const processChartData = (methodData, dailyStats = []) => {
    const detailed = methodData.map((item) => ({
      name: methodLabels[item._id] || item._id,
      value: item.total,
      count: item.count,
      originalMethod: item._id,
    }));
    setDetailedData(detailed);

    if (dailyStats.length > 0) {
      const formatted = dailyStats.map((stat) => ({
        date: dayjs(stat.date).format("DD/MM"),
        fullDate: stat.date,
        receipts: stat.receipts,
        amount: stat.amount,
      }));
      setDailyData(formatted);
    } else {
      generateDailyData();
    }
  };

  const generateDailyData = () => {
    const today = dayjs();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = today.subtract(6 - i, "day");
      return {
        date: date.format("DD/MM"),
        fullDate: date.format("YYYY-MM-DD"),
        receipts: 0,
        amount: 0,
      };
    });
    setDailyData(last7Days);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTypeColor = (type) => {
    const colors = {
      tuition: "blue",
      material: "green",
      exam: "orange",
      other: "default",
    };
    return colors[type] || "default";
  };

  const getPaymentMethodColor = (method) => {
    const colors = {
      cash: "success",
      transfer: "processing",
      card: "warning",
    };
    return colors[method] || "default";
  };

  const handleViewDetail = async (record) => {
    try {
      const detail = await receiptService.getReceiptById(record._id);
      setSelectedReceipt(detail);
      setDetailModalVisible(true);
    } catch (error) {
      message.error("Không thể tải chi tiết phiếu thu");
    }
  };

  const handlePrint = (record) => {
    const printWindow = window.open("", "_blank");
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Phiếu Thu - ${record.receiptNumber}</title>
        <style>
          body {
            font-family: 'Times New Roman', Times, serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #000;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            margin: 10px 0;
            text-transform: uppercase;
          }
          .header p {
            margin: 5px 0;
            font-size: 14px;
          }
          .receipt-info {
            margin: 30px 0;
          }
          .info-row {
            display: flex;
            margin: 10px 0;
            font-size: 16px;
          }
          .info-label {
            font-weight: bold;
            width: 200px;
          }
          .info-value {
            flex: 1;
          }
          .amount-box {
            border: 2px solid #000;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
          }
          .amount-box .label {
            font-size: 16px;
            margin-bottom: 10px;
          }
          .amount-box .amount {
            font-size: 32px;
            font-weight: bold;
            color: #2c5f2d;
          }
          .signatures {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }
          .signature-box {
            text-align: center;
            width: 45%;
          }
          .signature-box .title {
            font-weight: bold;
            margin-bottom: 80px;
          }
          .signature-box .name {
            font-style: italic;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            font-style: italic;
          }
          @media print {
            body {
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TRUNG TÂM TIẾNG ANH</h1>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>Điện thoại: (028) 1234 5678 | Email: info@englishcenter.com</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <h2 style="font-size: 24px; text-transform: uppercase;">PHIẾU THU</h2>
          <p style="font-size: 16px;">Mã phiếu: <strong>${
            record.receiptNumber
          }</strong></p>
          <p style="font-size: 14px;">Ngày: ${dayjs(record.createdAt).format(
            "DD/MM/YYYY"
          )}</p>
        </div>

        <div class="receipt-info">
          <div class="info-row">
            <span class="info-label">Họ và tên học viên:</span>
            <span class="info-value"><strong>${
              record.student?.fullName || "N/A"
            }</strong></span>
          </div>
          <div class="info-row">
            <span class="info-label">Mã học viên:</span>
            <span class="info-value">${
              record.student?.studentCode || "N/A"
            }</span>
          </div>
          <div class="info-row">
            <span class="info-label">Lớp học:</span>
            <span class="info-value">${record.class?.name || "N/A"}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Phương thức thanh toán:</span>
            <span class="info-value">${
              methodLabels[record.paymentMethod]
            }</span>
          </div>
          ${
            record.note
              ? `
          <div class="info-row">
            <span class="info-label">Ghi chú:</span>
            <span class="info-value">${record.note}</span>
          </div>
          `
              : ""
          }
        </div>

        <div class="amount-box">
          <div class="label">Số tiền thu được:</div>
          <div class="amount">${formatCurrency(record.amount)}</div>
          <div style="margin-top: 10px; font-style: italic;">
            (Bằng chữ: ${numberToWords(record.amount)} đồng)
          </div>
        </div>

        <div class="signatures">
          <div class="signature-box">
            <div class="title">Người nộp tiền</div>
            <div class="name">(Ký và ghi rõ họ tên)</div>
          </div>
          <div class="signature-box">
            <div class="title">Người thu tiền</div>
            <div class="name">${record.createdBy?.fullName || "N/A"}</div>
          </div>
        </div>

        <div class="footer">
          <p>Phiếu thu được in tự động từ hệ thống - Ngày in: ${new Date().toLocaleDateString(
            "vi-VN"
          )}</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const numberToWords = (num) => {
    const units = [
      "",
      "một",
      "hai",
      "ba",
      "bốn",
      "năm",
      "sáu",
      "bảy",
      "tám",
      "chín",
    ];
    const teens = [
      "mười",
      "mười một",
      "mười hai",
      "mười ba",
      "mười bốn",
      "mười lăm",
      "mười sáu",
      "mười bảy",
      "mười tám",
      "mười chín",
    ];
    const tens = [
      "",
      "",
      "hai mươi",
      "ba mươi",
      "bốn mươi",
      "năm mươi",
      "sáu mươi",
      "bảy mươi",
      "tám mươi",
      "chín mươi",
    ];
    const scales = ["", "nghìn", "triệu", "tỷ"];

    if (num === 0) return "Không";

    const convertGroup = (n) => {
      let str = "";
      const hundred = Math.floor(n / 100);
      const remainder = n % 100;

      if (hundred > 0) {
        str += units[hundred] + " trăm ";
      }

      if (remainder > 0) {
        if (remainder < 10) {
          if (hundred > 0) str += "lẻ ";
          str += units[remainder];
        } else if (remainder < 20) {
          str += teens[remainder - 10];
        } else {
          const ten = Math.floor(remainder / 10);
          const unit = remainder % 10;
          str += tens[ten];
          if (unit > 0) {
            str += " " + (unit === 5 && ten > 1 ? "lăm" : units[unit]);
          }
        }
      }

      return str.trim();
    };

    let result = [];
    let scaleIndex = 0;

    while (num > 0) {
      const group = num % 1000;
      if (group > 0) {
        result.unshift(convertGroup(group) + " " + scales[scaleIndex]);
      }
      num = Math.floor(num / 1000);
      scaleIndex++;
    }

    return result.join(" ").trim().replace(/\s+/g, " ");
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
      width: 120,
      fixed: "left",
    },
    {
      title: "Ngày thu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Mã HV",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
      width: 100,
    },
    {
      title: "Họ tên học viên",
      dataIndex: ["student", "fullName"],
      key: "studentName",
      width: 180,
    },
    {
      title: "Số tiền",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount) => (
        <span className="font-semibold">{formatCurrency(amount)}</span>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: "Phương thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (method) => (
        <Tag color={getPaymentMethodColor(method)}>{methodLabels[method]}</Tag>
      ),
    },
    {
      title: "Người thu",
      dataIndex: ["createdBy", "fullName"],
      key: "createdBy",
      width: 150,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const statusConfig = {
          active: { color: "success", label: "Hoạt động" },
          inactive: { color: "default", label: "Không hoạt động" },
          voided: { color: "error", label: "Đã hủy" },
        };
        const config = statusConfig[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 180,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<PrinterOutlined />}
            size="small"
            onClick={() => handlePrint(record)}
          >
            In
          </Button>
        </Space>
      ),
    },
  ];

  const handleTableChange = (newPagination) => {
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));
  };

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, current: 1 }));
    fetchReceipts();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">Danh Sách Phiếu Thu</h2>
          <p className="text-gray-600">Quản lý các phiếu thu đã được tạo</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate("/accountant/create-receipt")}
        >
          Tạo Phiếu Thu Mới
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card>
          <div className="text-gray-600">Tổng số phiếu</div>
          <div className="text-3xl font-bold text-blue-600">
            {statistics.totalReceipts}
          </div>
        </Card>
        <Card>
          <div className="text-gray-600">Tổng tiền đã thu</div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(statistics.totalAmount)}
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div style={{ flex: 1, minWidth: 250 }}>
            <Input
              placeholder="Tìm theo mã phiếu, mã HV, tên..."
              prefix={<SearchOutlined />}
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onPressEnter={handleSearch}
            />
          </div>
          <Select
            placeholder="Loại thu"
            style={{ width: 150 }}
            allowClear
            value={typeFilter}
            onChange={setTypeFilter}
          >
            <Select.Option value="tuition">Học phí</Select.Option>
            <Select.Option value="material">Tài liệu</Select.Option>
            <Select.Option value="exam">Thi cử</Select.Option>
            <Select.Option value="other">Khác</Select.Option>
          </Select>
          <Select
            placeholder="Phương thức"
            style={{ width: 150 }}
            allowClear
            value={methodFilter}
            onChange={setMethodFilter}
          >
            <Select.Option value="cash">Tiền mặt</Select.Option>
            <Select.Option value="transfer">Chuyển khoản</Select.Option>
            <Select.Option value="card">Thẻ</Select.Option>
          </Select>
          <RangePicker
            placeholder={["Từ ngày", "Đến ngày"]}
            value={dateRange}
            onChange={setDateRange}
          />
          <Button
            type="primary"
            icon={<SearchOutlined />}
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={receipts}
          rowKey="_id"
          loading={loading}
          scroll={{ x: 1600 }}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} phiếu thu`,
          }}
          onChange={handleTableChange}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined /> Chi Tiết Phiếu Thu
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="print"
            icon={<PrinterOutlined />}
            onClick={() => handlePrint(selectedReceipt)}
          >
            In Phiếu Thu
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={600}
      >
        {selectedReceipt && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-gray-600 text-sm">Mã phiếu thu</div>
                <div className="font-semibold">{selectedReceipt.receiptId}</div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Ngày thu</div>
                <div className="font-semibold">
                  {dayjs(selectedReceipt.createdAt).format("DD/MM/YYYY HH:mm")}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Mã học viên</div>
                <div className="font-semibold">
                  {selectedReceipt.studentId?.studentId}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Họ tên</div>
                <div className="font-semibold">
                  {selectedReceipt.studentId?.fullName}
                </div>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Loại thu</div>
                <Tag color={getTypeColor(selectedReceipt.type)}>
                  {typeLabels[selectedReceipt.type]}
                </Tag>
              </div>
              <div>
                <div className="text-gray-600 text-sm">Phương thức</div>
                <Tag
                  color={getPaymentMethodColor(selectedReceipt.paymentMethod)}
                >
                  {methodLabels[selectedReceipt.paymentMethod]}
                </Tag>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 text-sm">Số tiền</div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(selectedReceipt.amount)}
                </div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-600 text-sm">Người thu</div>
                <div className="font-semibold">
                  {selectedReceipt.createdBy?.fullName}
                </div>
              </div>
              {selectedReceipt.note && (
                <div className="col-span-2">
                  <div className="text-gray-600 text-sm">Ghi chú</div>
                  <div>{selectedReceipt.note}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReceiptManagementPage;
