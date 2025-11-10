import { useState, useContext } from "react";
import { AuthContext } from "@contexts/AuthContext";
import { Card, Button, Input } from "@components/common";
import { UserCircle, Mail, Phone, Lock } from "lucide-react";
import api from "@services/api";

const AccountantProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.put("/api/auth/profile", formData);
      if (response.data.success) {
        alert("Cập nhật thông tin thành công!");
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
        <UserCircle className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Thông Tin Cá Nhân
          </h1>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin tài khoản của bạn
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar */}
        <Card>
          <div className="text-center space-y-4">
            <div className="w-32 h-32 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <UserCircle className="text-blue-600" size={64} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {user?.fullName}
              </h3>
              <p className="text-gray-600 mt-1">{user?.role}</p>
            </div>
          </div>
        </Card>

        {/* Form */}
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Họ và tên"
                icon={UserCircle}
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />
              <Input
                label="Email"
                type="email"
                icon={Mail}
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
              <Input
                label="Số điện thoại"
                icon={Phone}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Đang lưu..." : "Cập Nhật Thông Tin"}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AccountantProfilePage;
