import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useLanguage } from "@hooks";
import { Button, Input, Card, Modal } from "@components/common";
import apiClient from "@services/api";
import { Lock, Phone } from "lucide-react"; // Thêm icon cho đẹp
import toast from "react-hot-toast";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // States cho đổi mật khẩu lần đầu
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Lưu đường dẫn dashboard tạm thời để dùng sau khi đổi pass thành công
  const [targetDashboard, setTargetDashboard] = useState("/dashboard"); 

  const getRoleDashboard = (role) => {
    const dashboards = {
      director: "/director/dashboard",
      academic: "/staff/academic/dashboard",
      accountant: "/staff/accountant/dashboard",
      enrollment: "/staff/enrollment/dashboard",
      teacher: "/teacher/dashboard",
      student: "/student/dashboard",
    };
    return dashboards[role] || "/dashboard";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(formData.phone, formData.password);
      
      if (result.success) {
        // Xác định đích đến
        const dashboardUrl = getRoleDashboard(result.user.role);

        // Nếu là lần đầu đăng nhập -> Hiện Modal, chưa chuyển trang
        if (result.user.isFirstLogin) {
          setTargetDashboard(dashboardUrl); // Lưu lại đích đến
          setShowChangePassword(true);
          setLoading(false); // Tắt loading để người dùng thao tác Modal
          return;
        }

        // Nếu không phải lần đầu -> Đi thẳng
        navigate(dashboardUrl);
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.message || "Lỗi kết nối server");
    } finally {
      // Chỉ tắt loading nếu không phải trường hợp hiện modal (đã xử lý ở trên)
      if (!showChangePassword) {
        setLoading(false);
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true); // Tận dụng biến loading cũ hoặc tạo biến changePassLoading riêng
    try {
      // Gọi API đổi mật khẩu
      // Lưu ý: Token đã được lưu vào localStorage bởi hàm login() trước đó nên apiClient tự động gửi kèm header
      const response = await apiClient.post("/auth/change-password", {
        currentPassword: formData.password, // Mật khẩu cũ (123456)
        newPassword: newPassword,
      });

      if (response.data.success) {
        toast.success("Đổi mật khẩu thành công! Đang chuyển hướng...");
        setShowChangePassword(false);
        // QUAN TRỌNG: Chuyển hướng ngay lập tức
        navigate(targetDashboard);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX LAYOUT: Sử dụng min-h-screen và flex center để form luôn ở giữa, không bị nhảy
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Đăng nhập hệ thống
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Trung tâm Anh ngữ English Center
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="py-8 px-4 shadow sm:rounded-lg sm:px-10 bg-white">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Input
                label="Số điện thoại"
                type="text" // đổi thành text để tránh lỗi input number cuộn
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Nhập số điện thoại"
                required
                startIcon={<Phone size={18} />}
              />
            </div>

            <div>
              <Input
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                required
                startIcon={<Lock size={18} />}
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Button 
                type="submit" 
                variant="primary" 
                fullWidth 
                loading={loading}
                disabled={loading}
              >
                Đăng nhập
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Ghi chú</span>
              </div>
            </div>

            <div className="mt-6 text-center text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
              <p>Mật khẩu mặc định: <span className="font-mono font-bold">123456</span></p>
              <p className="mt-1">Bạn sẽ được yêu cầu đổi mật khẩu sau lần đăng nhập đầu tiên.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal đổi mật khẩu lần đầu */}
      <Modal
        isOpen={showChangePassword}
        // Chặn đóng modal bằng cách click ra ngoài để bắt buộc đổi
        onClose={() => {}} 
        title="🔒 Đổi mật khẩu bắt buộc"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để bảo mật tài khoản.
                </p>
              </div>
            </div>
          </div>

          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            required
            disabled={loading}
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
            disabled={loading}
          />

          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              variant="primary" 
              loading={loading}
              disabled={loading}
            >
              Lưu & Tiếp tục
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default LoginPage;