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
import { receiptService } from "@services/receiptService";
import { studentService } from "@services/studentService";

const CreateReceiptPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchStudents();

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

  const fetchStudents = async () => {
    try {
      const data = await studentService.getStudents({ limit: 1000 });
      setStudents(data.students || []);
    } catch (error) {
      message.error("Không thể tải danh sách học viên");
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await receiptService.createReceipt({
        ...values,
        date: values.date.format("YYYY-MM-DD"),
      });
      message.success("Tạo phiếu thu thành công!");
      navigate("/accountant/receipts");
    } catch (error) {
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
              filterOption={(input, option) =>
                option.children.toLowerCase().includes(input.toLowerCase())
              }
            >
              {students.map((student) => (
                <Select.Option key={student._id} value={student._id}>
                  {student.studentId} - {student.fullName}
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
              <Select.Option value="transfer">Chuyển khoản</Select.Option>
              <Select.Option value="card">Thẻ</Select.Option>
              <Select.Option value="momo">MoMo</Select.Option>
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
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateReceiptPage;
