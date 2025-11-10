import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "@services/api";
import { Card, Loading, Button } from "@components/common";
import { Receipt, Save, X, Printer } from "lucide-react";

const CreateReceiptPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    studentId: searchParams.get("studentId") || "",
    classId: searchParams.get("classId") || "",
    amount: "",
    paymentMethod: "cash",
    description: "Học phí",
    note: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const loadStudents = async () => {
    try {
      const response = await api.get("/api/students");
      if (response.data.success) {
        setStudents(response.data.data.students || response.data.data);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    }
  };

  const loadClasses = async () => {
    try {
      const response = await api.get("/api/classes");
      if (response.data.success) {
        setClasses(response.data.data.classes || response.data.data);
      }
    } catch (error) {
      console.error("Error loading classes:", error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.studentId) {
      newErrors.studentId = "Vui lòng chọn học viên";
    }

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = "Vui lòng nhập số tiền hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post(
        "/api/staff/accountant/receipts",
        formData
      );

      if (response.data.success) {
        alert("Tạo phiếu thu thành công!");
        const receiptId = response.data.data.receipt._id;

        // Ask if user wants to print
        if (window.confirm("Bạn có muốn in phiếu thu không?")) {
          window.open(`/accountant/receipts/${receiptId}/print`, "_blank");
        }

        navigate("/accountant/receipts");
      }
    } catch (error) {
      console.error("Error creating receipt:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu thu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  if (loading && students.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Receipt className="text-green-600" size={32} />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Tạo Phiếu Thu Mới
            </h1>
            <p className="text-gray-600 mt-1">
              Tạo phiếu thu học phí cho học viên
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Học Viên <span className="text-red-500">*</span>
                </label>
                <select
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.studentId ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Chọn học viên --</option>
                  {students.map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.fullName} - {student.email}
                    </option>
                  ))}
                </select>
                {errors.studentId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.studentId}
                  </p>
                )}
              </div>

              {/* Class Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lớp Học
                </label>
                <select
                  name="classId"
                  value={formData.classId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Chọn lớp (tùy chọn) --</option>
                  {classes.map((cls) => (
                    <option key={cls._id} value={cls._id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số Tiền <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Nhập số tiền..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.amount ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
                )}
                {formData.amount > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    Số tiền bằng chữ: {formatCurrency(formData.amount)}
                  </p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phương Thức Thanh Toán
                </label>
                <select
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="cash">Tiền mặt</option>
                  <option value="bank_transfer">Chuyển khoản</option>
                  <option value="card">Thẻ</option>
                  <option value="momo">MoMo</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nội Dung Thu
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Ví dụ: Học phí tháng 11/2024"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Note */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi Chú
                </label>
                <textarea
                  name="note"
                  value={formData.note}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ghi chú thêm (nếu có)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? (
                    "Đang tạo..."
                  ) : (
                    <>
                      <Save size={18} className="mr-2" />
                      Tạo Phiếu Thu
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate("/accountant/receipts")}
                  className="flex items-center gap-2"
                >
                  <X size={18} />
                  Hủy
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xem Trước
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Học viên:</span>
                <span className="font-medium">
                  {formData.studentId
                    ? students.find((s) => s._id === formData.studentId)
                        ?.fullName
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Lớp:</span>
                <span className="font-medium">
                  {formData.classId
                    ? classes.find((c) => c._id === formData.classId)?.name
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-green-600">
                  {formData.amount ? formatCurrency(formData.amount) : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phương thức:</span>
                <span className="font-medium">
                  {formData.paymentMethod === "cash" && "Tiền mặt"}
                  {formData.paymentMethod === "bank_transfer" && "Chuyển khoản"}
                  {formData.paymentMethod === "card" && "Thẻ"}
                  {formData.paymentMethod === "momo" && "MoMo"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nội dung:</span>
                <span className="font-medium">
                  {formData.description || "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngày:</span>
                <span className="font-medium">
                  {new Date().toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 mb-2">
                <strong>Lưu ý:</strong>
              </p>
              <ul className="text-xs text-blue-900 space-y-1 list-disc list-inside">
                <li>Phiếu thu sẽ được tạo và lưu vào hệ thống</li>
                <li>Số phiếu thu được tự động sinh</li>
                <li>Có thể in phiếu thu sau khi tạo</li>
              </ul>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CreateReceiptPage;
