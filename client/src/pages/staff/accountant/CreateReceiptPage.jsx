import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  DatePicker,
  message,
} from "antd";
import { FileTextOutlined } from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import dayjs from "dayjs";
import api from "@services/api";
import { receiptService } from "@services/receiptService";

const CreateReceiptPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchData();

    // Pre-fill student if coming from tuition status page
    if (location.state?.studentId) {
      form.setFieldsValue({
        studentId: location.state.studentId,
        date: dayjs(),
      });
    } else {
      form.setFieldsValue({
        date: dayjs(),
      });
    }
  }, [location.state, form]);

  const fetchData = async () => {
    try {
      setDataLoading(true);
      const [studentsRes, classesRes] = await Promise.all([
        api.get("/students?limit=1000"),
        api.get("/classes?limit=1000"),
      ]);

      const studentsData = studentsRes.data?.data || [];
      const classesData = classesRes.data?.data || [];

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      console.log("Creating receipt...", values);
      const response = await receiptService.createReceipt({
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      });
      console.log("Receipt created successfully:", response);
      message.success("Tạo phiếu thu thành công!");

      // Redirect based on returnToTuition flag
      if (location.state?.returnToTuition) {
        setTimeout(() => {
          navigate("/accountant/tuition-status");
        }, 1000);
      } else {
        // Reset form if staying on this page
        form.resetFields();
        form.setFieldsValue({
          date: dayjs(),
        });
      }
    } catch (error) {
      console.error("Create receipt error:", error);
      message.error(error.response?.data?.message || "Tạo phiếu thu thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <FileTextOutlined className="text-xl" />
            <span>Tạo Phiếu Thu</span>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Học viên"
            name="studentId"
            rules={[{ required: true, message: "Vui lòng chọn học viên!" }]}
          >
            <Select
              placeholder="Chọn học viên"
              showSearch
              optionFilterProp="children"
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
          </Form.Item>

          <Form.Item
            label="Lớp học"
            name="classId"
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
          >
            <Select
              placeholder="Chọn lớp học"
              showSearch
              optionFilterProp="children"
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
          </Form.Item>

          <Form.Item
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Nhập số tiền"
              min={0}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Ngày thu"
            name="date"
            rules={[{ required: true, message: "Vui lòng chọn ngày thu!" }]}
          >
            <DatePicker
              className="w-full"
              placeholder="Chọn ngày thu"
              format="DD/MM/YYYY"
            />
          </Form.Item>

          <Form.Item
            label="Phương thức thanh toán"
            name="paymentMethod"
            rules={[{ required: true, message: "Vui lòng chọn phương thức!" }]}
          >
            <Select placeholder="Chọn phương thức">
              <Select.Option value="cash">Tiền mặt</Select.Option>
              <Select.Option value="bank_transfer">Chuyển khoản</Select.Option>
              <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
              <Select.Option value="momo">MoMo</Select.Option>
              <Select.Option value="other">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3">
              <Button type="primary" htmlType="submit" loading={loading} block>
                {loading ? "Đang tạo..." : "Tạo Phiếu Thu"}
              </Button>
              <Button onClick={handleCancel} block>
                Quay Lại
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateReceiptPage;
