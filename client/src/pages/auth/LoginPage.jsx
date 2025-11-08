import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useLanguage } from "@hooks";
import { Button, Input, Card, Modal } from "@components/common";

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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await login(formData.phone, formData.password);
      if (result.success) {
        // Kiểm tra nếu là lần đăng nhập đầu tiên
        if (result.user?.isFirstLogin) {
          setShowChangePassword(true);
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(result.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          newPassword,
          isFirstLogin: true,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setShowChangePassword(false);
        navigate("/dashboard");
      } else {
        setError(data.message || "Đổi mật khẩu thất bại");
      }
    } catch (err) {
      setError("Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="p-8 max-w-md mx-auto bg-white">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          Đăng nhập
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Số điện thoại"
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            placeholder="Nhập số điện thoại"
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="Nhập mật khẩu"
            required
          />

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Đăng nhập
          </Button>

          {error && (
            <div className="text-red-500 text-sm mt-2 text-center">{error}</div>
          )}
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Mật khẩu mặc định: 123456</p>
          <p className="mt-1">
            Bạn sẽ được yêu cầu đổi mật khẩu sau lần đăng nhập đầu tiên
          </p>
        </div>
      </Card>

      {/* Modal đổi mật khẩu lần đầu */}
      <Modal
        isOpen={showChangePassword}
        onClose={() => {}}
        title="Đổi mật khẩu bắt buộc"
        size="md"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <p className="text-sm text-gray-600 mb-4">
            Đây là lần đầu tiên bạn đăng nhập. Vui lòng đổi mật khẩu để tiếp
            tục.
          </p>

          <Input
            label="Mật khẩu mới"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
            required
          />

          <Input
            label="Xác nhận mật khẩu"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Nhập lại mật khẩu mới"
            required
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <Button type="submit" variant="primary" fullWidth loading={loading}>
            Đổi mật khẩu
          </Button>
        </form>
      </Modal>
    </>
  );
};

export default LoginPage;
