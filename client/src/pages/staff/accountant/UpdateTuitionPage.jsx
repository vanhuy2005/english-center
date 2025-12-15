import React, { useState } from "react";
import { Card, Form, Input, Button, Select, InputNumber, message } from "antd";
import { DollarOutlined } from "@ant-design/icons";

const UpdateTuitionPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // TODO: API call to update tuition
      console.log("Update tuition:", values);
      message.success("Cập nhật học phí thành công!");
      form.resetFields();
    } catch (error) {
      message.error("Cập nhật học phí thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Card
        title={
          <div className="flex items-center gap-2">
            <DollarOutlined className="text-xl" />
            <span>Cập Nhật Học Phí</span>
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
            label="Số tiền"
            name="amount"
            rules={[{ required: true, message: "Vui lòng nhập số tiền!" }]}
          >
            <InputNumber
              className="w-full"
              placeholder="Nhập số tiền"
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="note">
            <Input.TextArea rows={4} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cập Nhật Học Phí
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UpdateTuitionPage;
