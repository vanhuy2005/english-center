import React, { useState, useCallback, useEffect } from "react";
import {
  Card,
  Table,
  Tag,
  Button,
  Input,
  Select,
  Space,
  Statistic,
  Row,
  Col,
  message,
} from "antd";
import {
  SearchOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { financeService } from "@services/index";

const { Search } = Input;

const TuitionStatusPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [data, setData] = useState([]);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await financeService.getAll({ limit: 100 });
        console.log("Finance response:", response);

        // Handle different response structures
        let financeData = [];
        if (Array.isArray(response?.data)) {
          financeData = response.data;
        } else if (Array.isArray(response?.data?.data)) {
          financeData = response.data.data;
        } else if (Array.isArray(response)) {
          financeData = response;
        }

        console.log("Processed financeData:", financeData);

        // Transform API data to match table structure
        const transformedData = financeData.map((item) => ({
          id: item._id,
          studentId: item.student?.studentId || item.student?._id,
          studentName: item.student?.fullName || "Unknown",
          class: item.course?.courseCode || "N/A",
          totalAmount: item.amount || 0,
          paidAmount: item.paidAmount || 0,
          remainingAmount: item.remainingAmount || 0,
          status: item.status || "pending",
          dueDate: item.dueDate
            ? new Date(item.dueDate).toLocaleDateString("vi-VN")
            : "N/A",
        }));

        setData(transformedData);
      } catch (error) {
        console.error("Error fetching tuition data:", error);
        message.error("Không thể tải dữ liệu học phí");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        color: "success",
        text: "Đã thanh toán",
        icon: <CheckCircleOutlined />,
      },
      partial: {
        color: "processing",
        text: "Thanh toán 1 phần",
        icon: <ClockCircleOutlined />,
      },
      unpaid: {
        color: "default",
        text: "Chưa thanh toán",
        icon: <ClockCircleOutlined />,
      },
      overdue: { color: "error", text: "Quá hạn", icon: <WarningOutlined /> },
    };
    return configs[status] || configs.unpaid;
  };

  const handleCreateReceipt = useCallback(
    (studentId) => {
      try {
        navigate("/accountant/create-receipt", {
          state: {
            studentId: studentId || null,
            returnToTuition: true,
          },
        });
      } catch (error) {
        console.error("Navigation error:", error);
        message.error("Không thể chuyển trang");
      }
    },
    [navigate]
  );

  const handleViewDetails = useCallback(
    (studentId) => {
      try {
        navigate(`/accountant/students/${studentId}/payments`);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    },
    [navigate]
  );

  const handleUpdateTuition = useCallback(() => {
    try {
      navigate("/accountant/update-tuition");
    } catch (error) {
      console.error("Navigation error:", error);
    }
  }, [navigate]);

  const columns = [
    {
      title: "Mã HV",
      dataIndex: "studentId",
      key: "studentId",
      width: 100,
    },
    {
      title: "Họ và tên",
      dataIndex: "studentName",
      key: "studentName",
      width: 200,
    },
    {
      title: "Lớp",
      dataIndex: "class",
      key: "class",
      width: 120,
    },
    {
      title: "Tổng học phí",
      dataIndex: "totalAmount",
      key: "totalAmount",
      width: 150,
      render: (amount) => formatCurrency(amount),
    },
    {
      title: "Đã đóng",
      dataIndex: "paidAmount",
      key: "paidAmount",
      width: 150,
      render: (amount) => (
        <span className="text-green-600">{formatCurrency(amount)}</span>
      ),
    },
    {
      title: "Còn lại",
      dataIndex: "remainingAmount",
      key: "remainingAmount",
      width: 150,
      render: (amount) => (
        <span className={amount > 0 ? "text-red-600 font-semibold" : ""}>
          {formatCurrency(amount)}
        </span>
      ),
    },
    {
      title: "Hạn đóng",
      dataIndex: "dueDate",
      key: "dueDate",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetails(record.id)}
          >
            Chi tiết
          </Button>
          {record.remainingAmount > 0 && (
            <Button
              type="primary"
              size="small"
              onClick={() => handleCreateReceipt(record.id)}
            >
              Thu tiền
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Statistics
  const stats = {
    total: data.reduce((sum, item) => sum + item.totalAmount, 0),
    paid: data.reduce((sum, item) => sum + item.paidAmount, 0),
    remaining: data.reduce((sum, item) => sum + item.remainingAmount, 0),
    overdue: data.filter((item) => item.status === "overdue").length,
  };

  // Filter data based on search and status
  const filteredData = data.filter((item) => {
    const matchSearch =
      searchText === "" ||
      item.studentId.toLowerCase().includes(searchText.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchText.toLowerCase());
    const matchStatus = statusFilter === "all" || item.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Tình Hình Học Phí</h2>
        <p className="text-gray-600">
          Theo dõi và quản lý tình hình đóng học phí của học viên
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng học phí"
              value={stats.total}
              precision={0}
              valueStyle={{ color: "#1890ff" }}
              prefix={<DollarOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đã thu"
              value={stats.paid}
              precision={0}
              valueStyle={{ color: "#52c41a" }}
              prefix={<CheckCircleOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Còn lại"
              value={stats.remaining}
              precision={0}
              valueStyle={{ color: "#faad14" }}
              prefix={<ClockCircleOutlined />}
              suffix="đ"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quá hạn"
              value={stats.overdue}
              valueStyle={{ color: "#f5222d" }}
              prefix={<WarningOutlined />}
              suffix="học viên"
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <Space wrap>
            <Input
              placeholder="Tìm theo mã HV, tên..."
              prefix={<SearchOutlined />}
              allowClear
              style={{ width: 300 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              placeholder="Trạng thái"
              style={{ width: 180 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="paid">Đã thanh toán</Select.Option>
              <Select.Option value="partial">Thanh toán 1 phần</Select.Option>
              <Select.Option value="unpaid">Chưa thanh toán</Select.Option>
              <Select.Option value="overdue">Quá hạn</Select.Option>
            </Select>
          </Space>
          <Space wrap>
            <Button type="primary" onClick={() => handleCreateReceipt()}>
              Tạo Phiếu Thu
            </Button>
            <Button onClick={handleUpdateTuition}>Cập Nhật Học Phí</Button>
          </Space>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1400 }}
          pagination={{
            total: filteredData.length,
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} học viên`,
          }}
        />
      </Card>
    </div>
  );
};

export default TuitionStatusPage;
