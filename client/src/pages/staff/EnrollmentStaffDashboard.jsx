import React, { useState, useEffect, useCallback } from "react";
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
} from "../../components/common";
import { BarChart } from "../../components/charts";
import api from "../../services/api";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Clock,
  BookOpen,
  Search,
  Plus,
  CheckCircle,
  XCircle,
  TrendingUp,
  Bell,
  ChevronRight,
  LayoutDashboard,
  ShieldCheck,
  ArrowUpRight,
  MoreVertical
} from "lucide-react";

// --- HELPERS ---
const safeExtract = (res, key) => {
  if (!res) return [];
  if (res?.data?.data?.[key]) return res.data.data[key];
  if (res?.data?.data && Array.isArray(res.data.data)) return res.data.data;
  if (res?.data && Array.isArray(res.data)) return res.data;
  return [];
};

const EnrollmentStaffDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // State data
  const [dashboardData, setDashboardData] = useState({
    stats: { totalStudents: 0, newStudentsThisMonth: 0, pendingEnrollments: 0, activeClasses: 0 },
    recentStudents: [],
    pendingRequests: [],
    classesCapacity: [],
    enrollmentStats: [],
    notifications: [],
  });

  const [showNewStudentModal, setShowNewStudentModal] = useState(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => { fetchDashboardData(); }, []);

  // --- LOGIC FETCH DATA ---
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes, requestsRes, dashboardRes] = await Promise.all([
        api.get("/staff/enrollment/students", { params: { limit: 10, sort: "-createdAt" } }).catch(e => null),
        api.get("/staff/enrollment/classes", { params: { limit: 50 } }).catch(e => null),
        api.get("/staff/enrollment/requests", { params: { status: "pending", limit: 10 } }).catch(e => null),
        api.get("/staff/enrollment/dashboard").catch(e => null),
      ]);

      const students = safeExtract(studentsRes, "students");
      const classes = safeExtract(classesRes, "classes");
      const requests = safeExtract(requestsRes, "requests");
      const dashboardStats = dashboardRes?.data?.data || dashboardRes?.data || {};

      const now = new Date();
      const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const newThisMonth = students.filter(s => s.createdAt && new Date(s.createdAt) >= thisMonthStart).length;

      const classesCapacity = classes.map((c) => {
        let max = 30, current = 0;
        if (c.capacity && typeof c.capacity === 'object') { max = c.capacity.max || 30; current = c.capacity.current || 0; }
        else if (typeof c.capacity === 'number') { max = c.capacity; }
        else { max = c.maxStudents || 30; }
        
        if (typeof c.currentEnrollment === 'number') current = c.currentEnrollment;
        else if (Array.isArray(c.students)) current = c.students.length;

        return {
          _id: c._id,
          className: c.name || "Lớp chưa đặt tên",
          courseCode: c.course?.courseCode || c.courseCode || "N/A",
          currentStudents: Number(current),
          maxStudents: Number(max),
          availableSlots: Math.max(0, Number(max) - Number(current)),
          status: c.status || 'unknown',
          startDate: c.startDate,
        };
      });

      setDashboardData({
        stats: dashboardStats.stats || {
          totalStudents: studentsRes?.data?.data?.pagination?.total || students.length,
          newStudentsThisMonth: newThisMonth,
          pendingEnrollments: requests.length,
          activeClasses: classes.filter((c) => c.status === "active").length,
        },
        recentStudents: students.slice(0, 5),
        pendingRequests: requests.filter((r) => ["transfer", "pause", "resume", "course_enrollment"].includes(r.type)),
        classesCapacity: classesCapacity.sort((a, b) => b.availableSlots - a.availableSlots),
        enrollmentStats: calculateEnrollmentStatsByMonth(students),
        notifications: dashboardStats.notifications || [],
      });

    } catch (error) { toast.error("Lỗi tải dữ liệu"); } 
    finally { setLoading(false); }
  };

  const calculateEnrollmentStatsByMonth = (students) => {
    const stats = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      stats[monthKey] = 0;
    }
    students.forEach((s) => {
      if(s.createdAt) {
        const key = `${new Date(s.createdAt).getFullYear()}-${String(new Date(s.createdAt).getMonth() + 1).padStart(2, "0")}`;
        if (stats.hasOwnProperty(key)) stats[key]++;
      }
    });
    return Object.entries(stats).map(([month, count]) => ({ month, count }));
  };

  const handleNewStudentClick = () => setShowNewStudentModal(true);
  const handleProcessRequest = async (requestId, action) => {
    try {
      await api.put(`/staff/enrollment/requests/${requestId}`, { action });
      toast.success(action === "approve" ? "Đã duyệt" : "Đã từ chối");
      fetchDashboardData();
    } catch (error) { toast.error("Lỗi xử lý"); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  const { stats, recentStudents, pendingRequests, classesCapacity, enrollmentStats, notifications } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-2">
               <div className="p-1.5 bg-[var(--color-primary)] rounded-md shadow-sm">
                  <LayoutDashboard className="w-5 h-5 text-white" />
               </div>
               Dashboard Ghi Danh
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-9">Quản lý tuyển sinh và điều phối lớp học</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="border-gray-300 text-gray-600 hover:bg-gray-50"
              onClick={() => navigate("/enrollment/students/search")}
            >
              <Search size={16} className="mr-2" /> Tra cứu
            </Button>
            <Button 
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md"
              onClick={handleNewStudentClick}
            >
              <Plus size={16} className="mr-2" /> Thêm học viên
            </Button>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng học viên"
            value={stats.totalStudents}
            icon={<Users size={20} />}
            color="indigo"
            onClick={() => navigate("/enrollment/students")}
          />
          <MetricCard
            title="Học viên mới (Tháng)"
            value={stats.newStudentsThisMonth}
            icon={<UserPlus size={20} />}
            color="emerald"
            trend={stats.newStudentsThisMonth > 0 ? "+ Tăng trưởng" : "Ổn định"}
          />
          <MetricCard
            title="Yêu cầu chờ xử lý"
            value={stats.pendingEnrollments}
            icon={<Clock size={20} />}
            color="amber"
            onClick={() => navigate("/enrollment/requests")}
          />
          <MetricCard
            title="Lớp đang hoạt động"
            value={stats.activeClasses}
            icon={<BookOpen size={20} />}
            color="rose"
            onClick={() => navigate("/enrollment/classes")}
          />
        </div>

        {/* --- MAIN LAYOUT (2 Columns) --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN (8/12) --- */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Recent Activity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                <h3 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                  <UserPlus size={18} className="text-[var(--color-secondary)]" /> Học viên mới ghi danh
                </h3>
                <Button variant="ghost" size="sm" onClick={() => navigate("/enrollment/students")} className="text-xs text-blue-600 hover:bg-blue-50">
                  Xem tất cả <ChevronRight size={14} />
                </Button>
              </div>
              <div className="divide-y divide-gray-100">
                {recentStudents.length > 0 ? recentStudents.map(student => (
                  <div key={student._id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                        {student.fullName?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{student.fullName}</p>
                        <p className="text-xs text-gray-500">{student.studentCode} • {student.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                       <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-1 rounded border border-gray-200 hidden sm:inline-block">
                          {new Date(student.createdAt).toLocaleDateString("vi-VN")}
                       </span>
                       <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-xs px-3 h-8"
                          onClick={() => navigate(`/enrollment/students/${student._id}`)}
                        >
                         Chi tiết
                       </Button>
                    </div>
                  </div>
                )) : <div className="p-8 text-center text-gray-400 text-sm">Chưa có dữ liệu</div>}
              </div>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
                  <h3 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" /> Yêu cầu cần xử lý
                  </h3>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase">
                      <tr>
                        <th className="px-6 py-3">Học viên</th>
                        <th className="px-6 py-3">Loại</th>
                        <th className="px-6 py-3">Lý do</th>
                        <th className="px-6 py-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {pendingRequests.map(req => (
                        <tr key={req._id} className="hover:bg-amber-50/10 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-800">{req.student?.fullName}</td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={`
                              ${req.type === 'transfer' ? 'bg-purple-50 text-purple-700 border-purple-200' : 
                                req.type === 'pause' ? 'bg-amber-50 text-amber-700 border-amber-200' : 
                                'bg-blue-50 text-blue-700 border-blue-200'}
                            `}>
                              {req.type === 'transfer' ? 'Đổi lớp' : req.type === 'pause' ? 'Bảo lưu' : req.type}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-500 truncate max-w-[150px]" title={req.reason}>{req.reason}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => handleProcessRequest(req._id, "approve")} className="text-emerald-600 hover:bg-emerald-50 p-1 rounded"><CheckCircle size={18} /></button>
                              <button onClick={() => handleProcessRequest(req._id, "reject")} className="text-rose-600 hover:bg-rose-50 p-1 rounded"><XCircle size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Class Capacity */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gray-50/30">
                <h3 className="font-bold text-[var(--color-primary)] flex items-center gap-2">
                  <BookOpen size={18} className="text-blue-600" /> Tình trạng lớp học
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-semibold text-xs uppercase">
                    <tr>
                      <th className="px-6 py-3">Lớp học</th>
                      <th className="px-6 py-3">Mã khóa</th>
                      <th className="px-6 py-3">Sĩ số</th>
                      <th className="px-6 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {classesCapacity.slice(0, 5).map(cls => {
                      const percent = cls.maxStudents > 0 ? (cls.currentStudents / cls.maxStudents) * 100 : 0;
                      return (
                        <tr key={cls._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-[var(--color-primary)]">{cls.className}</td>
                          <td className="px-6 py-4 text-gray-500">{cls.courseCode}</td>
                          <td className="px-6 py-4 w-48">
                            <div className="flex justify-between text-xs mb-1">
                              <span>{cls.currentStudents}/{cls.maxStudents}</span>
                              <span className={cls.availableSlots <= 5 ? "text-rose-500 font-bold" : "text-emerald-600"}>{cls.availableSlots > 0 ? `Còn ${cls.availableSlots}` : "Đầy"}</span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${percent >= 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min(percent, 100)}%` }} />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={cls.status === "active" ? "success" : "secondary"} className="text-[10px] px-2 py-0.5 uppercase tracking-wide">
                              {cls.status === "active" ? "Đang dạy" : "Sắp mở"}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN (4/12) --- */}
          <div className="xl:col-span-4 space-y-8">
            
            {/* Chart Widget - FIX LAYOUT: Tăng chiều cao và bọc trong Card riêng */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
                   <TrendingUp size={18} /> Xu hướng ghi danh
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-72 w-full"> {/* Tăng chiều cao lên h-72 để tránh vỡ layout */}
                  {enrollmentStats.length > 0 ? (
                    <BarChart
                      data={{
                        labels: enrollmentStats.map(s => s.month.slice(5)),
                        datasets: [{
                          label: "Học viên",
                          data: enrollmentStats.map(s => s.count),
                          backgroundColor: "#3b9797",
                          borderRadius: 4,
                          barThickness: 24
                        }],
                      }}
                      options={{
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: { y: { display: false }, x: { grid: { display: false } } }
                      }}
                    />
                  ) : <div className="h-full flex items-center justify-center text-gray-400 text-sm">Chưa có dữ liệu</div>}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Widget - Tách riêng ra khỏi Chart */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-50">
                 <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest">Thao tác nhanh</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <QuickActionCard title="Đăng ký mới" desc="Tạo hồ sơ học viên" icon={<UserPlus size={18} className="text-emerald-600" />} bgIcon="bg-emerald-50" onClick={() => setShowNewStudentModal(true)} />
                <QuickActionCard title="Xếp lớp học" desc="Ghi danh vào lớp" icon={<BookOpen size={18} className="text-blue-600" />} bgIcon="bg-blue-50" onClick={() => setShowEnrollmentModal(true)} />
                <QuickActionCard title="Báo cáo" desc="Xuất báo cáo doanh thu" icon={<TrendingUp size={18} className="text-purple-600" />} bgIcon="bg-purple-50" onClick={() => navigate("/enrollment/reports")} />
              </CardContent>
            </Card>

            {/* Notifications Widget */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="pb-2 border-b border-gray-50 flex justify-between items-center">
                <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2"><Bell size={18} /> Thông báo</CardTitle>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Đã đọc tất cả</span>
              </CardHeader>
              <CardContent className="p-0">
                <div className="space-y-0 max-h-[300px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? notifications.map(notif => (
                    <div key={notif._id} className="flex gap-3 items-start p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0">
                      <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.isRead ? 'bg-gray-300' : 'bg-rose-500'}`} />
                      <div>
                        <p className={`text-sm leading-snug ${notif.isRead ? 'text-gray-500' : 'text-gray-800 font-semibold'}`}>{notif.title}</p>
                        <span className="text-[10px] text-gray-400 mt-1 block">{new Date(notif.createdAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                    </div>
                  )) : <p className="text-center text-gray-400 text-xs py-6">Không có thông báo mới</p>}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </div>

      {/* --- MODALS --- */}
      <NewStudentModal isOpen={showNewStudentModal} onClose={() => setShowNewStudentModal(false)} onSuccess={() => { setShowNewStudentModal(false); fetchDashboardData(); }} />
      <EnrollmentModal isOpen={showEnrollmentModal} onClose={() => { setShowEnrollmentModal(false); setSelectedStudent(null); }} student={selectedStudent} onSuccess={() => { setShowEnrollmentModal(false); fetchDashboardData(); }} />
    </div>
  );
};

// --- SUB COMPONENTS ---
const MetricCard = ({ title, value, icon, color, onClick, trend }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  return (
    <div onClick={onClick} className={`bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex justify-between items-start group relative overflow-hidden`}>
      <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-transparent to-white/50 rounded-bl-full pointer-events-none`} />
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-extrabold text-[var(--color-primary)]">{value}</h3>
        {trend && <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mt-1 inline-block">{trend}</span>}
      </div>
      <div className={`p-3 rounded-xl border ${styles[color]} group-hover:scale-110 transition-transform`}>{icon}</div>
    </div>
  );
};

const QuickActionCard = ({ title, desc, icon, bgIcon, onClick }) => (
  <div onClick={onClick} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 hover:bg-gray-50 cursor-pointer transition-all group">
    <div className={`p-2.5 rounded-lg shrink-0 ${bgIcon} group-hover:scale-105 transition-transform`}>{icon}</div>
    <div className="flex-1 min-w-0">
      <h4 className="text-sm font-bold text-gray-700 truncate group-hover:text-[var(--color-primary)]">{title}</h4>
      <p className="text-[11px] text-gray-400 truncate">{desc}</p>
    </div>
    <ArrowUpRight size={14} className="text-gray-300 group-hover:text-[var(--color-secondary)]" />
  </div>
);

// --- MODAL COMPONENTS ---
const NewStudentModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ fullName: "", email: "", phoneNumber: "", dateOfBirth: "", gender: "male", address: "" });
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    try { setLoading(true); await api.post("/staff/enrollment/students", formData); toast.success("Thêm thành công!"); onSuccess(); } 
    catch (e) { toast.error(e.response?.data?.message || "Lỗi"); } finally { setLoading(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Thêm Học Viên Mới" size="large">
      <form onSubmit={handleSubmit} className="space-y-6 p-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input label="Họ tên" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
          <Input label="Email" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          <Input label="SĐT" required value={formData.phoneNumber} onChange={e => setFormData({...formData, phoneNumber: e.target.value})} />
          <Input label="Ngày sinh" type="date" required value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
          <div><label className="text-sm font-bold text-[var(--color-primary)] mb-2 block">Giới tính</label><select className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none" value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}><option value="male">Nam</option><option value="female">Nữ</option></select></div>
          <Input label="Địa chỉ" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
        </div>
        <div className="flex gap-3 justify-end pt-6 border-t border-gray-100"><Button variant="outline" onClick={onClose}>Hủy</Button><Button className="bg-[var(--color-primary)] text-white" type="submit" loading={loading}>Lưu</Button></div>
      </form>
    </Modal>
  );
};

const EnrollmentModal = ({ isOpen, onClose, student, onSuccess }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (isOpen) api.get("/staff/enrollment/classes", { params: { status: "upcoming,ongoing" } }).then(res => setClasses(safeExtract(res, 'classes'))).catch(() => toast.error("Lỗi tải lớp")); }, [isOpen]);
  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedClass) return toast.error("Chọn lớp học");
    try { setLoading(true); await api.post(`/staff/enrollment/students/${student?._id}/enroll`, { classId: selectedClass }); toast.success("Ghi danh thành công!"); onSuccess(); } catch (e) { toast.error(e.response?.data?.message || "Lỗi"); } finally { setLoading(false); }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Xếp Lớp" size="medium">
      <form onSubmit={handleEnroll} className="space-y-6">
        {student && <div className="p-4 bg-blue-50 rounded-xl flex gap-4 items-center"><div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-blue-600">{student.fullName[0]}</div><div><p className="font-bold text-[var(--color-primary)]">{student.fullName}</p><p className="text-xs text-gray-500">{student.studentCode}</p></div></div>}
        <div><label className="text-sm font-bold text-[var(--color-primary)] mb-2 block">Chọn lớp</label><select className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} required><option value="">-- Danh sách --</option>{classes.map(c => <option key={c._id} value={c._id}>{c.name} (Trống {(c.maxStudents||30) - (c.currentStudents||0)})</option>)}</select></div>
        <div className="flex justify-end gap-3 pt-4"><Button variant="outline" onClick={onClose}>Hủy</Button><Button className="bg-[var(--color-secondary)] text-white" type="submit" loading={loading}>Xác nhận</Button></div>
      </form>
    </Modal>
  );
};

export default EnrollmentStaffDashboard;