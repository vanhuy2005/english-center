import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@hooks";
import { Button, Input, Card } from "@components/common";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    const result = await register(formData);

    if (result.success) {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-primary text-center mb-6">
        Đăng ký
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          required
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />

        <Input
          label="Số điện thoại"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />

        <Input
          label="Mật khẩu"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
        />

        <Input
          label="Xác nhận mật khẩu"
          type="password"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
          required
        />

        <Button type="submit" variant="primary" fullWidth loading={loading}>
          Đăng ký
        </Button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => navigate("/login")}
          className="text-sm text-primary hover:underline"
        >
          Đã có tài khoản? Đăng nhập
        </button>
      </div>
    </Card>
  );
};

export default RegisterPage;
