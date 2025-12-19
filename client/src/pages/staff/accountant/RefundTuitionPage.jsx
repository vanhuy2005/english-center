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
  Spin,
} from "antd";
import { RollbackOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { receiptService } from "@services/receiptService";

const RefundTuitionPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get("/students?limit=1000"),
        api.get("/classes?limit=1000"),
      ]);

      const studentsData =
        studentsRes.data?.data || studentsRes.data?.rows || [];
      const classesData = classesRes.data?.data || classesRes.data || [];

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);

      console.log("Students:", studentsData.length);
      console.log("Classes:", classesData.length);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu!");
    } finally {
      setDataLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Validate that amount is a number
      if (!values.amount || values.amount <= 0) {
        message.error("Số tiền hoàn phải lớn hơn 0!");
        setLoading(false);
        return;
      }

      // Create a receipt for the refund
      const receiptData = {
        studentId: values.studentId,
        classId: values.classId,
        amount: Number(values.amount),
        paymentMethod: values.refundMethod || "cash",
        description: `Hoàn học phí - ${values.reason}`,
        note: values.note || "",
      };

      console.log("📝 Sending refund receipt data:", receiptData);

      // Save to receipt collection
      const result = await receiptService.createReceipt(receiptData);

      message.success("Hoàn học phí thành công! Phiếu hoàn đã được lưu.");
      form.resetFields();
      navigate("/accountant/dashboard");
    } catch (error) {
      console.error("Error refunding tuition:", error);
      message.error(error.response?.data?.message || "Hoàn học phí thất bại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <Spin spinning={dataLoading}>
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
              label="Hình thức hoàn trả"
              name="refundMethod"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn hình thức hoàn trả!",
                },
              ]}
            >
              <Select placeholder="Chọn hình thức hoàn trả">
                <Select.Option value="cash">Tiền mặt</Select.Option>
                <Select.Option value="bank_transfer">
                  Chuyển khoản
                </Select.Option>
                <Select.Option value="credit_card">Thẻ tín dụng</Select.Option>
                <Select.Option value="momo">MoMo</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
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
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                >
                  Xác Nhận Hoàn Học Phí
                </Button>
                <Button onClick={() => navigate("/accountant/dashboard")} block>
                  Hủy
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Card>
      </Spin>
    </div>
  );
};

export default RefundTuitionPage;
