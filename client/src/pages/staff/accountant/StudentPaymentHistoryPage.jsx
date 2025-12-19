import React, { useState, useEffect } from "react";
import {
  Table,
  Card,
  Select,
  Input,
  Button,
  DatePicker,
  Space,
  Tag,
  Spin,
  Empty,
  message,
} from "antd";
import {
  SearchOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import api from "@services/api";
import { receiptService } from "@services/receiptService";
import dayjs from "dayjs";

const StudentPaymentHistoryPage = () => {
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    studentId: "",
    classId: "",
    status: "",
    dateFrom: null,
    dateTo: null,
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [filters, pagination.current, pagination.pageSize]);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get("/students?limit=1000"),
        api.get("/classes?limit=1000"),
      ]);

      setStudents(studentsRes.data?.data || []);
      setClasses(classesRes.data?.data || []);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      message.error("Không thể tải dữ liệu!");
    }
  };

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.studentId) params.student = filters.studentId;
      if (filters.classId) params.class = filters.classId;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom)
        params.startDate = filters.dateFrom.format("YYYY-MM-DD");
      if (filters.dateTo) params.endDate = filters.dateTo.format("YYYY-MM-DD");

      const response = await receiptService.getReceipts(params);
      const data = response.receipts || response.data || [];
      const total = response.total || data.length;

      setPayments(data);
      setPagination((prev) => ({ ...prev, total }));
    } catch (error) {
      console.error("Error fetching payments:", error);
      message.error("Không thể tải lịch sử thanh toán!");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const handleReset = () => {
    setFilters({
      studentId: "",
      classId: "",
      status: "",
      dateFrom: null,
      dateTo: null,
    });
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  const getStatusTag = (status) => {
    const statusMap = {
      active: { color: "green", label: "Hoạt động" },
      voided: { color: "red", label: "Đã hủy" },
    };
    return (
      <Tag color={statusMap[status]?.color || "default"}>
        {statusMap[status]?.label || status}
      </Tag>
    );
  };

  const columns = [
    {
      title: "Mã Phiếu",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Mã HV",
      dataIndex: ["student", "studentCode"],
      key: "studentCode",
      width: 100,
      render: (text) => text || "N/A",
    },
    {
      title: "Tên Học Viên",
      dataIndex: ["student", "fullName"],
      key: "studentName",
      width: 150,
      render: (text) => text || "N/A",
    },
    {
      title: "Lớp Học",
      dataIndex: ["class", "name"],
      key: "className",
      width: 120,
      render: (text) => text || "N/A",
    },
    {
      title: "Số Tiền",
      dataIndex: "amount",
      key: "amount",
      width: 120,
      align: "right",
      render: (amount) =>
        new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(amount || 0),
    },
    {
      title: "Phương Thức",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      width: 140,
      render: (method) => {
        const methodMap = {
          cash: "Tiền mặt",
          bank_transfer: "Chuyển khoản",
          credit_card: "Thẻ tín dụng",
          momo: "Momo",
          other: "Khác",
        };
        return methodMap[method] || method;
      },
    },
    {
      title: "Trạng Thái",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Ngày Thu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 130,
      render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "N/A"),
    },
    {
      title: "Ghi Chú",
      dataIndex: "note",
      key: "note",
      width: 150,
      render: (text) => text || "-",
      ellipsis: true,
    },
  ];

  const handleExport = () => {
    try {
      const csv = [
        [
          "Mã Phiếu",
          "Mã HV",
          "Tên Học Viên",
          "Lớp Học",
          "Số Tiền",
          "Phương Thức",
          "Trạng Thái",
          "Ngày Thu",
        ],
        ...payments.map((p) => [
          p.receiptNumber || "",
          p.student?.studentCode || "",
          p.student?.fullName || "",
          p.class?.name || "",
          p.amount || 0,
          p.paymentMethod || "",
          p.status || "",
          p.createdAt ? dayjs(p.createdAt).format("DD/MM/YYYY") : "",
        ]),
      ]
        .map((r) => r.join(","))
        .join("\n");

      const element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/csv;charset=utf-8," + encodeURIComponent(csv)
      );
      element.setAttribute(
        "download",
        `LichSuThanhToan_${dayjs().format("YYYY-MM-DD")}.csv`
      );
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      message.success("Xuất file thành công!");
    } catch (error) {
      message.error("Không thể xuất file!");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    const htmlContent = `
      <html>
        <head>
          <title>Lịch sử thanh toán học viên</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3B9797; color: white; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { margin: 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>LỊCH SỬ THANH TOÁN HỌC VIÊN</h1>
            <p>English Center Management System</p>
            <p>Ngày in: ${dayjs().format("DD/MM/YYYY HH:mm")}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mã HV</th>
                <th>Tên Học Viên</th>
                <th>Lớp Học</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày Thanh Toán</th>
                <th>Ngày Hạn</th>
              </tr>
            </thead>
            <tbody>
              ${payments
                .map(
                  (p) => `
                <tr>
                  <td>${p.student?.studentCode || ""}</td>
                  <td>${p.student?.fullName || ""}</td>
                  <td>${p.class?.name || ""}</td>
                  <td>${new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(p.amount || 0)}</td>
                  <td>${p.status || ""}</td>
                  <td>${
                    p.paidDate
                      ? dayjs(p.paidDate).format("DD/MM/YYYY")
                      : "Chưa thanh"
                  }</td>
                  <td>${
                    p.dueDate ? dayjs(p.dueDate).format("DD/MM/YYYY") : "N/A"
                  }</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Lịch sử thanh toán học viên
        </h1>
        <p className="text-gray-500 mt-1">Quản lý lịch sử thanh toán học phí</p>
      </div>

      {/* Filters */}
      <Card>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Select
              placeholder="Chọn học viên"
              allowClear
              showSearch
              optionFilterProp="children"
              value={filters.studentId || undefined}
              onChange={(value) => handleFilterChange("studentId", value)}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {students.map((student) => (
                <Select.Option key={student._id} value={student._id}>
                  {student.studentCode} - {student.fullName}
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Chọn lớp học"
              allowClear
              showSearch
              optionFilterProp="children"
              value={filters.classId || undefined}
              onChange={(value) => handleFilterChange("classId", value)}
              filterOption={(input, option) =>
                (option?.children ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
            >
              {classes.map((cls) => (
                <Select.Option key={cls._id} value={cls._id}>
                  {cls.name || cls.className} ({cls.classCode})
                </Select.Option>
              ))}
            </Select>

            <Select
              placeholder="Trạng thái"
              allowClear
              value={filters.status || undefined}
              onChange={(value) => handleFilterChange("status", value)}
            >
              <Select.Option value="paid">Đã thanh toán</Select.Option>
              <Select.Option value="pending">Chờ thanh toán</Select.Option>
              <Select.Option value="overdue">Quá hạn</Select.Option>
              <Select.Option value="partial">Thanh toán một phần</Select.Option>
            </Select>

            <DatePicker
              placeholder="Từ ngày"
              format="DD/MM/YYYY"
              value={filters.dateFrom}
              onChange={(date) => handleFilterChange("dateFrom", date)}
            />

            <DatePicker
              placeholder="Đến ngày"
              format="DD/MM/YYYY"
              value={filters.dateTo}
              onChange={(date) => handleFilterChange("dateTo", date)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchPayments}
            >
              Tìm Kiếm
            </Button>
            <Button onClick={handleReset}>Reset</Button>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExport}
              disabled={payments.length === 0}
            >
              Xuất Excel
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={handlePrint}
              disabled={payments.length === 0}
            >
              In
            </Button>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Spin spinning={loading}>
          {payments.length === 0 ? (
            <Empty description="Không có dữ liệu thanh toán" />
          ) : (
            <Table
              columns={columns}
              dataSource={payments}
              rowKey="_id"
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} bản ghi`,
                pageSizeOptions: ["10", "20", "50", "100"],
              }}
              onChange={(page) =>
                setPagination({
                  ...pagination,
                  current: page.current,
                  pageSize: page.pageSize,
                })
              }
              scroll={{ x: 1200 }}
            />
          )}
        </Spin>
      </Card>
    </div>
  );
};

export default StudentPaymentHistoryPage;
