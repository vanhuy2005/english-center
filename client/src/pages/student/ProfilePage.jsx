import { useState, useEffect, useRef } from "react";
import { useAuth } from "@hooks";
import { userService } from "../../services";
import apiClient from "../../services/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Button } from "@components/common";
import { User, Mail, Phone, MapPin, Calendar, Edit } from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.profile?.address || "",
        dateOfBirth: user.profile?.dateOfBirth || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setLoading(true);
      await userService.updateProfile(profile);
      toast.success("Cập nhật thông tin thành công!");
      setEditing(false);
    } catch (error) {
      toast.error("Cập nhật thất bại!");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh!');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await apiClient.post('/students/me/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setUser({ ...user, avatar: response.data.data.avatar });
        toast.success('Tải ảnh đại diện thành công!');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Tải ảnh thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thông Tin Cá Nhân
          </h1>
          <p className="text-gray-600">Quản lý thông tin cá nhân của bạn</p>
        </div>
        <Button
          onClick={() => (editing ? handleSave() : setEditing(true))}
          disabled={loading}
        >
          {editing ? (loading ? "Đang lưu..." : "Lưu") : "Chỉnh sửa"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="border-t-4 border-t-blue-500">
          <CardHeader>
            <CardTitle>Ảnh đại diện</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center mb-4 overflow-hidden">
              {user?.avatar ? (
                <img src={`http://localhost:5000${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-blue-600" />
              )}
            </div>
            <p className="text-lg font-semibold text-gray-900">
              {user?.fullName}
            </p>
            <p className="text-sm text-gray-500">
              {user?.studentCode || "N/A"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              className="mt-4"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Đang tải...' : 'Tải ảnh lên'}
            </Button>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="lg:col-span-2 border-t-4 border-t-red-500">
          <CardHeader>
            <CardTitle>Thông tin cơ bản</CardTitle>
            <CardDescription>
              {editing
                ? "Chỉnh sửa thông tin cá nhân"
                : "Thông tin cá nhân của bạn"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center text-gray-600">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Họ và tên</span>
              </div>
              {editing ? (
                <input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) =>
                    setProfile({ ...profile, fullName: e.target.value })
                  }
                  className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="md:col-span-2 text-gray-900 font-medium">
                  {profile.fullName}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center text-gray-600">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Email</span>
              </div>
              {editing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="md:col-span-2 text-gray-900">{profile.email}</p>
              )}
            </div>

            {/* Phone */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center text-gray-600">
                <Phone className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Số điện thoại</span>
              </div>
              {editing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="md:col-span-2 text-gray-900">{profile.phone}</p>
              )}
            </div>

            {/* Date of Birth */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center text-gray-600">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Ngày sinh</span>
              </div>
              {editing ? (
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) =>
                    setProfile({ ...profile, dateOfBirth: e.target.value })
                  }
                  className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              ) : (
                <p className="md:col-span-2 text-gray-900">
                  {profile.dateOfBirth || "Chưa cập nhật"}
                </p>
              )}
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="flex items-center text-gray-600">
                <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">Địa chỉ</span>
              </div>
              {editing ? (
                <textarea
                  value={profile.address}
                  onChange={(e) =>
                    setProfile({ ...profile, address: e.target.value })
                  }
                  className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              ) : (
                <p className="md:col-span-2 text-gray-900">
                  {profile.address || "Chưa cập nhật"}
                </p>
              )}
            </div>

            {editing && (
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  Hủy
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
