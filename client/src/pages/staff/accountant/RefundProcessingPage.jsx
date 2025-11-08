import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { Card, Button } from "@components/common";
import { RotateCcw, X } from "lucide-react";

const RefundProcessingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    amount: "",
    reason: "",
    note: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post(
        "/api/staff/accountant/payments/refund",
        formData
      );
      if (response.data.success) {
        alert("Xử lý hoàn tiền thành công!");
        navigate("/accountant/tuition");
      }
    } catch (error) {
      alert("Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <RotateCcw className="text-orange-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xử Lý Hoàn Tiền</h1>
          <p className="text-gray-600 mt-1">Hoàn trả học phí cho học viên</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form fields here - similar to CreateReceipt */}
          <Button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác Nhận Hoàn Tiền"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RefundProcessingPage;
