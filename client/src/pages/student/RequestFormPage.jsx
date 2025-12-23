import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button, Loading, Input } from "@components/common"; // Giả sử Input component đã có sẵn
import { studentService } from "@services";
import toast from "react-hot-toast";
import { useAuth } from "@hooks";
import {
  Home,
  BookOpen,
  RefreshCw,
  PauseCircle,
  FileText,
  Info,
  ArrowLeft,
  CheckCircle,
  Send
} from "lucide-react";

/**
 * RequestFormPage - Student submits requests (leave, makeup, transfer)
 */
const RequestFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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

  // --- LOGIC FETCH DATA (GIỮ NGUYÊN) ---
  const fetchStudentClasses = async () => {
    try {
      setLoading(true);
      const courses = await studentService.getMyCourses();

      const data = Array.isArray(courses)
        ? courses
        : courses?.data || courses?.data?.data || [];

      const mapped = (data || []).map((cls) => ({
        _id: cls._id || cls.id,
        className:
          cls.className || cls.name || cls.courseName || cls.className || "Lớp học chưa đặt tên",
        classCode:
          cls.classCode || cls.code || cls.courseCode || cls.classCode || "",
      }));

      setClasses(mapped);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Không thể tải danh sách lớp học. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLERS (GIỮ NGUYÊN) ---
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

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      
      const studentId = user?._id || user?.id || user?.studentId || null;
      const isValidObjectId = (id) => /^[a-fA-F0-9]{24}$/.test(String(id));

      const payload = {
        student: studentId,
        type: formData.type,
        reason: formData.reason,
        documents: [],
        priority: "normal",
      };

      if (formData.classId && isValidObjectId(formData.classId)) {
        payload.class = formData.classId;
      }

      if (formData.type === "leave" || formData.type === "makeup") {
        payload.startDate = formData.date;
      }

      if (formData.note && formData.note.trim())
        payload.documents = [{ name: "note", url: formData.note }];

      const response = await studentService.createRequest(payload);

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
        errorMsg = error.response?.data?.message || "Dữ liệu không hợp lệ.";
      } else if (error.response?.status === 401) {
        errorMsg = "Phiên đăng nhập đã hết.";
      } else if (error.response?.status === 500) {
        errorMsg = "Lỗi server.";
      }
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // UI Configurations
  const requestTypes = [
    { value: "leave", label: "Xin nghỉ học", icon: Home, activeColor: "border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 text-[var(--color-secondary)]" },
    { value: "makeup", label: "Xin học bù", icon: BookOpen, activeColor: "border-blue-500 bg-blue-50 text-blue-600" },
    { value: "transfer", label: "Chuyển lớp", icon: RefreshCw, activeColor: "border-purple-500 bg-purple-50 text-purple-600" },
    { value: "pause", label: "Bảo lưu", icon: PauseCircle, activeColor: "border-amber-500 bg-amber-50 text-amber-600" },
    { value: "withdrawal", label: "Khác", icon: FileText, activeColor: "border-gray-500 bg-gray-50 text-gray-600" },
  ];

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gray-50/30 font-sans p-6 md:p-8">
      {/* Container Full Width */}
      <div className="w-full mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/requests")}
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 hover:bg-gray-50 text-gray-500 hover:text-[var(--color-primary)] transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
                <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <Send size={20} className="text-white" />
                </div>
                Gửi Yêu Cầu Mới
              </h1>
              <p className="text-gray-500 text-sm mt-1 ml-12">
                Điền thông tin để gửi yêu cầu đến phòng đào tạo
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Card cũng full width */}
          <div className="bg-white rounded-xl shadow-[var(--shadow-card)] border border-gray-100 p-6 md:p-8 space-y-8 w-full">
            
            {/* Request Type Selection */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-4">
                Chọn loại yêu cầu <span className="text-[var(--color-danger)]">*</span>
              </label>
              {/* Grid tự động điều chỉnh số cột theo độ rộng màn hình */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {requestTypes.map((type) => {
                  const IconComponent = type.icon;
                  const isActive = formData.type === type.value;
                  return (
                    <div
                      key={type.value}
                      onClick={() => handleInputChange("type", type.value)}
                      className={`
                        relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 flex flex-col items-center justify-center gap-3 h-32
                        hover:shadow-md hover:border-gray-300
                        ${isActive ? type.activeColor + " shadow-sm border-current" : "border-gray-100 bg-white text-gray-500"}
                      `}
                    >
                      {isActive && (
                        <div className="absolute top-2 right-2 text-current">
                          <CheckCircle size={16} fill="currentColor" className="text-white" />
                        </div>
                      )}
                      <IconComponent size={28} strokeWidth={isActive ? 2 : 1.5} />
                      <span className="text-sm font-semibold text-center">{type.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Class Selection */}
              <div>
                <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                  Lớp học áp dụng <span className="text-[var(--color-danger)]">*</span>
                </label>
                <select
                  value={formData.classId}
                  onChange={(e) => handleInputChange("classId", e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none transition-all"
                  required
                >
                  <option value="">-- Chọn lớp học --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.className} ({cls.classCode})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selection (Conditional) */}
              {(formData.type === "leave" || formData.type === "makeup") && (
                <div>
                  <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                    {formData.type === "leave" ? "Ngày nghỉ dự kiến" : "Ngày học bù mong muốn"}{" "}
                    <span className="text-[var(--color-danger)]">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => handleInputChange("date", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none transition-all"
                    required
                  />
                </div>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                Lý do chi tiết <span className="text-[var(--color-danger)]">*</span>
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange("reason", e.target.value)}
                placeholder="Vui lòng trình bày rõ lý do (tối thiểu 10 ký tự)..."
                rows="5"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none transition-all resize-none"
                required
              />
              <div className="flex justify-end mt-1">
                 <span className={`text-xs ${formData.reason.length < 10 ? 'text-[var(--color-danger)]' : 'text-gray-400'}`}>
                    {formData.reason.length} ký tự (min 10)
                 </span>
              </div>
            </div>

            {/* Additional Note */}
            <div>
              <label className="block text-sm font-bold text-[var(--color-primary)] mb-2">
                Ghi chú thêm (Tùy chọn)
              </label>
              <input
                value={formData.note}
                onChange={(e) => handleInputChange("note", e.target.value)}
                placeholder="Thông tin liên lạc khác hoặc ghi chú bổ sung..."
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] outline-none transition-all"
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex gap-4 items-start">
              <div className="p-2 bg-white rounded-full shadow-sm text-blue-600 shrink-0">
                 <Info size={24} />
              </div>
              <div className="text-sm text-blue-800 space-y-2">
                <p className="font-bold text-base mb-1">Quy định gửi yêu cầu:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-blue-700/90 leading-relaxed">
                  <li>Xin nghỉ học: Gửi trước ít nhất <strong>24h</strong>.</li>
                  <li>Học bù: Đăng ký trước <strong>48h</strong> để sắp xếp phòng.</li>
                  <li>Chuyển lớp/Bảo lưu: Thời gian xử lý từ <strong>3-5 ngày làm việc</strong>.</li>
                  <li>Kết quả sẽ được thông báo qua Email và mục Thông báo trên hệ thống.</li>
                </ul>
              </div>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate("/requests")}
                className="px-8 py-3 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                disabled={submitting}
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-3 rounded-lg bg-[var(--color-primary)] text-white font-bold hover:bg-[var(--color-primary-light)] transition-colors shadow-lg shadow-blue-900/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Đang gửi...
                  </>
                ) : (
                  <>
                    <Send size={18} />
                    Gửi yêu cầu
                  </>
                )}
              </button>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestFormPage;