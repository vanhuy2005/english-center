import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Loading,
  Badge,
  Modal,
  Input,
} from "../../../components/common";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  BookOpen,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Phone,
  Mail,
  Calendar,
  RefreshCw,
  GraduationCap
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

// Helper: Safe data extraction
const safeExtract = (res) => {
  if (!res) return [];
  if (res.data?.data?.students) return res.data.data.students;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const StudentManagementPage = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  
  // Modal states
  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, filters]); 

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/enrollment/students", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });

      const studentsList = safeExtract(response);
      setStudents(studentsList);

      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      } else {
         setPagination(prev => ({
            ...prev,
            total: studentsList.length,
            totalPages: Math.ceil(studentsList.length / prev.limit) || 1
         }));
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setFilters((prev) => ({ ...prev, search: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // --- RENDERING HELPERS ---

  const getStatusBadge = (status) => {
    const config = {
      active: { color: "success", label: "Đang học" },
      inactive: { color: "secondary", label: "Chưa ghi danh" },
      paused: { color: "warning", label: "Bảo lưu" },
      completed: { color: "info", label: "Hoàn thành" },
      dropped: { color: "danger", label: "Nghỉ học" },
    };
    const { color, label } = config[status] || { color: "secondary", label: status || "N/A" };
    return <Badge variant={color} className="whitespace-nowrap">{label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <Users className="w-6 h-6 text-white" />
               </div>
               Quản Lý Học Viên
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Danh sách và thông tin chi tiết học viên toàn hệ thống
            </p>
          </div>
          <Button 
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md flex items-center gap-2 px-5 py-2.5 whitespace-nowrap"
            onClick={() => setShowNewStudentModal(true)}
          >
            <UserPlus size={18} /> Thêm học viên
          </Button>
        </div>

        {/* --- FILTERS & SEARCH --- */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search Box */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tên, mã học viên, email..."
                  value={filters.search}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full md:w-64">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none appearance-none cursor-pointer text-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="active">Đang học</option>
                  <option value="inactive">Chưa ghi danh</option>
                  <option value="paused">Bảo lưu</option>
                  <option value="completed">Hoàn thành</option>
                  <option value="dropped">Nghỉ học</option>
                </select>
                <ChevronRight className="absolute right-3 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>

              {/* Reset Button */}
              <Button
                variant="outline"
                className="w-full md:w-auto border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[var(--color-primary)] whitespace-nowrap"
                onClick={() => {
                  setFilters({ search: "", status: "" });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <RefreshCw size={18} className="mr-2" /> Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- STUDENTS TABLE --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <Loading size="large" />
             </div>
          ) : students.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Học Viên</th>
                      <th className="px-6 py-4 whitespace-nowrap">Liên Hệ</th>
                      <th className="px-6 py-4 whitespace-nowrap">Trạng Thái</th>
                      <th className="px-6 py-4 whitespace-nowrap">Khóa Học Đang Học</th>
                      <th className="px-6 py-4 whitespace-nowrap">Ngày Tạo</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {students.map((student) => (
                      <tr key={student._id} className="hover:bg-blue-50/30 transition-colors group">
                        
                        {/* Column: Student Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold shrink-0">
                              {student.fullName?.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-[140px]">
                              <p className="font-bold text-[var(--color-primary)] truncate max-w-[180px]" title={student.fullName}>{student.fullName}</p>
                              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">
                                {student.studentCode}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Column: Contact */}
                        <td className="px-6 py-4">
                          <div className="space-y-1.5 min-w-[160px]">
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                               <Mail size={14} className="text-gray-400 shrink-0" /> 
                               <span className="truncate max-w-[150px]" title={student.email}>{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 text-xs">
                               <Phone size={14} className="text-gray-400 shrink-0" /> 
                               <span>{student.phone || "N/A"}</span>
                            </div>
                          </div>
                        </td>

                        {/* Column: Status */}
                        <td className="px-6 py-4">
                          {getStatusBadge(student.academicStatus)}
                        </td>

                        {/* Column: Courses (Updated to show Name) */}
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5 min-w-[180px] max-w-[250px]">
                            {student.enrolledCourses && student.enrolledCourses.length > 0 ? (
                              student.enrolledCourses.slice(0, 2).map((course, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                  <GraduationCap size={14} className="text-[var(--color-secondary)] shrink-0" />
                                  <span className="truncate font-medium" title={course.name}>{course.name || course.courseCode || "Khóa học"}</span>
                                </div>
                              ))
                            ) : (
                              <span className="text-gray-400 italic text-xs pl-1">Chưa có lớp</span>
                            )}
                            {student.enrolledCourses?.length > 2 && (
                               <span className="text-xs text-blue-600 font-medium pl-1 hover:underline cursor-pointer">
                                 +{student.enrolledCourses.length - 2} khóa khác
                               </span>
                            )}
                          </div>
                        </td>

                        {/* Column: Created Date */}
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                           <div className="flex items-center gap-2">
                              <Calendar size={14} />
                              {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                           </div>
                        </td>

                        {/* Column: Actions (Fix Visibility & Layout) */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Nút Ghi danh luôn hiển thị nếu trạng thái cho phép */}
                            {student.academicStatus !== "active" && (
                              <Button 
                                size="small" 
                                variant="success" 
                                className="h-8 px-3 text-xs shadow-sm hover:shadow-md transition-all whitespace-nowrap flex items-center"
                                onClick={(e) => { 
                                   e.stopPropagation(); // Ngăn sự kiện click vào row
                                   setSelectedStudent(student); 
                                   setShowEnrollModal(true); 
                                }}
                              >
                                <BookOpen size={14} className="mr-1.5" /> Ghi danh
                              </Button>
                            )}
                            <Button 
                              size="small" 
                              variant="outline" 
                              className="h-8 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] transition-all whitespace-nowrap flex items-center"
                              onClick={() => navigate(`/enrollment/students/${student._id}`)}
                            >
                              <Eye size={14} className="mr-1.5" /> Chi tiết
                            </Button>
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINATION (Improved UI) --- */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Hiển thị <span className="text-gray-900 font-bold">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> của <span className="text-gray-900 font-bold">{pagination.total}</span> học viên
                </span>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  <div className="flex items-center px-2 gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                       let p = i + 1;
                       if (pagination.totalPages > 5 && pagination.page > 3) {
                          p = pagination.page - 2 + i;
                          if (p > pagination.totalPages) p = pagination.totalPages - (4 - i);
                       }
                       if (p <= 0) p = 1;
                       
                       return (
                         <button
                           key={p}
                           onClick={() => setPagination(prev => ({ ...prev, page: p }))}
                           className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
                             pagination.page === p
                               ? "bg-[var(--color-primary)] text-white shadow-md transform scale-105"
                               : "text-gray-500 hover:bg-gray-100 hover:text-[var(--color-primary)]"
                           }`}
                         >
                           {p}
                         </button>
                       );
                    })}
                  </div>

                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
               <div className="p-6 bg-gray-50 rounded-full mb-4 shadow-inner">
                  <Search size={40} className="text-gray-300" />
               </div>
               <p className="text-lg font-bold text-gray-600">Không tìm thấy học viên nào</p>
               <p className="text-sm text-gray-400 mt-1">Hãy thử thay đổi bộ lọc hoặc thêm học viên mới</p>
               <Button 
                  className="mt-6 bg-[var(--color-primary)] text-white"
                  onClick={() => { setFilters({ search: "", status: "" }); setPagination(p => ({...p, page: 1})); }}
               >
                  Xóa bộ lọc
               </Button>
            </div>
          )}
        </Card>

      </div>

      {/* --- MODALS --- */}
      {/* QUAN TRỌNG: 
          Ở phiên bản trước, EnrollStudentModal trả về null nên modal không hiện.
          Dưới đây là Code đầy đủ cho EnrollStudentModal.
      */}
      {showNewStudentModal && (
         <NewStudentModal 
            isOpen={showNewStudentModal} 
            onClose={() => setShowNewStudentModal(false)} 
            onSuccess={() => { setShowNewStudentModal(false); fetchStudents(); }} 
         />
      )}
      
      {showEnrollModal && selectedStudent && (
         <EnrollStudentModal 
            isOpen={showEnrollModal} 
            onClose={() => { setShowEnrollModal(false); setSelectedStudent(null); }} 
            student={selectedStudent} 
            onSuccess={() => { setShowEnrollModal(false); fetchStudents(); }} 
         />
      )}

    </div>
  );
};

// --- MODAL COMPONENTS ---

const NewStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", dateOfBirth: "", gender: "male", address: "" });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      setLoading(true); 
      await api.post("/staff/enrollment/students", formData); 
      toast.success("Thêm thành công"); 
      onSuccess(); 
    } catch(e) { 
      toast.error("Lỗi"); 
    } finally { 
      setLoading(false); 
    } 
  };
  
  if(!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Học Viên" size="large">
       <form onSubmit={handleSubmit} className="space-y-6 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Input label="Họ tên" required value={formData.fullName} onChange={e=>setFormData({...formData, fullName: e.target.value})} placeholder="Nguyễn Văn A" />
             <Input label="Email" required value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
             <Input label="SĐT" required value={formData.phoneNumber} onChange={e=>setFormData({...formData, phoneNumber: e.target.value})} placeholder="09xxxxxxx" />
             <Input label="Ngày sinh" type="date" required value={formData.dateOfBirth} onChange={e=>setFormData({...formData, dateOfBirth: e.target.value})} />
             <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Giới tính</label>
                <select className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all" value={formData.gender} onChange={e=>setFormData({...formData, gender: e.target.value})}>
                   <option value="male">Nam</option>
                   <option value="female">Nữ</option>
                   <option value="other">Khác</option>
                </select>
             </div>
             <Input label="Địa chỉ" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} placeholder="Nhập địa chỉ..." />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
             <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-600">Hủy</Button>
             <Button type="submit" loading={loading} className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]">Lưu hồ sơ</Button>
          </div>
       </form>
    </Modal>
  );
};

// --- FIX LỖI MODAL GHI DANH ---
const EnrollStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { 
    if (isOpen) fetchClasses(); 
  }, [isOpen]);
  
  const fetchClasses = async () => {
    try {
      // Lấy danh sách lớp sắp mở hoặc đang mở
      const res = await api.get("/staff/enrollment/classes", { params: { status: "upcoming,ongoing" } });
      
      // Xử lý data an toàn
      let classList = [];
      if (res.data?.data?.classes) classList = res.data.data.classes;
      else if (Array.isArray(res.data?.data)) classList = res.data.data;
      else if (Array.isArray(res.data)) classList = res.data;
      
      setClasses(classList);
    } catch { 
      toast.error("Không thể tải danh sách lớp học"); 
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedClass) return toast.error("Vui lòng chọn lớp học");
    try {
      setLoading(true);
      await api.post(`/staff/enrollment/students/${student?._id}/enroll`, { classId: selectedClass });
      toast.success("Ghi danh thành công!");
      onSuccess();
    } catch (e) { 
      toast.error(e.response?.data?.message || "Lỗi ghi danh"); 
    } finally { 
      setLoading(false); 
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xếp Lớp Học Viên" size="medium">
      <form onSubmit={handleEnroll} className="space-y-6 p-2">
        {student && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-4 items-center">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 shrink-0 shadow-sm text-lg border border-blue-200">
               {student.fullName?.[0]?.toUpperCase()}
             </div>
             <div>
               <p className="font-bold text-[var(--color-primary)] text-lg">{student.fullName}</p>
               <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Mã HV: {student.studentCode}</p>
             </div>
          </div>
        )}
        <div>
          <label className="text-sm font-bold text-[var(--color-primary)] mb-2 block">Chọn lớp học phù hợp <span className="text-red-500">*</span></label>
          <div className="relative">
            <select 
              className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-secondary)] outline-none appearance-none transition-all cursor-pointer hover:bg-white text-sm" 
              value={selectedClass} 
              onChange={e => setSelectedClass(e.target.value)} 
              required
            >
              <option value="">-- Danh sách lớp đang mở --</option>
              {classes.map(c => {
                 // Tính chỗ trống an toàn
                 let max = c.capacity?.max || c.maxStudents || 30;
                 let current = c.capacity?.current || c.currentEnrollment || 0;
                 const available = max - current;
                 
                 return (
                   <option key={c._id} value={c._id} disabled={available <= 0}>
                     {c.name} ({c.course?.courseCode}) - Còn {available} chỗ
                   </option>
                 );
              })}
            </select>
            {/* Custom Arrow */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} className="border-gray-300 text-gray-600">Hủy bỏ</Button>
          <Button className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]" type="submit" loading={loading}>Xác nhận ghi danh</Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentManagementPage;