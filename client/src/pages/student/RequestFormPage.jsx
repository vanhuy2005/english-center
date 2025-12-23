import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Loading, Input } from "@components/common";
import { requestService, classService, studentService } from "@services";
import toast from "react-hot-toast";
import { useAuth, useLanguage } from "@hooks";
import {
  Home,
  BookOpen,
  RefreshCw,
  PauseCircle,
  FileText,
  Info,
} from "lucide-react";

/**
 * RequestFormPage - Student submits requests (leave, makeup, transfer)
 */
const RequestFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    type: "leave",
    classId: "",
    date: new Date().toISOString().split("T")[0],
    reason: "",
    note: "",
  });

  useEffect(() => {
    fetchStudentClasses();
  }, []);

  const fetchStudentClasses = async () => {
    try {
      // Load enrolled classes from API
      try {
        const courses = await studentService.getMyCourses();

        // `getMyCourses` may return either an array or an axios response
        const data = Array.isArray(courses)
          ? courses
          : courses?.data || courses?.data?.data || [];

        const mapped = (data || []).map((cls) => ({
          _id: cls._id || cls.id,
          className:
            cls.className || cls.name || cls.courseName || cls.className,
          classCode:
            cls.classCode || cls.code || cls.courseCode || cls.classCode || "",
        }));

        if (mapped.length) {
          setClasses(mapped);
          return;
        }
      } catch (err) {
        console.warn(
          "Failed to load classes from API, falling back to mock",
          err
        );
      }

      // Fallback mock classes for development
      setClasses([
        { _id: "1", className: "English Basic A1", classCode: "EB-A1-001" },
        { _id: "2", className: "IELTS 6.5", classCode: "IELTS-65-002" },
      ]);
    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.type) {
      toast.error("Vui lòng chọn loại yêu cầu");
      return false;
    }
    if (!formData.classId) {
      toast.error("Vui lòng chọn lớp học");
      return false;
    }
    if (!formData.reason || formData.reason.trim().length < 10) {
      toast.error("Lý do phải có ít nhất 10 ký tự");
      return false;
    }
    if (formData.type === "leave" && !formData.date) {
      toast.error("Vui lòng chọn ngày nghỉ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      console.log("📤 Submitting request:", formData);

      // Build payload matching server expectations
      const studentId = user?._id || user?.id || user?.studentId || null;

      const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));

      const payload = {
        student: studentId,
        type: formData.type,
        reason: formData.reason,
        documents: [],
        priority: "normal",
      };

      // Only include `class` when it looks like a valid ObjectId
      if (formData.classId && isValidObjectId(formData.classId)) {
        payload.class = formData.classId;
      } else if (formData.classId) {
        console.warn(
          "Omitting invalid classId from payload:",
          formData.classId
        );
      }

      if (formData.type === "leave" || formData.type === "makeup") {
        payload.startDate = formData.date;
      }

      if (formData.note && formData.note.trim())
        payload.documents = [{ name: "note", url: formData.note }];

      console.log("📨 Payload to send (server-style):", payload);

      // Use student-scoped endpoint which uses authenticated user
      const response = await studentService.createRequest(payload);
      console.log("✓ Response:", response);

      if (response.data?.success || response.success) {
        toast.success("Đã gửi yêu cầu thành công!");
        setTimeout(() => {
          navigate("/requests");
        }, 500);
      } else {
        throw new Error(response.data?.message || "Không thể gửi yêu cầu");
      }
    } catch (error) {
      console.error("❌ Error submitting request:", error);

      let errorMsg = "Không thể gửi yêu cầu";

      if (error.response?.status === 400) {
        errorMsg =
          error.response?.data?.message ||
          "Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.";
      } else if (error.response?.status === 401) {
        errorMsg = "Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.";
      } else if (error.response?.status === 500) {
        errorMsg = "Lỗi server. Vui lòng thử lại sau.";
      } else if (error.message === "Network Error") {
        errorMsg = "Lỗi kết nối. Vui lòng kiểm tra internet.";
      }

      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const requestTypes = [
    { value: "leave", label: "Xin nghỉ học", icon: Home, color: "blue" },
    { value: "makeup", label: "Xin học bù", icon: BookOpen, color: "green" },
    {
      value: "transfer",
      label: "Chuyển lớp",
      icon: RefreshCw,
      color: "purple",
    },
    {
      value: "pause",
      label: "Tạm dừng học",
      icon: PauseCircle,
      color: "orange",
    },
    { value: "withdrawal", label: "Khác", icon: FileText, color: "gray" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gửi yêu cầu mới</h1>
        <p className="text-gray-600">
          Điền đầy đủ thông tin để gửi yêu cầu đến bộ phận học vụ
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Loại yêu cầu <span className="text-danger">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {requestTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange("type", type.value)}
                    className={`p-4 border-2 rounded-lg transition-all text-center hover:shadow-md ${
                      formData.type === type.value
                        ? "border-primary bg-primary bg-opacity-10 shadow-sm"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent
                      className={`mx-auto mb-2 ${
                        formData.type === type.value
                          ? "text-primary"
                          : "text-gray-400"
                      }`}
                      size={32}
                      strokeWidth={1.5}
                    />
                    <div className="font-medium text-sm text-gray-700">
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp học <span className="text-danger">*</span>
            </label>
            <select
              value={formData.classId}
              onChange={(e) => handleInputChange("classId", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="">Chọn lớp học</option>
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.className} ({cls.classCode})
                </option>
              ))}
            </select>
          </div>

          {/* Date (for leave/makeup) */}
          {(formData.type === "leave" || formData.type === "makeup") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.type === "leave" ? "Ngày nghỉ" : "Ngày học bù"}{" "}
                <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange("date", e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lý do <span className="text-danger">*</span>
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleInputChange("reason", e.target.value)}
              placeholder="Nhập lý do chi tiết (tối thiểu 10 ký tự)"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <p className="mt-1 text-xs text-gray-500">
              Số ký tự: {formData.reason.length}/500
            </p>
          </div>

          {/* Additional Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú thêm
            </label>
            <textarea
              value={formData.note}
              onChange={(e) => handleInputChange("note", e.target.value)}
              placeholder="Thông tin bổ sung (không bắt buộc)"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-2">Lưu ý:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Yêu cầu nghỉ học cần được gửi trước ít nhất 24 giờ</li>
                  <li>Yêu cầu học bù cần đăng ký trước 48 giờ</li>
                  <li>
                    Yêu cầu chuyển lớp sẽ được xử lý trong 3-5 ngày làm việc
                  </li>
                  <li>Bạn sẽ nhận được thông báo khi yêu cầu được xử lý</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/requests")}
            >
              Hủy
            </Button>
            <Button type="submit" loading={submitting}>
              📤 Gửi yêu cầu
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default RequestFormPage;
