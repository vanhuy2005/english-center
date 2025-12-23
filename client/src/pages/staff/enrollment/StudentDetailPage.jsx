import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  BookOpen,
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  GraduationCap,
  MoreVertical,
  Edit
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

// Helper: Format tiền tệ
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
};

const StudentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'courses' | 'history'
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/staff/enrollment/students/${id}`);
      
      // Safe data extraction
      const data = response.data?.data || response.data || {};
      const studentInfo = data.student || data;
      
      setStudent(studentInfo);

      // Normalize enrollments data
      const enrolls = data.classes || studentInfo.enrolledCourses || [];
      setEnrollments(Array.isArray(enrolls) ? enrolls : []);

    } catch (error) {
      console.error("Error fetching student details:", error);
      toast.error("Không thể tải thông tin học viên");
      navigate("/enrollment/students");
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSuccess = () => {
    setIsEnrollModalOpen(false);
    fetchStudentDetail();
    toast.success("Ghi danh thành công!");
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loading size="large" /></div>;

  if (!student) return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <AlertCircle size={48} className="text-gray-400 mb-4" />
      <p className="text-lg font-medium text-gray-600">Không tìm thấy học viên</p>
      <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Quay lại</Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- Header & Actions --- */}
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-gray-500 hover:text-[var(--color-primary)] -ml-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-2" /> Quay lại danh sách
          </Button>
          <div className="flex gap-3">
            <Button variant="outline" className="border-gray-300 text-gray-700">
              <Edit size={16} className="mr-2" /> Chỉnh sửa
            </Button>
            <Button 
              className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] shadow-md"
              onClick={() => setIsEnrollModalOpen(true)}
            >
              <Plus size={18} className="mr-2" /> Ghi danh khóa mới
            </Button>
          </div>
        </div>

        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Student Profile Card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <div className="h-32 bg-[var(--color-primary)] relative">
                <div className="absolute -bottom-12 left-6 p-1 bg-white rounded-full">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center text-4xl font-bold text-[var(--color-primary)] border border-gray-200">
                    {student.fullName?.charAt(0).toUpperCase()}
                  </div>
                </div>
              </div>
              <CardContent className="pt-16 pb-6 px-6">
                <h2 className="text-2xl font-bold text-gray-900">{student.fullName}</h2>
                <div className="flex items-center gap-2 mt-1 mb-4">
                  <Badge variant="outline" className="font-mono text-xs bg-gray-50 text-gray-600 border-gray-200">
                    {student.studentCode || "NO-ID"}
                  </Badge>
                  <Badge variant={student.academicStatus === 'active' ? 'success' : 'secondary'}>
                    {student.academicStatus === 'active' ? 'Đang học' : 'Chưa ghi danh'}
                  </Badge>
                </div>

                <div className="space-y-4 mt-6 pt-6 border-t border-gray-100">
                  <InfoItem icon={Mail} label="Email" value={student.email} />
                  <InfoItem icon={Phone} label="Điện thoại" value={student.phone} />
                  <InfoItem 
                    icon={Calendar} 
                    label="Ngày sinh" 
                    value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString("vi-VN") : "---"} 
                  />
                  <InfoItem icon={MapPin} label="Địa chỉ" value={student.address} />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats (Optional) */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-blue-50/50 p-4 text-center">
                <div className="text-2xl font-bold text-blue-700">{enrollments.length}</div>
                <div className="text-xs text-blue-600 font-medium uppercase">Khóa học</div>
              </Card>
              <Card className="border-none shadow-sm bg-emerald-50/50 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-700">
                  {enrollments.filter(e => e.status === 'completed').length}
                </div>
                <div className="text-xs text-emerald-600 font-medium uppercase">Hoàn thành</div>
              </Card>
            </div>
          </div>

          {/* Right Column: Tabs & Details (8 cols) */}
          <div className="lg:col-span-8">
            <Card className="border border-gray-200 shadow-sm min-h-[600px]">
              {/* Tabs Header */}
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "overview" 
                      ? "border-[var(--color-secondary)] text-[var(--color-secondary)]" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab("courses")}
                  className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === "courses" 
                      ? "border-[var(--color-secondary)] text-[var(--color-secondary)]" 
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Lịch sử Khóa học
                </button>
              </div>

              <CardContent className="p-6">
                {/* TAB: OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-8">
                    {/* Current Courses */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                        <BookOpen size={20} className="text-[var(--color-secondary)]" />
                        Khóa học đang diễn ra
                      </h3>
                      {enrollments.filter(e => e.status === 'active' || e.status === 'ongoing').length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {enrollments.filter(e => e.status === 'active' || e.status === 'ongoing').map(course => (
                            <CourseCard key={course._id} course={course} />
                          ))}
                        </div>
                      ) : (
                        <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                          <p className="text-gray-500">Học viên chưa đăng ký khóa học nào.</p>
                          <Button 
                            variant="link" 
                            className="text-[var(--color-secondary)] mt-2"
                            onClick={() => setIsEnrollModalOpen(true)}
                          >
                            Đăng ký ngay
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Additional Info Section (Placeholder for future data like Notes, Parents info) */}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4 flex items-center gap-2">
                        <FileText size={20} className="text-gray-400" />
                        Ghi chú
                      </h3>
                      <textarea 
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all"
                        placeholder="Thêm ghi chú về học viên này..."
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* TAB: COURSES HISTORY */}
                {activeTab === "courses" && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-[var(--color-primary)] mb-4">Lịch sử ghi danh</h3>
                    {enrollments.length > 0 ? (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                            <tr>
                              <th className="px-6 py-4">Khóa học / Lớp</th>
                              <th className="px-6 py-4">Ngày bắt đầu</th>
                              <th className="px-6 py-4">Học phí</th>
                              <th className="px-6 py-4">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {enrollments.map((enrollment) => (
                              <tr key={enrollment._id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                  <p className="font-bold text-gray-800">{enrollment.course?.name || enrollment.class?.name}</p>
                                  <p className="text-xs text-gray-500 mt-0.5">{enrollment.course?.code || enrollment.class?.code}</p>
                                </td>
                                <td className="px-6 py-4 text-gray-600">
                                  {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString("vi-VN") : "---"}
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-700">
                                  {enrollment.course?.tuitionFee ? formatCurrency(enrollment.course.tuitionFee) : "---"}
                                </td>
                                <td className="px-6 py-4">
                                  <Badge variant={enrollment.status === 'active' ? 'success' : enrollment.status === 'completed' ? 'info' : 'secondary'}>
                                    {enrollment.status === 'active' ? 'Đang học' : enrollment.status === 'completed' ? 'Hoàn thành' : enrollment.status}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-8">Chưa có lịch sử khóa học.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* --- Enroll Modal --- */}
      <EnrollStudentModal 
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        student={student}
        onSuccess={handleEnrollmentSuccess}
      />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="p-2 bg-gray-50 rounded-lg text-gray-400 shrink-0">
      <Icon size={16} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      <p className="text-sm font-semibold text-gray-800 truncate" title={value}>{value || "---"}</p>
    </div>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow group">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-md">
          <GraduationCap size={18} />
        </div>
        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
          {course.course?.code || course.class?.code}
        </span>
      </div>
      <Badge variant="success" className="text-[10px] px-2 py-0.5">Đang học</Badge>
    </div>
    
    <h4 className="font-bold text-gray-800 mb-1 line-clamp-1">{course.course?.name || course.class?.name}</h4>
    
    <div className="space-y-2 mt-4 pt-4 border-t border-gray-100">
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1"><Clock size={12}/> Thời lượng</span>
        <span className="font-medium">{course.course?.duration?.hours || 0} giờ</span>
      </div>
      <div className="flex justify-between text-xs">
        <span className="text-gray-500 flex items-center gap-1"><Calendar size={12}/> Bắt đầu</span>
        <span className="font-medium">
          {course.startDate ? new Date(course.startDate).toLocaleDateString("vi-VN") : "---"}
        </span>
      </div>
    </div>
  </div>
);

// --- MODAL: Enroll Student (Reused logic, improved UI) ---
const EnrollStudentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedClassDetail, setSelectedClassDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    if (isOpen) fetchClasses();
  }, [isOpen]);

  const fetchClasses = async () => {
    try {
      setLoadingClasses(true);
      const res = await api.get("/staff/enrollment/classes", { params: { status: "upcoming,ongoing" } });
      const data = res.data?.data?.classes || res.data?.data || res.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Lỗi tải danh sách lớp");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSelectClass = (id) => {
    setSelectedClass(id);
    setSelectedClassDetail(classes.find(c => c._id === id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    try {
      setLoading(true);
      await api.post(`/staff/enrollment/students/${student._id}/enroll`, { classId: selectedClass });
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi ghi danh");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ghi Danh Lớp Mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Class Selection */}
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-3">Chọn lớp học đang mở:</label>
          
          {loadingClasses ? (
            <div className="py-8 text-center"><Loading size="small" /></div>
          ) : classes.length === 0 ? (
            <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500 text-sm">
              Không có lớp nào khả dụng.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {classes.map(cls => {
                const max = cls.capacity?.max || cls.maxStudents || 30;
                const current = cls.currentEnrollment || 0;
                const available = max - current;
                const isFull = available <= 0;

                return (
                  <div 
                    key={cls._id}
                    onClick={() => !isFull && handleSelectClass(cls._id)}
                    className={`
                      p-3 rounded-xl border cursor-pointer transition-all relative
                      ${selectedClass === cls._id 
                        ? 'border-[var(--color-secondary)] bg-[var(--color-secondary)]/5 ring-1 ring-[var(--color-secondary)]' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                      ${isFull ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}
                    `}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-gray-800 text-sm">{cls.name}</span>
                      {selectedClass === cls._id && <CheckCircle size={16} className="text-[var(--color-secondary)]" />}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">{cls.course?.name}</div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-gray-500">
                        <Clock size={12} /> {cls.schedule || "T2-T4-T6"}
                      </span>
                      <span className={`font-bold ${isFull ? 'text-red-500' : 'text-emerald-600'}`}>
                        {isFull ? "Hết chỗ" : `Còn ${available} chỗ`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Details Preview */}
        {selectedClassDetail && (
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl space-y-2">
            <h4 className="font-bold text-[var(--color-primary)] text-sm mb-2 flex items-center gap-2">
              <CheckCircle size={16} /> Xác nhận thông tin
            </h4>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-600">
              <p>Lớp: <span className="font-medium text-gray-900">{selectedClassDetail.name}</span></p>
              <p>Học phí: <span className="font-bold text-[var(--color-primary)]">{selectedClassDetail.course?.tuitionFee ? formatCurrency(selectedClassDetail.course.tuitionFee) : "---"}</span></p>
              <p>Ngày khai giảng: <span className="font-medium text-gray-900">{selectedClassDetail.startDate ? new Date(selectedClassDetail.startDate).toLocaleDateString("vi-VN") : "TBA"}</span></p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button variant="outline" onClick={onClose} type="button">Hủy bỏ</Button>
          <Button 
            type="submit" 
            className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
            disabled={!selectedClass || loading}
            loading={loading}
          >
            Xác nhận ghi danh
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentDetailPage;