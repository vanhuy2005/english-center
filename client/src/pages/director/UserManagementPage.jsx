import React, { useState, useEffect } from "react";
import { Card, Button, Input, Table, Modal, Badge } from "@components/common";
import { useAuth } from "@hooks";
import apiClient from "@services/api";
import toast from "react-hot-toast";

const UserManagementPage = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
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
    // Basic info - required for all roles
    fullName: "",
    phone: "",
    email: "",
    role: "student",

    // Additional info - optional for all roles
    dateOfBirth: "",
    gender: "",
    address: "",

    // Student specific - optional
    contactPhone: "",
    contactEmail: "",
    contactPersonName: "",
    contactPersonRelation: "",
    contactPersonPhone: "",

    // Teacher specific - optional
    specialization: [],
    experienceYears: "",
    experienceDescription: "",
    baseSalary: "",
    department: "",

    // Staff specific - optional
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

      if (response.success) {
        setUsers(response.data.users || []);
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination?.total || 0,
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
      // Basic info - required for all roles
      fullName: "",
      phone: "",
      email: "",
      role: "student",

      // Additional info - optional for all roles
      dateOfBirth: "",
      gender: "",
      address: "",

      // Student specific - optional
      contactPhone: "",
      contactEmail: "",
      contactPersonName: "",
      contactPersonRelation: "",
      contactPersonPhone: "",

      // Teacher specific - optional
      specialization: [],
      experienceYears: "",
      experienceDescription: "",
      baseSalary: "",
      department: "",

      // Staff specific - optional
      position: "",
      staffDepartment: "",
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();

    // Validation - only check required fields
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

    // Additional validation for staff roles - they must provide complete information
    if (["enrollment", "academic", "accountant"].includes(formData.role)) {
      if (!formData.position.trim()) {
        toast.error(
          `Vui lòng nhập chức vụ cho nhân viên ${
            formData.role === "enrollment"
              ? "tuyển sinh"
              : formData.role === "academic"
              ? "học vụ"
              : "kế toán"
          }`
        );
        return;
      }
      if (!formData.staffDepartment.trim()) {
        toast.error(
          `Vui lòng nhập bộ phận cho nhân viên ${
            formData.role === "enrollment"
              ? "tuyển sinh"
              : formData.role === "academic"
              ? "học vụ"
              : "kế toán"
          }`
        );
        return;
      }
    }

    setLoading(true);
    try {
      // Prepare data based on role
      const submitData = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        role: formData.role,
        email: formData.email.trim() || undefined,
      };

      // Add optional additional data for all roles
      if (formData.dateOfBirth) submitData.dateOfBirth = formData.dateOfBirth;
      if (formData.gender) submitData.gender = formData.gender;
      if (formData.address.trim()) submitData.address = formData.address.trim();

      // Add role-specific data
      if (formData.role === "student") {
        submitData.studentData = {};

        if (formData.contactPhone.trim() || formData.contactEmail.trim()) {
          submitData.studentData.contactInfo = {};
          if (formData.contactPhone.trim())
            submitData.studentData.contactInfo.phone =
              formData.contactPhone.trim();
          if (formData.contactEmail.trim())
            submitData.studentData.contactInfo.email =
              formData.contactEmail.trim();
        }

        if (
          formData.contactPersonName.trim() ||
          formData.contactPersonRelation.trim() ||
          formData.contactPersonPhone.trim()
        ) {
          submitData.studentData.contactPerson = {
            name: formData.contactPersonName.trim() || "",
            relation: formData.contactPersonRelation.trim() || "",
            phone: formData.contactPersonPhone.trim() || "",
          };
        }
      } else if (formData.role === "teacher") {
        submitData.teacherData = {};

        if (formData.specialization.length > 0) {
          submitData.teacherData.specialization =
            formData.specialization.filter((s) => s.trim());
        }

        if (formData.experienceYears || formData.experienceDescription.trim()) {
          submitData.teacherData.experience = {
            years: parseInt(formData.experienceYears) || 0,
            description: formData.experienceDescription.trim() || "",
          };
        }

        if (formData.baseSalary) {
          submitData.teacherData.salary = {
            base: parseFloat(formData.baseSalary) || 0,
          };
        }

        if (formData.department.trim()) {
          submitData.teacherData.department = formData.department.trim();
        }
      } else if (
        ["enrollment", "academic", "accountant"].includes(formData.role)
      ) {
        submitData.staffData = {};
        // Staff must provide position and department (already validated above)
        submitData.staffData.position = formData.position.trim();
        submitData.staffData.department = formData.staffDepartment.trim();
      }

      const response = await apiClient.post("/director/users", submitData);

      if (response.success) {
        toast.success(
          `Tạo tài khoản thành công! Mật khẩu mặc định: ${
            response.data?.defaultPassword || "123456"
          }`,
          { duration: 4000 }
        );
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Tạo tài khoản thất bại";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "fullName",
      label: "Họ và tên",
      render: (value, row) => (
        <div>
          <div className="font-medium">{value}</div>
          <div className="text-sm text-gray-500">{row.phone}</div>
        </div>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (value) =>
        value || <span className="text-gray-400">Chưa có</span>,
    },
    {
      key: "role",
      label: "Vai trò",
      render: (value) => {
        const roleMap = {
          student: { label: "Học viên", color: "blue" },
          teacher: { label: "Giáo viên", color: "green" },
          enrollment: { label: "Tuyển sinh", color: "purple" },
          academic: { label: "Học vụ", color: "indigo" },
          accountant: { label: "Kế toán", color: "yellow" },
          director: { label: "Giám đốc", color: "red" },
        };
        const role = roleMap[value] || { label: value, color: "gray" };
        return <Badge color={role.color}>{role.label}</Badge>;
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value) => {
        const statusMap = {
          active: { label: "Hoạt động", color: "green" },
          inactive: { label: "Không hoạt động", color: "gray" },
          suspended: { label: "Đã khóa", color: "red" },
        };
        const status = statusMap[value] || { label: value, color: "gray" };
        return <Badge color={status.color}>{status.label}</Badge>;
      },
    },
    {
      key: "isFirstLogin",
      label: "Đổi MK",
      render: (value) => (
        <Badge color={value ? "yellow" : "green"}>
          {value ? "Chưa đổi" : "Đã đổi"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (value) => new Date(value).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Quản lý người dùng</h1>
        <Button variant="primary" onClick={() => setShowCreateModal(true)}>
          + Tạo tài khoản mới
        </Button>
      </div>

      <Card>
        <div className="p-6 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              placeholder="Tìm kiếm theo tên, SĐT, email"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />

            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
            >
              <option value="">Tất cả vai trò</option>
              <option value="student">Học viên</option>
              <option value="teacher">Giáo viên</option>
              <option value="enrollment">Tuyển sinh</option>
              <option value="academic">Học vụ</option>
              <option value="accountant">Kế toán</option>
              <option value="director">Giám đốc</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="suspended">Đã khóa</option>
            </select>

            <Button variant="secondary" onClick={fetchUsers} loading={loading}>
              Tìm kiếm
            </Button>
          </div>
        </div>

        <Table
          data={users}
          columns={columns}
          loading={loading}
          emptyMessage="Không có người dùng nào"
        />

        {/* Pagination */}
        <div className="p-6 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Hiển thị {users.length} / {pagination.total} người dùng
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={pagination.page === 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Trước
            </Button>
            <Button
              variant="secondary"
              disabled={pagination.page * pagination.limit >= pagination.total}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Sau
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal Tạo tài khoản */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo tài khoản mới"
        size="md"
      >
        <form onSubmit={handleCreateUser} className="space-y-6">
          {/* Basic Information - Required */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin cơ bản (bắt buộc)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Họ và tên *"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                required
              />

              <Input
                label="Số điện thoại *"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="10-11 chữ số"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Email (không bắt buộc)"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="Người dùng có thể cập nhật sau"
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Vai trò *
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  required
                >
                  <option value="student">Học viên</option>
                  <option value="teacher">Giáo viên</option>
                  <option value="enrollment">Nhân viên tuyển sinh</option>
                  <option value="academic">Nhân viên học vụ</option>
                  <option value="accountant">Nhân viên kế toán</option>
                  <option value="director">Giám đốc</option>
                </select>
              </div>
            </div>
          </div>

          {/* Additional Information - Optional for all roles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
              Thông tin bổ sung (không bắt buộc)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Ngày sinh"
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Giới tính
                </label>
                <select
                  className="w-full px-4 py-2 border rounded-lg"
                  value={formData.gender}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              <Input
                label="Địa chỉ"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                placeholder="Địa chỉ hiện tại"
              />
            </div>
          </div>

          {/* Student Specific Information */}
          {formData.role === "student" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Thông tin học viên (không bắt buộc)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="SĐT phụ huynh"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, contactPhone: e.target.value })
                  }
                />

                <Input
                  label="Email phụ huynh"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, contactEmail: e.target.value })
                  }
                />
              </div>

              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-700 mb-3">
                  Người liên hệ khẩn cấp
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Tên"
                    value={formData.contactPersonName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPersonName: e.target.value,
                      })
                    }
                  />

                  <Input
                    label="Quan hệ"
                    value={formData.contactPersonRelation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPersonRelation: e.target.value,
                      })
                    }
                    placeholder="Ví dụ: Bố, Mẹ, Anh, Chị..."
                  />

                  <Input
                    label="SĐT"
                    type="tel"
                    value={formData.contactPersonPhone}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contactPersonPhone: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Teacher Specific Information */}
          {formData.role === "teacher" && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Thông tin giảng viên (không bắt buộc)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Số năm kinh nghiệm"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceYears: e.target.value,
                    })
                  }
                  placeholder="0"
                  min="0"
                />

                <Input
                  label="Lương cơ bản (VNĐ)"
                  type="number"
                  value={formData.baseSalary}
                  onChange={(e) =>
                    setFormData({ ...formData, baseSalary: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                />
              </div>

              <Input
                label="Bộ phận"
                value={formData.department}
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                placeholder="Ví dụ: Khoa Anh văn, Khoa Tiếng Trung..."
              />

              <div>
                <label className="block text-sm font-medium mb-2">
                  Chuyên môn
                </label>
                <Input
                  placeholder="Nhập chuyên môn và nhấn Enter"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const value = e.target.value.trim();
                      if (value && !formData.specialization.includes(value)) {
                        setFormData({
                          ...formData,
                          specialization: [...formData.specialization, value],
                        });
                        e.target.value = "";
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                    >
                      {spec}
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            specialization: formData.specialization.filter(
                              (_, i) => i !== index
                            ),
                          })
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Mô tả kinh nghiệm
                </label>
                <textarea
                  className="w-full px-4 py-2 border rounded-lg"
                  rows="3"
                  value={formData.experienceDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      experienceDescription: e.target.value,
                    })
                  }
                  placeholder="Mô tả về kinh nghiệm giảng dạy..."
                />
              </div>
            </div>
          )}

          {/* Staff Specific Information */}
          {["enrollment", "academic", "accountant"].includes(formData.role) && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                Thông tin nhân viên (không bắt buộc)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Chức vụ"
                  value={formData.position}
                  onChange={(e) =>
                    setFormData({ ...formData, position: e.target.value })
                  }
                  placeholder="Ví dụ: Trưởng phòng, Nhân viên..."
                />

                <Input
                  label="Bộ phận"
                  value={formData.staffDepartment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      staffDepartment: e.target.value,
                    })
                  }
                  placeholder="Ví dụ: Phòng Tuyển sinh, Phòng Học vụ..."
                />
              </div>
            </div>
          )}

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Lưu ý:</strong> Mật khẩu mặc định là{" "}
              <strong>123456</strong>
              <br />
              Người dùng sẽ được yêu cầu đổi mật khẩu khi đăng nhập lần đầu.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </Button>
            <Button type="submit" variant="primary" fullWidth loading={loading}>
              Tạo tài khoản
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default UserManagementPage;
