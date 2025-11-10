import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage, usePagination, useDebounce } from "@hooks";
import {
  Card,
  Button,
  Table,
  Loading,
  Modal,
  Badge,
  Input,
} from "@components/common";
import { studentService } from "@services";
import { formatDate, calculateAge } from "@utils/date";
import { Search, Plus, Edit, Trash2, Eye, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

/**
 * Student List Page - Quản lý danh sách học viên
 * Features:
 * - Hiển thị danh sách học viên với pagination
 * - Tìm kiếm theo tên, mã học viên, email
 * - Lọc theo trạng thái
 * - CRUD operations
 * - View student details
 */
const StudentListPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    student: null,
  });

  const debouncedSearch = useDebounce(searchTerm, 500);

  const { currentPage, pageSize, total, totalPages, goToPage, changePageSize } =
    usePagination();

  useEffect(() => {
    fetchStudents();
  }, [currentPage, pageSize, debouncedSearch, statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        pageSize,
        search: debouncedSearch,
        status: statusFilter === "all" ? undefined : statusFilter,
      };

      const response = await studentService.getAll(params);
      setStudents(response.data?.students || []);
      // Update pagination total
      // Note: Backend should return total count
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error(t("messages.error.fetchData"));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await studentService.delete(deleteModal.student._id);
      toast.success(t("messages.success.delete"));
      setDeleteModal({ open: false, student: null });
      fetchStudents();
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error(t("messages.error.delete"));
    }
  };

  const handleViewDetails = (student) => {
    navigate(`/students/${student._id}`);
  };

  const handleEdit = (student) => {
    navigate(`/students/${student._id}/edit`);
  };

  const handleAddNew = () => {
    navigate("/students/new");
  };

  // Table columns configuration
  const columns = [
    {
      header: t("student.studentCode"),
      accessor: "studentCode",
      width: "120px",
      render: (value) => (
        <span className="font-mono text-sm font-medium">{value}</span>
      ),
    },
    {
      header: t("common.fullName"),
      accessor: "user.fullName",
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.user?.avatar || "/default-avatar.png"}
            alt={value}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="font-medium text-gray-900">{value}</p>
            <p className="text-xs text-gray-500">{row.user?.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: t("student.dateOfBirth"),
      accessor: "dateOfBirth",
      width: "120px",
      render: (value) => (
        <div>
          <p className="text-sm">{formatDate(value, "dd/MM/yyyy")}</p>
          <p className="text-xs text-gray-500">
            {calculateAge(value)} {t("common.yearsOld")}
          </p>
        </div>
      ),
    },
    {
      header: t("common.phone"),
      accessor: "contactInfo.phone",
      width: "120px",
    },
    {
      header: t("student.enrolledCourses"),
      accessor: "enrolledCourses",
      width: "100px",
      render: (value) => (
        <Badge variant="primary">{`${value?.length || 0} ${t(
          "student.courses"
        )}`}</Badge>
      ),
    },
    {
      header: t("common.status"),
      accessor: "user.status",
      width: "100px",
      render: (value) => (
        <Badge variant={value === "active" ? "success" : "danger"}>
          {t(`common.${value}`)}
        </Badge>
      ),
    },
    {
      header: t("common.actions"),
      width: "150px",
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewDetails(row)}
            title={t("common.view")}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(row)}
            title={t("common.edit")}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDeleteModal({ open: true, student: row })}
            title={t("common.delete")}
            className="text-danger hover:bg-danger/10"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {t("student.studentList")}
          </h1>
          <p className="text-gray-600 mt-1">{t("student.manageStudents")}</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddNew}
          icon={<UserPlus className="w-5 h-5" />}
        >
          {t("student.addStudent")}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <Input
              type="text"
              placeholder={t("student.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-5 h-5 text-gray-400" />}
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="input w-full"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">{t("common.allStatus")}</option>
              <option value="active">{t("common.active")}</option>
              <option value="inactive">{t("common.inactive")}</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card>
        {loading ? (
          <Loading text={t("common.loading")} />
        ) : (
          <>
            <Table
              columns={columns}
              data={students}
              pagination={{
                currentPage,
                totalPages,
                pageSize,
                total,
                onPageChange: goToPage,
                onPageSizeChange: changePageSize,
              }}
            />

            {students.length === 0 && (
              <div className="text-center py-12">
                <UserPlus className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {t("student.noStudents")}
                </p>
                <Button
                  variant="primary"
                  onClick={handleAddNew}
                  className="mt-4"
                >
                  {t("student.addFirstStudent")}
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, student: null })}
        title={t("student.deleteConfirmTitle")}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t("student.deleteConfirmMessage", {
              name: deleteModal.student?.user?.fullName,
            })}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setDeleteModal({ open: false, student: null })}
            >
              {t("common.cancel")}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t("common.delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentListPage;
