import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Modal, Badge } from "@components/common";
import { useAuth } from "@hooks";
import apiClient from "@services/api";
import toast from "react-hot-toast";
import {
  Search,
  Plus,
  Filter,
  Trash2,
  User,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  MapPin,
  GraduationCap,
  Users,
  Shield,
  CreditCard,
  FileText
} from "lucide-react";

const UserManagementPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // State logic giữ nguyên
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    role: "student",
    dateOfBirth: "",
    gender: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    contactPersonName: "",
    contactPersonRelation: "",
    contactPersonPhone: "",
    specialization: [],
    experienceYears: "",
    experienceDescription: "",
    baseSalary: "",
    department: "",
    position: "",
    staffDepartment: "",
  });

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination.page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await apiClient.get(`/director/users?${params}`);

      if (response.data.success) {
        setUsers(response.data.data.users || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      phone: "",
      email: "",
      role: "student",
      dateOfBirth: "",
      gender: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      contactPersonName: "",
      contactPersonRelation: "",
      contactPersonPhone: "",
      specialization: [],
      experienceYears: "",
      experienceDescription: "",
      baseSalary: "",
      department: "",
      position: "",
      staffDepartment: "",
    });
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      return;
    }

    try {
      const response = await apiClient.delete(`/director/users/${userId}`);
      if (response.data.success) {
        toast.success("Xóa người dùng thành công");
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Xóa người dùng thất bại");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Logic validation giữ nguyên
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return;
    }

    if (!formData.role) {
      toast.error("Vui lòng chọn vai trò");
      return;
    }

    if (["enrollment", "academic", "accountant"].includes(formData.role)) {
      if (!formData.position.trim()) {
        toast.error(`Vui lòng nhập chức vụ`);
        return;
      }
      if (!formData.staffDepartment.trim()) {
        toast.error(`Vui lòng nhập bộ phận`);
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare data based on role (Giữ nguyên logic mapping)
      const submitData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        email: formData.email.trim() || undefined,
      };

      if (formData.dateOfBirth) submitData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) submitData.gender = formData.gender;
      if (formData.address.trim()) submitData.address = formData.address.trim();

      if (formData.role === "student") {
        submitData.studentData = {};
        if (formData.contactPhone.trim() || formData.contactEmail.trim()) {
          submitData.studentData.contactInfo = {};
          if (formData.contactPhone.trim()) submitData.studentData.contactInfo.phone = formData.contactPhone.trim();
          if (formData.contactEmail.trim()) submitData.studentData.contactInfo.email = formData.contactEmail.trim();
        }
        if (formData.contactPersonName.trim() || formData.contactPersonRelation.trim() || formData.contactPersonPhone.trim()) {
          submitData.studentData.contactPerson = {
            name: formData.contactPersonName.trim() || "",
            relation: formData.contactPersonRelation.trim() || "",
            phone: formData.contactPersonPhone.trim() || "",
          };
        }
      } else if (formData.role === "teacher") {
        submitData.teacherData = {};
        if (formData.specialization.length > 0) {
          submitData.teacherData.specialization = formData.specialization.filter((s) => s.trim());
        }
        if (formData.experienceYears || formData.experienceDescription.trim()) {
          submitData.teacherData.experience = {
            years: parseInt(formData.experienceYears) || 0,
            description: formData.experienceDescription.trim() || "",
          };
        }
        if (formData.baseSalary) {
          submitData.teacherData.salary = { base: parseFloat(formData.baseSalary) || 0 };
        }
        if (formData.department.trim()) {
          submitData.teacherData.department = formData.department.trim();
        }
      } else if (["enrollment", "academic", "accountant"].includes(formData.role)) {
        submitData.staffData = {};
        submitData.staffData.position = formData.position.trim();
        submitData.staffData.department = formData.staffDepartment.trim();
      }

      const response = await apiClient.post("/director/users", submitData);

      if (response.success) {
        toast.success(`Tạo tài khoản thành công! MK mặc định: ${response.data?.defaultPassword || "123456"}`);
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Tạo tài khoản thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Helper render badge cho đẹp
  const getRoleBadgeConfig = (role) => {
    const config = {
      student: { label: "Học viên", color: "blue" },
      teacher: { label: "Giáo viên", color: "green" },
      enrollment: { label: "Tuyển sinh", color: "purple" },
      academic: { label: "Học vụ", color: "indigo" },
      accountant: { label: "Kế toán", color: "yellow" },
      director: { label: "Giám đốc", color: "red" },
    };
    return config[role] || { label: role, color: "gray" };
  };

  const columns = [
    {
      key: "fullName",
      label: "Thành viên",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
            {value.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Phone className="w-3 h-3" /> {row.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) =>
        value ? (
           <span className="text-sm text-gray-600 flex items-center gap-1.5">
             <Mail className="w-3.5 h-3.5 text-gray-400" /> {value}
           </span>
        ) : <span className="text-xs text-gray-400 italic">Chưa cập nhật</span>,
    },
    {
      key: "role",
      label: "Vai trò",
      render: (value) => {
        const { label, color } = getRoleBadgeConfig(value);
        return <Badge color={color}>{label}</Badge>;
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value) => {
        const statusMap = {
          active: { label: "Hoạt động", color: "green" },
          inactive: { label: "Tạm ngưng", color: "gray" },
          suspended: { label: "Đã khóa", color: "red" },
        };
        const status = statusMap[value] || { label: value, color: "gray" };
        return <Badge color={status.color}>{status.label}</Badge>;
      },
    },
    {
      key: "actions",
      label: "", // Empty label for action column
      render: (_, row) => (
        <div className="flex justify-end">
           <button
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Xóa người dùng"
            onClick={() => handleDeleteUser(row._id, row.fullName)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Quản Lý Người Dùng
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Quản lý tài khoản, phân quyền và thông tin thành viên hệ thống.
          </p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tạo tài khoản
        </Button>
      </div>

      {/* Filter Card */}
      <Card className="shadow-sm border-gray-200">
        <div className="p-4 md:p-5">
           <div className="flex items-center gap-2 mb-4 text-gray-700 font-medium border-b pb-2">
              <Filter className="w-4 h-4" /> Bộ lọc tìm kiếm
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                     <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <Input
                    placeholder="Tìm theo tên, SĐT, email..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 w-full" 
                    // Note: Giả sử Input component hỗ trợ className hoặc có prop icon
                  />
              </div>

              <div className="md:col-span-3">
                  <select
                    className="w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  >
                    <option value="">-- Tất cả vai trò --</option>
                    <option value="student">Học viên</option>
                    <option value="teacher">Giáo viên</option>
                    <option value="enrollment">Tuyển sinh</option>
                    <option value="academic">Học vụ</option>
                    <option value="accountant">Kế toán</option>
                    <option value="director">Giám đốc</option>
                  </select>
              </div>

              <div className="md:col-span-3">
                 <select
                    className="w-full h-[42px] px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  >
                    <option value="">-- Tất cả trạng thái --</option>
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Ngưng hoạt động</option>
                    <option value="suspended">Đã khóa</option>
                  </select>
              </div>
              
              <div className="md:col-span-1">
                 <Button 
                    variant="secondary" 
                    onClick={fetchUsers} 
                    loading={loading}
                    className="w-full justify-center h-[42px]"
                  >
                    Lọc
                 </Button>
              </div>
           </div>
        </div>
      </Card>

      {/* Table Card */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
         {/* Container có overflow-x-auto để tránh vỡ layout trên mobile */}
        <div className="overflow-x-auto">
          <Table
            data={users}
            columns={columns}
            loading={loading}
            emptyMessage={
                <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                    <User className="w-12 h-12 text-gray-300 mb-2" />
                    <p>Không tìm thấy người dùng nào</p>
                </div>
            }
          />
        </div>

        {/* Pagination Styled */}
        <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
          <div className="text-sm text-gray-500 font-medium">
            Hiển thị {users.length} / {pagination.total} kết quả
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
              className="px-4"
            >
              Trước
            </Button>
            <span className="px-3 py-1.5 bg-white border rounded text-sm font-medium text-gray-700 min-w-[40px] text-center">
                {pagination.page}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
               className="px-4"
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Tạo tài khoản - Refined Layout */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm Người Dùng Mới"
        size="lg" // Dùng size lớn hơn chút để thoải mái
      >
        <form onSubmit={handleCreateUser} className="space-y-6 p-1">
          
          {/* Section 1: Thông tin bắt buộc */}
          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
             <div className="flex items-center gap-2 text-blue-800 font-semibold border-b border-blue-200 pb-2">
                <Shield className="w-4 h-4" /> Thông Tin Tài Khoản (Bắt buộc)
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên *"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                  placeholder="Nguyễn Văn A"
                />
                
                <div className="flex flex-col gap-1">
                   <label className="text-sm font-medium text-gray-700">Số điện thoại *</label>
                   <div className="relative">
                        <Phone className="absolute top-2.5 left-3 w-4 h-4 text-gray-400" />
                        <input
                           type="tel"
                           className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                           value={formData.phone}
                           onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                           required
                           placeholder="0912..."
                        />
                   </div>
                </div>
                
                 <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Vai trò *</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        required
                    >
                        <option value="student">Học viên</option>
                        <option value="teacher">Giáo viên</option>
                        <option value="enrollment">Nhân viên Tuyển sinh</option>
                        <option value="academic">Nhân viên Học vụ</option>
                        <option value="accountant">Nhân viên Kế toán</option>
                        <option value="director">Giám đốc</option>
                    </select>
                </div>
                
                 <Input
                  label="Email (Tùy chọn)"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@email.com"
                />
             </div>
          </div>

          {/* Section 2: Thông tin cá nhân */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
                <User className="w-4 h-4" /> Thông tin cá nhân
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <Input
                  label="Ngày sinh"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                />
                
                <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Giới tính</label>
                    <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none bg-white"
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    >
                        <option value="">-- Chọn --</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                    </select>
                </div>

                <div className="md:col-span-1">
                    <Input
                      label="Địa chỉ"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Số nhà, đường..."
                    />
                </div>
            </div>
          </div>

          {/* Section 3: Dynamic Fields based on Role */}
          {formData.role === "student" && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
               <div className="flex items-center gap-2 text-gray-800 font-semibold border-b border-gray-200 pb-2">
                  <Users className="w-4 h-4" /> Thông tin phụ huynh / Liên hệ
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input label="SĐT Phụ huynh" value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
                  <Input label="Email Phụ huynh" value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
               </div>
               
               <div className="pt-2">
                   <p className="text-xs font-semibold text-gray-500 mb-2 uppercase">Người liên hệ khẩn cấp</p>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Input placeholder="Họ tên" value={formData.contactPersonName} onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })} />
                      <Input placeholder="Quan hệ (Bố/Mẹ...)" value={formData.contactPersonRelation} onChange={(e) => setFormData({ ...formData, contactPersonRelation: e.target.value })} />
                      <Input placeholder="Số điện thoại" value={formData.contactPersonPhone} onChange={(e) => setFormData({ ...formData, contactPersonPhone: e.target.value })} />
                   </div>
               </div>
            </div>
          )}

          {formData.role === "teacher" && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-200 space-y-4">
               <div className="flex items-center gap-2 text-green-800 font-semibold border-b border-green-200 pb-2">
                  <GraduationCap className="w-4 h-4" /> Thông tin Giảng viên
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="Số năm kinh nghiệm" 
                    type="number" 
                    value={formData.experienceYears} 
                    onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} 
                  />
                  <Input 
                    label="Lương cơ bản (VND)" 
                    type="number" 
                    value={formData.baseSalary} 
                    onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })} 
                  />
                  <Input 
                    label="Bộ phận / Khoa" 
                    value={formData.department} 
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })} 
                  />
                  
                  <div className="flex flex-col gap-1">
                      <label className="text-sm font-medium text-gray-700">Chuyên môn</label>
                      <Input
                        placeholder="Nhập & Enter để thêm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const val = e.target.value.trim();
                            if (val && !formData.specialization.includes(val)) {
                              setFormData({ ...formData, specialization: [...formData.specialization, val] });
                              e.target.value = "";
                            }
                          }
                        }}
                      />
                      <div className="flex flex-wrap gap-1 mt-2">
                        {formData.specialization.map((spec, idx) => (
                           <span key={idx} className="bg-white border border-green-200 text-green-700 px-2 py-0.5 rounded text-xs flex items-center gap-1">
                              {spec} <button type="button" onClick={() => setFormData({...formData, specialization: formData.specialization.filter((_, i) => i !== idx)})} className="hover:text-red-500">×</button>
                           </span>
                        ))}
                      </div>
                  </div>
               </div>
               <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">Mô tả kinh nghiệm</label>
                    <textarea 
                        className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-none" 
                        rows="2"
                        value={formData.experienceDescription}
                        onChange={(e) => setFormData({...formData, experienceDescription: e.target.value})}
                    ></textarea>
               </div>
            </div>
          )}

          {["enrollment", "academic", "accountant"].includes(formData.role) && (
             <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 space-y-4">
                <div className="flex items-center gap-2 text-purple-800 font-semibold border-b border-purple-200 pb-2">
                    <Briefcase className="w-4 h-4" /> Thông tin Nhân viên
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Chức vụ *" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} placeholder="VD: Trưởng phòng" />
                    <Input label="Bộ phận *" value={formData.staffDepartment} onChange={(e) => setFormData({ ...formData, staffDepartment: e.target.value })} placeholder="VD: Phòng Đào tạo" />
                </div>
             </div>
          )}

          {/* Footer Action */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowCreateModal(false)}
            >
              Hủy bỏ
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Xác nhận tạo
            </Button>
          </div>
          
          <p className="text-xs text-center text-gray-400 mt-2">
             * Mật khẩu mặc định là <strong>123456</strong>. Người dùng cần đổi khi đăng nhập.
          </p>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;