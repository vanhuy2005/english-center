import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Button,
  Space,
  Spin,
  message,
  Tag,
  Tooltip,
  Select,
} from "antd";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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
import {
  DollarOutlined,
  FileTextOutlined,
  DownloadOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
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

const ReceiptStatisticsPage = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalAmount: 0,
    totalReceipts: 0,
    byMethod: [],
  });
  const [dateRange, setDateRange] = useState(null);
  const [detailedData, setDetailedData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  const methodLabels = {
    cash: "Tiền mặt",
    bank_transfer: "Chuyển khoản",
    credit_card: "Thẻ tín dụng",
    momo: "MoMo",
    refund: "Hoàn tiền",
    other: "Khác",
  };

  const fetchStatistics = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (dateRange?.[0] && dateRange?.[1]) {
        params.startDate = dateRange[0].format("YYYY-MM-DD");
        params.endDate = dateRange[1].format("YYYY-MM-DD");
      }

      const data = await receiptService.getStatistics(params);
      setStats({
        totalAmount: data.totalAmount || 0,
        totalReceipts: data.totalReceipts || 0,
        byMethod: data.byMethod || [],
      });

      // Process data for charts
      processChartData(data.byMethod || [], data.dailyStats || []);
    } catch (error) {
      message.error("Không thể tải thống kê");
      console.error("Error fetching statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const processChartData = (methodData, dailyStats = []) => {
    // Convert method data for pie chart
    const detailed = methodData.map((item) => ({
      name: methodLabels[item._id] || item._id,
      value: item.total,
      count: item.count,
      originalMethod: item._id,
    }));
    setDetailedData(detailed);

    // Process daily data from API or generate default
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

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleDateRangeChange = (dates) => {
    setDateRange(dates);
  };

  const handleReset = () => {
    setDateRange(null);
  };

  const handleExport = () => {
    message.info("Chức năng xuất báo cáo sẽ được cập nhật sớm");
  };

  const averageAmount =
    stats.totalReceipts > 0
      ? Math.floor(stats.totalAmount / stats.totalReceipts)
      : 0;

  const methodTable = {
    columns: [
      {
        title: "Phương thức thanh toán",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Số lần",
        dataIndex: "count",
        key: "count",
        align: "right",
      },
      {
        title: "Tổng tiền",
        dataIndex: "value",
        key: "value",
        align: "right",
        render: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value),
      },
      {
        title: "Tỉ lệ",
        dataIndex: "percentage",
        key: "percentage",
        align: "center",
        render: (_, record) => {
          const percentage =
            stats.totalAmount > 0
              ? ((record.value / stats.totalAmount) * 100).toFixed(2)
              : 0;
          return `${percentage}%`;
        },
      },
    ],
    dataSource: detailedData.map((item, idx) => ({ ...item, key: idx })),
  };

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: "24px" }}>
        <h1 style={{ marginBottom: "24px" }}>
          📊 Thống Kê Doanh Thu Từ Phiếu Thu
        </h1>

        <Space style={{ marginBottom: "24px" }} wrap>
          <RangePicker
            value={dateRange}
            onChange={handleDateRangeChange}
            format="DD/MM/YYYY"
            placeholder={["Ngày bắt đầu", "Ngày kết thúc"]}
          />
          <Button onClick={handleReset}>Đặt lại</Button>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất báo cáo
          </Button>
        </Space>
      </Card>

      <Spin spinning={loading}>
        {/* Key Statistics */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Tổng doanh thu"
                value={stats.totalAmount}
                prefix="₫"
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN").format(value)
                }
                valueStyle={{ color: "#1890ff", fontSize: "18px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Số phiếu thu"
                value={stats.totalReceipts}
                valueStyle={{ color: "#52c41a", fontSize: "18px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Doanh thu trung bình"
                value={averageAmount}
                prefix="₫"
                formatter={(value) =>
                  new Intl.NumberFormat("vi-VN").format(value)
                }
                valueStyle={{ color: "#faad14", fontSize: "18px" }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Phương thức nhiều nhất"
                value={
                  detailedData.length > 0
                    ? detailedData.reduce((max, item) =>
                        item.value > max.value ? item : max
                      ).name
                    : "N/A"
                }
                valueStyle={{ fontSize: "14px" }}
              />
            </Card>
          </Col>
        </Row>

        {/* Charts */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          {/* Pie Chart - By Payment Method */}
          <Col xs={24} lg={12}>
            <Card title="Doanh thu theo phương thức thanh toán">
              {detailedData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={detailedData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {detailedData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Không có dữ liệu
                </div>
              )}
            </Card>
          </Col>

          {/* Bar Chart - Daily Receipts */}
          <Col xs={24} lg={12}>
            <Card title="Doanh thu hàng ngày (7 ngày gần đây)">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                    <Legend />
                    <Bar dataKey="amount" fill="#1890ff" name="Doanh thu" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Không có dữ liệu
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Line Chart - Cumulative Revenue */}
        <Row gutter={[16, 16]} style={{ marginBottom: "24px" }}>
          <Col xs={24}>
            <Card title="Tổng doanh thu tích lũy">
              {dailyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart
                    data={dailyData.map((item, idx) => ({
                      ...item,
                      cumulative: dailyData
                        .slice(0, idx + 1)
                        .reduce((sum, d) => sum + d.amount, 0),
                    }))}
                  >
                    <defs>
                      <linearGradient
                        id="colorCumulative"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1890ff"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1890ff"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip
                      formatter={(value) =>
                        new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                        }).format(value)
                      }
                    />
                    <Area
                      type="monotone"
                      dataKey="cumulative"
                      stroke="#1890ff"
                      fillOpacity={1}
                      fill="url(#colorCumulative)"
                      name="Tổng tích lũy"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div
                  style={{
                    height: 300,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  Không có dữ liệu
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Methods Table */}
        <Card title="Chi tiết theo phương thức thanh toán">
          <Table
            columns={methodTable.columns}
            dataSource={methodTable.dataSource}
            pagination={false}
            loading={loading}
            size="middle"
          />
        </Card>
      </Spin>
    </div>
  );
};

export default ReceiptStatisticsPage;
