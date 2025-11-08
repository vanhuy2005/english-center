import React, { useState } from "react";
import { Modal } from "./Modal";
import { Button } from "./Button";
import { Input } from "./Input";
import { authService } from "../../services";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

export const ChangePasswordDialog = ({ open, onOpenChange }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const isFirstLogin = user?.isFirstLogin;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!isFirstLogin && !formData.currentPassword) {
      toast.error("Vui lòng nhập mật khẩu hiện tại");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(
        formData.currentPassword,
        formData.newPassword,
        isFirstLogin
      );
      toast.success("Đổi mật khẩu thành công!");
      onOpenChange(false);
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // If first login, refresh page to update user state
      if (isFirstLogin) {
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Change password error:", error);
      toast.error(error.response?.data?.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={isFirstLogin ? undefined : () => onOpenChange(false)}
      title={isFirstLogin ? "⚠️ Đổi mật khẩu lần đầu" : "Đổi mật khẩu"}
      size="md"
      closeOnOverlay={!isFirstLogin}
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600">
          {isFirstLogin
            ? "Vui lòng đổi mật khẩu mặc định để bảo mật tài khoản. Bạn không thể bỏ qua bước này."
            : "Nhập mật khẩu hiện tại và mật khẩu mới."}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isFirstLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <Input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                required={!isFirstLogin}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500 mt-1">Ít nhất 6 ký tự</p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
        </form>
      </div>
      <div className="flex justify-end space-x-2">
        {!isFirstLogin && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Hủy
          </Button>
        )}
        <Button
          type="submit"
          variant="danger"
          disabled={loading}
          onClick={handleSubmit}
        >
          {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
        </Button>
      </div>
    </Modal>
  );
};

export default ChangePasswordDialog;
