import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Loading,
  Badge, // Giả sử bạn có component Badge
} from "@components/common";
import { scheduleService, studentService } from "@services";
import { courseService } from "@services";
import { toast } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  BookOpen,
  Clock,
  DollarSign,
  GraduationCap,
  Calendar,
  LayoutGrid,
  List
} from "lucide-react";

// Helper: Format Currency
function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount || 0);
  } catch (e) {
    return amount || 0;
  }
}

// Helper: Format Duration
const formatDuration = (duration) => {
  if (!duration) return "Chưa xác định";
  if (typeof duration === 'object') {
    return `${duration.weeks || 0} tuần (${duration.hours || 0} giờ)`;
  }
  return `${duration} tuần`;
};

// Helper: Level Badge Color
const getLevelBadgeColor = (level) => {
  switch (level) {
    case 'beginner': return 'bg-emerald-100 text-emerald-700';
    case 'elementary': return 'bg-teal-100 text-teal-700';
    case 'intermediate': return 'bg-blue-100 text-blue-700';
    case 'advanced': return 'bg-purple-100 text-purple-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const CourseManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'list'
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  // Data states for modals
  const [students, setStudents] = useState([]);
  
  // Forms
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    fee: "",
    duration: "",
    level: "beginner",
    description: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    topic: "",
    description: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getAll();
      const data = res?.data?.data || res?.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll({ limit: 200 });
      const data = res?.data?.data || res?.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách học viên");
    }
  };

  // --- HANDLERS ---

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      courseCode: "",
      fee: "",
      duration: "",
      level: "beginner",
      description: "",
    });
    setShowModal(true);
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name || "",
      courseCode: course.courseCode || "",
      fee: (course.fee && course.fee.amount) || course.tuition || "",
      duration: (course.duration && course.duration.weeks) || "",
      level: course.level || "beginner",
      description: course.description || "",
    });
    setShowModal(true);
  };

  const openScheduleModal = async () => {
    if (students.length === 0) await fetchStudents();
    setScheduleForm({
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      topic: "",
      description: "",
    });
    setShowScheduleModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Tên khóa là bắt buộc");

    try {
      const payload = {
        name: form.name,
        courseCode: form.courseCode,
        fee: { amount: parseFloat(form.fee) || 0, currency: "VND" },
        duration: {
          weeks: form.duration ? parseInt(form.duration) : 0,
          hours: 0, // Có thể thêm field nhập giờ nếu cần
        },
        level: form.level,
        description: form.description,
      };

      if (editing) {
        await courseService.update(editing._id, payload);
        toast.success("Cập nhật khóa học thành công");
      } else {
        await courseService.create(payload);
        toast.success("Tạo khóa học thành công");
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu khóa học");
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa khóa "${course.name}"? Hành động này không thể hoàn tác.`)) return;
    try {
      await courseService.delete(course._id);
      toast.success("Đã xóa khóa học");
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa khóa học (có thể đang có lớp học)");
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.studentId) return toast.error("Vui lòng chọn học viên");
    if (!scheduleForm.date) return toast.error("Vui lòng chọn ngày");

    try {
      const payload = {
        student: scheduleForm.studentId,
        date: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        room: scheduleForm.room,
        topic: scheduleForm.topic,
        description: scheduleForm.description,
        type: "personal" // Flag cho backend
      };
      await scheduleService.create(payload);
      toast.success("Đã tạo lịch học riêng thành công");
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo lịch");
    }
  };

  if (loading) return <Loading fullScreen />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BookOpen className="w-6 h-6 text-white" />
               </div>
               Quản Lý Khóa Học
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Thiết lập chương trình đào tạo và tạo lịch học bổ trợ
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             {/* View Toggle */}
             <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
                <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <LayoutGrid size={18} />
                </button>
                <button 
                   onClick={() => setViewMode('list')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <List size={18} />
                </button>
             </div>

             <Button
               onClick={openScheduleModal}
               variant="outline"
               className="border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
             >
               <Calendar size={18} /> Tạo Buổi Riêng
             </Button>
             <Button
               onClick={openCreate}
               className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md flex items-center gap-2"
             >
               <Plus size={18} /> Tạo Khóa Học
             </Button>
          </div>
        </div>

        {/* --- COURSE LIST --- */}
        {courses.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
             <GraduationCap size={48} className="mx-auto text-gray-300 mb-4" />
             <p className="text-gray-500 font-medium">Chưa có khóa học nào được tạo</p>
             <Button variant="link" onClick={openCreate} className="mt-2">Tạo khóa học đầu tiên</Button>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" : "space-y-4"}>
            {courses.map((c) => {
               const feeAmount = c.fee?.amount || c.tuition || 0;
               
               if (viewMode === 'list') {
                  // LIST VIEW
                  return (
                     <div key={c._id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold ${getLevelBadgeColor(c.level)}`}>
                              {c.name.charAt(0)}
                           </div>
                           <div>
                              <h3 className="font-bold text-gray-800">{c.name}</h3>
                              <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                                 <span className="font-mono bg-gray-100 px-1.5 rounded">{c.courseCode || "NO-CODE"}</span>
                                 <span>•</span>
                                 <span>{formatDuration(c.duration)}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <div className="text-right hidden sm:block">
                              <span className="text-xs text-gray-400 block">Học phí</span>
                              <span className="font-bold text-[var(--color-primary)]">{formatCurrency(feeAmount)}</span>
                           </div>
                           <div className="flex gap-2">
                              <Button size="sm" variant="ghost" className="text-blue-600 hover:bg-blue-50" onClick={() => openEdit(c)}><Edit2 size={16} /></Button>
                              <Button size="sm" variant="ghost" className="text-red-600 hover:bg-red-50" onClick={() => handleDelete(c)}><Trash2 size={16} /></Button>
                           </div>
                        </div>
                     </div>
                  );
               }

               // GRID VIEW
               return (
                 <Card key={c._id} className="group border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white">
                   <div className="p-6 space-y-4">
                     
                     <div className="flex justify-between items-start">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getLevelBadgeColor(c.level)}`}>
                           {c.level}
                        </span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-blue-600"><Edit2 size={16}/></button>
                           <button onClick={() => handleDelete(c)} className="p-1.5 hover:bg-gray-100 rounded text-gray-500 hover:text-red-600"><Trash2 size={16}/></button>
                        </div>
                     </div>

                     <div>
                        <h3 className="text-xl font-bold text-[var(--color-primary)] mb-1 line-clamp-2 min-h-[3.5rem]">
                           {c.name}
                        </h3>
                        <p className="text-sm text-gray-500 font-mono">{c.courseCode || "Mã khóa: Trống"}</p>
                     </div>

                     <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                        <div>
                           <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><Clock size={12}/> Thời lượng</p>
                           <p className="font-medium text-gray-700">{formatDuration(c.duration)}</p>
                        </div>
                        <div>
                           <p className="text-xs text-gray-400 mb-0.5 flex items-center gap-1"><DollarSign size={12}/> Học phí</p>
                           <p className="font-bold text-[var(--color-secondary)]">{formatCurrency(feeAmount)}</p>
                        </div>
                     </div>
                     
                     {c.description && (
                        <p className="text-sm text-gray-500 line-clamp-2 bg-gray-50 p-3 rounded-lg border border-gray-100 mt-2">
                           {c.description}
                        </p>
                     )}
                   </div>
                 </Card>
               );
            })}
          </div>
        )}

      </div>

      {/* --- COURSE MODAL --- */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editing ? "Cập Nhật Khóa Học" : "Thêm Khóa Học Mới"}
          size="lg"
        >
          <div className="space-y-5 p-1">
             <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-2">
                   <Input 
                      label="Tên khóa học *" 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      placeholder="VD: English Communication A1"
                   />
                </div>
                <div>
                   <Input 
                      label="Mã khóa" 
                      value={form.courseCode} 
                      onChange={e => setForm({...form, courseCode: e.target.value})} 
                      placeholder="VD: ENG-A1"
                   />
                </div>
             </div>

             <div className="grid grid-cols-2 gap-5">
                <Input 
                   label="Học phí (VND)" 
                   type="number" 
                   value={form.fee} 
                   onChange={e => setForm({...form, fee: e.target.value})} 
                />
                <Input 
                   label="Thời lượng (tuần)" 
                   type="number" 
                   value={form.duration} 
                   onChange={e => setForm({...form, duration: e.target.value})} 
                />
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Trình độ</label>
                <Select 
                   value={form.level}
                   onChange={e => setForm({...form, level: e.target.value})}
                   options={[
                      { value: "beginner", label: "Beginner (Mới bắt đầu)" },
                      { value: "elementary", label: "Elementary (Sơ cấp)" },
                      { value: "pre-intermediate", label: "Pre-Intermediate (Tiền trung cấp)" },
                      { value: "intermediate", label: "Intermediate (Trung cấp)" },
                      { value: "upper-intermediate", label: "Upper-Intermediate (Trên trung cấp)" },
                      { value: "advanced", label: "Advanced (Nâng cao)" },
                   ]}
                />
             </div>

             <Input 
                label="Mô tả chi tiết" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                isTextArea
                rows={3}
                placeholder="Nội dung chính, mục tiêu đầu ra..."
             />

             <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
                <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]" onClick={handleSave}>
                   {editing ? "Cập nhật" : "Tạo mới"}
                </Button>
             </div>
          </div>
        </Modal>
      )}

      {/* --- PERSONAL SCHEDULE MODAL --- */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Tạo Buổi Học Riêng (1-1 / Bù)"
          size="lg"
        >
          <div className="space-y-5 p-1">
             <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm text-blue-800 mb-2">
                Tính năng này dùng để tạo lịch học riêng lẻ cho học viên (VD: học bù, học kèm 1-1). Lịch này sẽ không ảnh hưởng đến lịch chung của lớp.
             </div>

             <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Học viên <span className="text-red-500">*</span></label>
                <Select 
                   value={scheduleForm.studentId}
                   onChange={e => setScheduleForm({...scheduleForm, studentId: e.target.value})}
                   options={[
                      { value: "", label: "-- Chọn học viên --" },
                      ...students.map(s => ({ value: s._id, label: `${s.fullName} (${s.studentCode || 'N/A'})` }))
                   ]}
                   className="w-full"
                />
             </div>

             <div className="grid grid-cols-3 gap-4">
                <Input type="date" label="Ngày học" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} />
                <Input type="time" label="Bắt đầu" value={scheduleForm.startTime} onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})} />
                <Input type="time" label="Kết thúc" value={scheduleForm.endTime} onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})} />
             </div>

             <div className="grid grid-cols-2 gap-4">
                <Input label="Phòng học" value={scheduleForm.room} onChange={e => setScheduleForm({...scheduleForm, room: e.target.value})} placeholder="VD: Online, P.202" />
                <Input label="Chủ đề / Bài học" value={scheduleForm.topic} onChange={e => setScheduleForm({...scheduleForm, topic: e.target.value})} placeholder="VD: Ôn tập Unit 5" />
             </div>

             <Input label="Ghi chú thêm" value={scheduleForm.description} onChange={e => setScheduleForm({...scheduleForm, description: e.target.value})} placeholder="VD: Học bù cho ngày nghỉ..." />

             <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
                <Button variant="outline" onClick={() => setShowScheduleModal(false)}>Hủy bỏ</Button>
                <Button className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]" onClick={handleCreateSchedule}>
                   <Calendar size={18} className="mr-2"/> Lưu lịch riêng
                </Button>
             </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default CourseManagementPage;