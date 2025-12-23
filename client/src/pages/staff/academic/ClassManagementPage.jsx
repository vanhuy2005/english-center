import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Hook điều hướng
import {
  Plus,
  Search,
  Users,
  Calendar,
  User,
  X,
  Edit,
  BookOpen,
  Clock,
  MapPin,
  CheckCircle,
  School,
  Trash2
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal,
} from "../../../components/common"; 
import api from "../../../services/api";
import { toast } from "react-hot-toast";

// Helper: Xử lý dữ liệu an toàn
const safeExtract = (res) => {
  if (!res) return [];
  if (res.data?.data?.classes) return res.data.data.classes;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const ClassManagementPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Form states
  const [assignTeacherId, setAssignTeacherId] = useState("");
  const [createLoading, setCreateLoading] = useState(false);
  const [newClassForm, setNewClassForm] = useState({
    className: "",
    classCode: "",
    course: "",
    teacher: "",
    capacity: 20,
    startDate: "",
    endDate: "",
    schedule: "",
    room: "",
    status: "upcoming",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      await Promise.all([fetchClasses(), fetchCourses(), fetchTeachers()]);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Lỗi tải dữ liệu tổng hợp");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      setClasses(safeExtract(response));
    } catch (error) {
      console.error("Fetch classes error:", error);
      toast.error("Không thể tải danh sách lớp học");
      setClasses([]); 
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/courses");
      const data = response.data?.data || response.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Fetch courses error:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await api.get("/staffs", { params: { role: "teacher" } });
      const data = response.data?.data || response.data || [];
      setTeachers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.warn("Fetch teachers error:", error);
    }
  };

  // --- HANDLERS ---

  // FIX: Điều hướng sang trang chi tiết (ClassDetailPage)
  const handleViewDetail = (cls) => {
    if (cls && cls._id) {
        navigate(`/academic/classes/${cls._id}`);
    } else {
        toast.error("Không tìm thấy ID lớp học");
    }
  };

  const handleAssignTeacher = (cls) => {
    setSelectedClass(cls);
    setAssignTeacherId(cls.teacher?._id || "");
    setShowAssignModal(true);
  };

  const handleSubmitAssign = async () => {
    try {
      await api.put(`/classes/${selectedClass._id}`, {
        teacher: assignTeacherId,
      });
      toast.success("Phân công giáo viên thành công");
      setShowAssignModal(false);
      fetchClasses();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi phân công");
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    if (!newClassForm.className || !newClassForm.course || !newClassForm.startDate) {
      toast.error("Vui lòng điền các trường bắt buộc (*)");
      return;
    }

    try {
      setCreateLoading(true);
      const payload = {
        name: newClassForm.className,
        classCode: newClassForm.classCode,
        course: newClassForm.course,
        teacher: newClassForm.teacher || undefined,
        maxStudents: Number(newClassForm.capacity),
        startDate: newClassForm.startDate,
        endDate: newClassForm.endDate,
        room: newClassForm.room,
        status: newClassForm.status,
        schedule: newClassForm.schedule
      };

      await api.post("/classes", payload);
      toast.success("Tạo lớp học thành công");
      setShowCreateModal(false);
      
      setNewClassForm({
        className: "", classCode: "", course: "", teacher: "",
        capacity: 20, startDate: "", endDate: "", schedule: "", room: "", status: "upcoming",
      });
      
      fetchClasses();
    } catch (error) {
      console.error("Create class error:", error);
      toast.error(error.response?.data?.message || "Lỗi tạo lớp học");
    } finally {
      setCreateLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const getStatusBadge = (status) => {
    const map = {
      upcoming: { label: "Sắp mở", color: "info", icon: <Clock size={14} /> },
      ongoing: { label: "Đang học", color: "success", icon: <CheckCircle size={14} /> },
      completed: { label: "Kết thúc", color: "secondary", icon: <CheckCircle size={14} /> },
      cancelled: { label: "Đã hủy", color: "danger", icon: <X size={14} /> },
    };
    const conf = map[status] || { label: status, color: "default" };
    return (
      <Badge variant={conf.color} className="flex items-center gap-1 px-2.5 py-0.5 whitespace-nowrap">
        {conf.icon} {conf.label}
      </Badge>
    );
  };

  const filteredClasses = classes.filter(
    (cls) =>
      cls.className?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      cls.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: classes.length,
    active: classes.filter(c => c.status === 'ongoing').length,
    upcoming: classes.filter(c => c.status === 'upcoming').length
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER & STATS --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <School className="w-6 h-6 text-white" />
               </div>
               Quản Lý Lớp Học
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Danh sách và trạng thái các lớp học trong hệ thống
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="grid grid-cols-3 gap-2">
                 <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-center min-w-[80px]">
                    <span className="block text-xs text-blue-500 font-semibold uppercase mb-0.5">Tổng</span>
                    <span className="font-bold text-xl text-blue-700">{stats.total}</span>
                 </div>
                 <div className="px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-lg text-center min-w-[80px]">
                    <span className="block text-xs text-emerald-500 font-semibold uppercase mb-0.5">Active</span>
                    <span className="font-bold text-xl text-emerald-700">{stats.active}</span>
                 </div>
                 <div className="px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg text-center min-w-[80px]">
                    <span className="block text-xs text-amber-500 font-semibold uppercase mb-0.5">Sắp mở</span>
                    <span className="font-bold text-xl text-amber-700">{stats.upcoming}</span>
                 </div>
              </div>
              <Button 
                 onClick={() => setShowCreateModal(true)}
                 className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md flex items-center justify-center gap-2 h-auto py-2 px-6"
              >
                 <Plus size={18} /> Tạo lớp mới
              </Button>
          </div>
        </div>

        {/* --- SEARCH TOOLBAR --- */}
        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex gap-4">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm lớp học theo tên, mã lớp..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>
        </Card>

        {/* --- CLASS LIST GRID --- */}
        {filteredClasses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => {
              const current = cls.currentEnrollment || cls.students?.length || 0;
              const max = cls.capacity?.max || cls.capacity || 0;
              const percent = max > 0 ? (current / max) * 100 : 0;

              return (
                <Card key={cls._id} className="group border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 bg-white flex flex-col">
                  
                  {/* FIX: Đã xóa dải màu (div h-1.5) ở đây */}
                  
                  <div className="p-5 space-y-4 flex-1 flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start gap-3">
                       <div className="flex-1 min-w-0">
                          <h3 
                            className="font-bold text-lg text-[var(--color-primary)] group-hover:text-[var(--color-secondary)] transition-colors truncate cursor-pointer" 
                            title={cls.className || cls.name}
                            onClick={() => handleViewDetail(cls)}
                          >
                             {cls.className || cls.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 border border-gray-200 whitespace-nowrap">
                                {cls.classCode}
                             </span>
                             <span className="text-xs text-gray-500 truncate" title={cls.course?.name}>
                                {cls.course?.name || "Khóa học"}
                             </span>
                          </div>
                       </div>
                       <div className="shrink-0">
                          {getStatusBadge(cls.status)}
                       </div>
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-lg border border-gray-100">
                       <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                          <User size={14} className="text-[var(--color-secondary)] shrink-0" />
                          <span className="truncate" title={cls.teacher?.fullName}>
                             {cls.teacher?.fullName || "Chưa có GV"}
                          </span>
                       </div>
                       <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                          <MapPin size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">{cls.room || "Chưa xếp phòng"}</span>
                       </div>
                       <div className="col-span-2 flex items-center gap-2">
                          <Clock size={14} className="text-gray-400 shrink-0" />
                          <span className="truncate">
                            {cls.schedule && typeof cls.schedule === 'object' 
                              ? `${cls.schedule.dayOfWeek || ''} ${cls.schedule.startTime || ''}-${cls.schedule.endTime || ''}`
                              : cls.schedule || "Chưa có lịch"}
                          </span>
                       </div>
                       <div className="col-span-2 flex items-center gap-2">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <span className="text-xs">
                             {new Date(cls.startDate).toLocaleDateString("vi-VN")} - {new Date(cls.endDate).toLocaleDateString("vi-VN")}
                          </span>
                       </div>
                    </div>

                    {/* Progress */}
                    <div className="mt-auto pt-2">
                       <div className="flex justify-between text-xs mb-1.5">
                          <span className="text-gray-500">Sĩ số</span>
                          <span className="font-bold text-gray-700">{current} / {max}</span>
                       </div>
                       <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${percent >= 100 ? 'bg-rose-500' : 'bg-[var(--color-secondary)]'}`} 
                             style={{ width: `${Math.min(percent, 100)}%` }}
                          />
                       </div>
                    </div>

                    {/* Actions - FIX: Luôn hiển thị, không dùng group-hover */}
                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                       <Button 
                          variant="outline" 
                          className="flex-1 text-xs h-9 border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                          onClick={() => handleViewDetail(cls)}
                       >
                          <BookOpen size={14} className="mr-1.5" /> Chi tiết
                       </Button>
                       <Button 
                          className="flex-1 text-xs h-9 bg-white border border-[var(--color-secondary)] text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white transition-all shadow-sm"
                          onClick={() => handleAssignTeacher(cls)}
                       >
                          <Edit size={14} className="mr-1.5" /> Phân công
                       </Button>
                    </div>

                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl border border-dashed border-gray-200">
             <div className="p-4 bg-gray-50 rounded-full mb-3">
                <School size={40} className="text-gray-300" />
             </div>
             <p className="text-lg font-medium">Không tìm thấy lớp học nào</p>
             <Button variant="link" onClick={() => setShowCreateModal(true)}>Tạo lớp học mới ngay</Button>
          </div>
        )}

      </div>

      {/* --- ASSIGN TEACHER MODAL --- */}
      {showAssignModal && selectedClass && (
        <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Phân Công Giáo Viên" size="md">
           <div className="space-y-6 p-1">
              <div className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                 Đang phân công cho lớp: <strong>{selectedClass.className || selectedClass.name}</strong>
              </div>
              <div>
                 <label className="block text-sm font-bold text-gray-700 mb-2">Chọn Giáo Viên</label>
                 <Select 
                    className="w-full"
                    value={assignTeacherId}
                    onChange={(e) => setAssignTeacherId(e.target.value)}
                    options={teachers.map(t => ({ value: t._id, label: `${t.fullName} (${t.staffCode || 'TBA'})` }))}
                    placeholder="-- Chọn giáo viên --"
                 />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                 <Button variant="outline" onClick={() => setShowAssignModal(false)}>Hủy</Button>
                 <Button className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]" onClick={handleSubmitAssign} disabled={!assignTeacherId}>Xác nhận</Button>
              </div>
           </div>
        </Modal>
      )}

      {/* --- CREATE CLASS MODAL --- */}
      {showCreateModal && (
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Tạo Lớp Học Mới" size="lg">
           <form onSubmit={handleCreateClass} className="space-y-6 p-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                 <Input label="Tên lớp *" required value={newClassForm.className} onChange={e => setNewClassForm({...newClassForm, className: e.target.value})} placeholder="VD: Anh Văn Giao Tiếp K12" />
                 <Input label="Mã lớp" value={newClassForm.classCode} onChange={e => setNewClassForm({...newClassForm, classCode: e.target.value})} placeholder="Tự động tạo nếu để trống" />
                 
                 <div>
                    <label className="text-sm font-bold text-gray-700 mb-2 block">Khóa học *</label>
                    <Select 
                       className="w-full"
                       value={newClassForm.course}
                       onChange={e => setNewClassForm({...newClassForm, course: e.target.value})}
                       options={courses.map(c => ({ value: c._id, label: c.name }))}
                       placeholder="-- Chọn khóa học --"
                    />
                 </div>
                 
                 <Input label="Sức chứa *" type="number" required value={newClassForm.capacity} onChange={e => setNewClassForm({...newClassForm, capacity: e.target.value})} />
                 
                 <Input label="Ngày bắt đầu *" type="date" required value={newClassForm.startDate} onChange={e => setNewClassForm({...newClassForm, startDate: e.target.value})} />
                 <Input label="Ngày kết thúc" type="date" value={newClassForm.endDate} onChange={e => setNewClassForm({...newClassForm, endDate: e.target.value})} />
                 
                 <Input label="Lịch học" value={newClassForm.schedule} onChange={e => setNewClassForm({...newClassForm, schedule: e.target.value})} placeholder="VD: 2-4-6 (19:00 - 21:00)" />
                 <Input label="Phòng học" value={newClassForm.room} onChange={e => setNewClassForm({...newClassForm, room: e.target.value})} placeholder="VD: P.101" />
              </div>
              
              <div>
                 <label className="text-sm font-bold text-gray-700 mb-2 block">Trạng thái</label>
                 <div className="flex gap-4">
                    {['upcoming', 'ongoing', 'completed'].map(status => (
                       <label key={status} className="flex items-center gap-2 cursor-pointer">
                          <input 
                             type="radio" 
                             name="status" 
                             value={status} 
                             checked={newClassForm.status === status} 
                             onChange={e => setNewClassForm({...newClassForm, status: e.target.value})}
                             className="text-[var(--color-secondary)] focus:ring-[var(--color-secondary)]"
                          />
                          <span className="text-sm capitalize">{status === 'upcoming' ? 'Sắp mở' : status === 'ongoing' ? 'Đang học' : 'Kết thúc'}</span>
                       </label>
                    ))}
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                 <Button variant="outline" onClick={() => setShowCreateModal(false)}>Hủy bỏ</Button>
                 <Button type="submit" className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]" loading={createLoading}>Tạo lớp học</Button>
              </div>
           </form>
        </Modal>
      )}

    </div>
  );
};

export default ClassManagementPage;