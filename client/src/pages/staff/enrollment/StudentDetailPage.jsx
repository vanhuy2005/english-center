import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Badge } from "../../../components/common";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  BookOpen,
  Calendar,
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/students/${id}`);
      const studentData = response.data?.data || response.data;
      setStudent(studentData);

      // Fetch enrollments for this student
      try {
        const enrollResponse = await api.get(`/students/${id}/enrollments`);
        const enrollData = enrollResponse.data?.data || enrollResponse.data;
        setEnrollments(Array.isArray(enrollData) ? enrollData : []);
      } catch (error) {
        console.error("Error fetching enrollments:", error);
        setEnrollments([]);
      }
    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Không thể tải thông tin học viên");
      navigate("/enrollment/classes");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Không tìm thấy thông tin học viên</p>
        <Button onClick={() => navigate("/enrollment/classes")}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="secondary"
          size="small"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Quay lại
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Chi Tiết Học Viên</h1>
      </div>

      {/* Student Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Basic Info Card */}
        <Card className="p-6 md:col-span-2">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={48} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {student.fullName}
              </h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <FileText size={16} />
                  <span>
                    <strong>Mã học viên:</strong> {student.studentCode}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    <strong>Ngày sinh:</strong>{" "}
                    {student.dateOfBirth
                      ? new Date(student.dateOfBirth).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status Card */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Trạng thái
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 mb-1">Trạng thái học viên</p>
              <Badge
                variant={
                  student.status === "active"
                    ? "success"
                    : student.status === "inactive"
                    ? "error"
                    : "warning"
                }
              >
                {student.status === "active"
                  ? "Đang học"
                  : student.status === "inactive"
                  ? "Bị khóa"
                  : "Tạm dừng"}
              </Badge>
            </div>
            {student.enrollmentDate && (
              <div>
                <p className="text-sm text-gray-500 mb-1">Ngày đăng ký</p>
                <p className="font-medium">
                  {new Date(student.enrollmentDate).toLocaleDateString("vi-VN")}
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Contact Information */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Thông Tin Liên Hệ
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <Mail size={16} />
              Email
            </label>
            <p className="font-medium text-gray-900">
              {student.email || "N/A"}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <Phone size={16} />
              Số điện thoại
            </label>
            <p className="font-medium text-gray-900">
              {student.phone || "N/A"}
            </p>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm text-gray-500 flex items-center gap-2 mb-2">
              <MapPin size={16} />
              Địa chỉ
            </label>
            <p className="font-medium text-gray-900">
              {student.address || "N/A"}
            </p>
          </div>
        </div>
      </Card>

      {/* Enrollments */}
      {enrollments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 flex items-center gap-2">
            <BookOpen size={20} />
            Khóa Học Đã Đăng Ký
          </h3>
          <div className="space-y-3">
            {enrollments.map((enrollment) => (
              <div
                key={enrollment._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {enrollment.course?.name || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {enrollment.course?.courseCode || ""}
                  </p>
                </div>
                <Badge
                  variant={
                    enrollment.status === "active" ? "success" : "warning"
                  }
                >
                  {enrollment.status === "active"
                    ? "Đang học"
                    : "Đã hoàn thành"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Quay lại
        </Button>
      </div>
    </div>
  );
};

export default StudentDetailPage;
