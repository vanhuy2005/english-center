import { useState, useEffect, useRef } from "react";
import { useAuth } from "@hooks";
import { userService } from "../../services";
import apiClient from "../../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Button } from "@components/common";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Camera, 
  Save, 
  X,
  Edit2,
  ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
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
  const [originalProfile, setOriginalProfile] = useState({ ...profile });

  useEffect(() => {
    if (user) {
      const newProfile = {
        fullName: user.fullName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.profile?.address || user.address || "",
        dateOfBirth: user.profile?.dateOfBirth || user.dateOfBirth || "",
      };
      setProfile(newProfile);
      setOriginalProfile(newProfile);
    }
  }, [user]);

  // --- LOGIC HANDLERS GIỮ NGUYÊN ---
  const handleSave = async () => {
    try {
      setLoading(true);
      const changedFields = {};
      Object.keys(profile).forEach((key) => {
        if (profile[key] !== originalProfile[key]) {
          changedFields[key] = profile[key];
        }
      });

      if (Object.keys(changedFields).length === 0) {
        toast.info("Không có thay đổi nào");
        setEditing(false);
        return;
      }

      await userService.updateProfile(changedFields);
      toast.success("Cập nhật thông tin thành công!");
      setEditing(false);
      setOriginalProfile(profile);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Cập nhật thất bại!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh!");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await apiClient.post("/auth/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        if (response.data.data) {
          updateUser(response.data.data);
          toast.success("Tải ảnh đại diện thành công!");
        } else {
          toast.success("Tải ảnh đại diện thành công!");
        }
      } else {
        toast.error(response.data.message || "Tải ảnh thất bại!");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message || "Không biết lỗi";
      toast.error("Tải ảnh thất bại: " + errorMsg);
    } finally {
      setUploading(false);
    }
  };

  // --- UI COMPONENTS ---

  const InputField = ({ icon: Icon, label, value, field, type = "text", isTextArea = false }) => (
    <div className="group">
      <label className="flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] mb-2">
        <Icon className="w-4 h-4 text-[var(--color-secondary)]" />
        {label}
      </label>
      
      {editing ? (
        isTextArea ? (
          <textarea
            value={value}
            onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all outline-none bg-white text-gray-700"
            rows={3}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => setProfile({ ...profile, [field]: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all outline-none bg-white text-gray-700"
          />
        )
      ) : (
        <div className="px-4 py-2.5 rounded-lg bg-gray-50 border border-transparent text-gray-700 min-h-[42px] flex items-center">
          {value || <span className="text-gray-400 italic">Chưa cập nhật</span>}
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
             <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             Hồ Sơ Cá Nhân
          </h1>
          <p className="text-gray-500 text-sm mt-1 ml-12">
            Quản lý thông tin và bảo mật tài khoản
          </p>
        </div>
        
        {!editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Chỉnh sửa hồ sơ
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Avatar & Short Info */}
        <div className="space-y-6">
          <Card className="border-none shadow-[var(--shadow-card)] overflow-hidden">
             {/* Decorative Background */}
             <div className="h-24 bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)]"></div>
             
             <CardContent className="flex flex-col items-center -mt-12 pb-8">
                <div className="relative group">
                  {/* Avatar Circle */}
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-md bg-gray-100 flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-[var(--color-secondary)]" />
                    )}
                  </div>

                  {/* Upload Button Overlay */}
                  <div 
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`absolute bottom-1 right-1 p-2 rounded-full bg-[var(--color-secondary)] text-white shadow-lg cursor-pointer hover:bg-[var(--color-secondary-dark)] transition-colors border-2 border-white ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                    title="Đổi ảnh đại diện"
                  >
                    <Camera className="w-4 h-4" />
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>

                <div className="text-center mt-4">
                  <h2 className="text-xl font-bold text-[var(--color-primary)]">
                    {user?.fullName || "Người dùng"}
                  </h2>
                  <p className="text-sm font-medium text-[var(--color-secondary)] bg-[var(--color-secondary)]/10 px-3 py-1 rounded-full mt-2 inline-block">
                    {user?.role === "student" ? "Học viên" : user?.role === "admin" ? "Quản trị viên" : "Giáo viên"}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Mã: {user?.studentCode || user?.staffCode || user?.phone || "N/A"}
                  </p>
                </div>
             </CardContent>
          </Card>
        </div>

        {/* Right Column: Detailed Form */}
        <Card className="lg:col-span-2 border-none shadow-[var(--shadow-card)] h-fit">
          <CardHeader className="border-b border-gray-100 pb-4 mb-4">
            <CardTitle className="text-lg font-bold text-[var(--color-primary)]">Thông tin chi tiết</CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField 
                icon={User} 
                label="Họ và tên" 
                field="fullName" 
                value={profile.fullName} 
              />
              
              <InputField 
                icon={Calendar} 
                label="Ngày sinh" 
                field="dateOfBirth" 
                value={profile.dateOfBirth} 
                type="date"
              />
              
              <InputField 
                icon={Mail} 
                label="Email" 
                field="email" 
                value={profile.email} 
                type="email"
              />
              
              <InputField 
                icon={Phone} 
                label="Số điện thoại" 
                field="phone" 
                value={profile.phone} 
                type="tel"
              />
            </div>

            <div className="w-full">
              <InputField 
                icon={MapPin} 
                label="Địa chỉ thường trú" 
                field="address" 
                value={profile.address} 
                isTextArea={true}
              />
            </div>

            {/* Action Buttons Footer */}
            {editing && (
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setProfile(originalProfile);
                    setEditing(false);
                  }}
                  disabled={loading}
                  className="border-gray-300 text-gray-600 hover:bg-gray-50"
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy bỏ
                </Button>
                
                <Button 
                  onClick={handleSave} 
                  disabled={loading}
                  className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white min-w-[140px]"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Đang lưu...
                    </div>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
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