import React, { useState } from "react";
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
import { RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const RefundTuitionPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // TODO: API call to refund tuition
      console.log("Refund tuition:", values);
      message.success("Hoàn học phí thành công!");
      navigate("/accountant/dashboard");
    } catch (error) {
      message.error("Hoàn học phí thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <RollbackOutlined className="text-xl" />
            <span>Hoàn Học Phí</span>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Học viên"
            name="studentId"
            rules={[{ required: true, message: "Vui lòng chọn học viên!" }]}
          >
            <Select placeholder="Chọn học viên" showSearch>
              {/* TODO: Load students from API */}
            </Select>
          </Form.Item>

          <Form.Item
            label="Lớp học"
            name="classId"
            rules={[{ required: true, message: "Vui lòng chọn lớp học!" }]}
          >
            <Select placeholder="Chọn lớp học">
              {/* TODO: Load classes from API */}
            </Select>
          </Form.Item>

          <Form.Item
            label="Số tiền hoàn"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Nhập số tiền hoàn"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item
            label="Ngày hoàn"
            name="date"
            rules={[{ required: true, message: "Vui lòng chọn ngày hoàn!" }]}
          >
            <DatePicker className="w-full" placeholder="Chọn ngày hoàn" />
          </Form.Item>

          <Form.Item
            label="Lý do hoàn"
            name="reason"
            rules={[{ required: true, message: "Vui lòng nhập lý do!" }]}
          >
            <Select placeholder="Chọn lý do">
              <Select.Option value="dropout">Học viên nghỉ học</Select.Option>
              <Select.Option value="transfer">Chuyển lớp</Select.Option>
              <Select.Option value="overpaid">Thu thừa</Select.Option>
              <Select.Option value="other">Lý do khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú chi tiết" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3">
              <Button type="primary" htmlType="submit" loading={loading} block>
                Xác Nhận Hoàn Học Phí
              </Button>
              <Button onClick={() => navigate("/accountant/dashboard")} block>
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RefundTuitionPage;
