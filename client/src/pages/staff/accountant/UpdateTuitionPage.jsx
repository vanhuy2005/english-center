import React, { useState, useEffect } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  message,
  Spin,
} from "antd";
import { DollarOutlined } from "@ant-design/icons";
import api from "@services/api";

const UpdateTuitionPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

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

      // Extract students data
      const studentsData = studentsRes.data?.data || studentsRes.data || [];
      setStudents(Array.isArray(studentsData) ? studentsData : []);

      // Extract classes data
      const classesData =
        classesRes.data?.data ||
        classesRes.data?.classes ||
        classesRes.data ||
        [];
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Không thể tải dữ liệu!");
      setStudents([]);
      setClasses([]);
    } finally {
      setDataLoading(false);
    }
  };

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
      <Spin spinning={dataLoading}>
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
      </Spin>
    </div>
  );
};

export default UpdateTuitionPage;
