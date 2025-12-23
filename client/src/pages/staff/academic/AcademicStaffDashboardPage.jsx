import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@contexts/AuthContext";
import api from "@services/api";
import { Card, CardContent, CardHeader, CardTitle, Loading, Badge, Button } from "@components/common";
import {
  BookOpen,
  Users,
  CheckCircle,
  TrendingUp,
  Calendar,
  AlertCircle,
  FileText,
  BarChart3,
  LayoutDashboard,
  Clock,
  ArrowUpRight,
  ChevronRight,
  GraduationCap
} from "lucide-react";
import { BarChart, LineChart, DoughnutChart } from "@components/charts";

const AcademicStaffDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClasses: 0,
      totalStudents: 0,
      attendanceRate: 0,
      averageGrade: 0,
      pendingRequests: 0,
      lowAttendanceStudents: 0,
    },
    recentClasses: [],
    pendingRequests: [],
    attendanceTrend: { labels: [], datasets: [] },
    gradeDistribution: { labels: [], datasets: [] },
    classPerformance: { labels: [], datasets: [] },
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/academic/dashboard");
      if (response.data.success) {
        setDashboardData(response.data.data);
      }
    } catch (error) {
      console.error("Error loading dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;
  }

  const {
    stats,
    recentClasses,
    pendingRequests,
    attendanceTrend,
    gradeDistribution,
    classPerformance,
  } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <LayoutDashboard className="w-6 h-6 text-white" />
               </div>
               Tổng Quan Học Vụ
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Chào mừng, <span className="font-semibold text-gray-800">{user?.profile?.fullName || "Nhân viên học vụ"}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
             <Calendar size={16} />
             <span>{new Date().toLocaleDateString("vi-VN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Tổng Số Lớp"
            value={stats.totalClasses}
            icon={<BookOpen size={24} />}
            color="indigo"
            subText="Đang quản lý"
          />
          <MetricCard
            title="Tổng Học Viên"
            value={stats.totalStudents}
            icon={<Users size={24} />}
            color="emerald"
            subText="Đang học tập"
          />
          <MetricCard
            title="Tỉ Lệ Chuyên Cần"
            value={`${stats.attendanceRate}%`}
            icon={<CheckCircle size={24} />}
            color="purple"
            subText="Trung bình toàn trung tâm"
          />
          <MetricCard
            title="Điểm Trung Bình"
            value={stats.averageGrade.toFixed(1)}
            icon={<TrendingUp size={24} />}
            color="orange"
            subText="Kết quả học tập chung"
          />
        </div>

        {/* --- MAIN LAYOUT --- */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN (8/12) */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-4">
                  <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-600" /> Xu Hướng Chuyên Cần
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                   <div className="h-64 w-full">
                      <LineChart data={attendanceTrend} options={{ maintainAspectRatio: false }} />
                   </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-50 pb-4">
                  <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
                    <BarChart3 size={18} className="text-[var(--color-secondary)]" /> Phân Bố Điểm Số
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                   <div className="h-64 w-full flex justify-center">
                      <DoughnutChart data={gradeDistribution} options={{ maintainAspectRatio: false }} />
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Class Performance (Full Width Chart) */}
            <Card className="border border-gray-200 shadow-sm">
              <CardHeader className="border-b border-gray-50 pb-4">
                <CardTitle className="text-base font-bold text-gray-700 flex items-center gap-2">
                  <GraduationCap size={18} className="text-purple-600" /> Kết Quả Theo Lớp
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                 <div className="h-72 w-full">
                    <BarChart data={classPerformance} options={{ maintainAspectRatio: false }} />
                 </div>
              </CardContent>
            </Card>

            {/* Recent Classes Table */}
            <Card className="border border-gray-200 shadow-sm overflow-hidden">
              <CardHeader className="border-b border-gray-50 pb-4 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold text-[var(--color-primary)] flex items-center gap-2">
                  <BookOpen size={20} className="text-blue-600" /> Lớp Học Gần Đây
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate("/academic/classes")} className="text-blue-600 text-xs hover:bg-blue-50">
                   Xem tất cả <ChevronRight size={14} />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100">
                  {recentClasses.length > 0 ? recentClasses.map((cls, idx) => (
                    <div 
                      key={idx} 
                      className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/academic/classes/${cls._id}`)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100 group-hover:bg-blue-100 transition-colors">
                           {cls.name?.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-800 text-sm group-hover:text-[var(--color-primary)] transition-colors">{cls.name}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                             <span className="flex items-center gap-1"><Users size={12}/> {cls.studentsCount} HV</span>
                             <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                             <span className="flex items-center gap-1"><CheckCircle size={12}/> {cls.attendanceRate}% CC</span>
                          </p>
                        </div>
                      </div>
                      <Badge variant={cls.status === "active" ? "success" : "secondary"} className="text-[10px] px-2 py-0.5">
                        {cls.status === "active" ? "Đang học" : "Đã xong"}
                      </Badge>
                    </div>
                  )) : <div className="p-8 text-center text-gray-400 text-sm">Chưa có lớp học nào</div>}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN (4/12 - Sidebar Widgets) */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Alert: Pending Requests */}
            <div className="bg-amber-50 rounded-xl p-5 border border-amber-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <FileText size={80} className="text-amber-600" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                     <AlertCircle className="text-amber-600 animate-pulse" size={20} />
                     <h3 className="font-bold text-amber-800">Yêu Cầu Chờ Xử Lý</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-extrabold text-amber-700">{stats.pendingRequests}</span>
                     <span className="text-sm text-amber-600 font-medium">yêu cầu</span>
                  </div>
                  <Button 
                     size="sm" 
                     className="mt-4 bg-amber-600 hover:bg-amber-700 text-white w-full border-none shadow-sm"
                     onClick={() => navigate("/academic/requests")}
                  >
                     Xử lý ngay
                  </Button>
               </div>
            </div>

            {/* Alert: Low Attendance */}
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100 shadow-sm relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Users size={80} className="text-rose-600" />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-2">
                     <AlertCircle className="text-rose-600" size={20} />
                     <h3 className="font-bold text-rose-800">Cảnh Báo Chuyên Cần</h3>
                  </div>
                  <div className="flex items-baseline gap-2">
                     <span className="text-4xl font-extrabold text-rose-700">{stats.lowAttendanceStudents}</span>
                     <span className="text-sm text-rose-600 font-medium">học viên</span>
                  </div>
                  <p className="text-xs text-rose-500 mt-1 mb-4">Có tỷ lệ chuyên cần dưới 80%</p>
                  <Button 
                     size="sm" 
                     className="bg-rose-600 hover:bg-rose-700 text-white w-full border-none shadow-sm"
                     onClick={() => navigate("/academic/students?filter=low_attendance")}
                  >
                     Xem danh sách
                  </Button>
               </div>
            </div>

            {/* Quick Actions List */}
            <Card className="border border-gray-200 shadow-sm">
               <CardHeader className="border-b border-gray-50 pb-3">
                  <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest">Thao tác nhanh</CardTitle>
               </CardHeader>
               <CardContent className="p-3 space-y-2">
                  <QuickActionItem 
                     icon={<BookOpen className="text-blue-600" size={18} />} 
                     label="Lớp Học Phụ Trách" 
                     bg="bg-blue-50"
                     onClick={() => navigate("/academic/classes")} 
                  />
                  <QuickActionItem 
                     icon={<CheckCircle className="text-emerald-600" size={18} />} 
                     label="Điểm Danh Nhanh" 
                     bg="bg-emerald-50"
                     onClick={() => navigate("/academic/attendance")} 
                  />
                  <QuickActionItem 
                     icon={<TrendingUp className="text-purple-600" size={18} />} 
                     label="Nhập Điểm Số" 
                     bg="bg-purple-50"
                     onClick={() => navigate("/academic/grades")} 
                  />
                  <QuickActionItem 
                     icon={<Calendar className="text-orange-600" size={18} />} 
                     label="Quản Lý Lịch Học" 
                     bg="bg-orange-50"
                     onClick={() => navigate("/academic/schedule")} 
                  />
               </CardContent>
            </Card>

            {/* Pending Requests Mini List */}
            <Card className="border border-gray-200 shadow-sm">
               <CardHeader className="border-b border-gray-50 pb-3">
                  <CardTitle className="text-sm font-bold text-gray-500 uppercase tracking-widest">Mới nhất</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                     {pendingRequests.length > 0 ? pendingRequests.slice(0, 3).map((req, idx) => (
                        <div key={idx} className="p-3 hover:bg-gray-50 transition-colors flex items-start gap-3 cursor-pointer" onClick={() => navigate("/academic/requests")}>
                           <div className="w-2 h-2 mt-1.5 rounded-full bg-amber-500 shrink-0"></div>
                           <div>
                              <p className="text-xs font-bold text-gray-800 line-clamp-1">{req.type === 'leave' ? 'Xin nghỉ phép' : req.type}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{req.studentName} • {new Date(req.createdAt).toLocaleDateString("vi-VN")}</p>
                           </div>
                        </div>
                     )) : <p className="text-center text-xs text-gray-400 py-4">Không có yêu cầu mới</p>}
                  </div>
               </CardContent>
            </Card>

          </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const MetricCard = ({ title, value, icon, color, subText }) => {
  const styles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };
  return (
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 group">
      <CardContent className="p-5 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-[var(--color-primary)]">{value}</h3>
          {subText && <p className="text-[10px] text-gray-400 mt-1 font-medium">{subText}</p>}
        </div>
        <div className={`p-3.5 rounded-xl border ${styles[color]} group-hover:scale-110 transition-transform shadow-sm`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
};

const QuickActionItem = ({ icon, label, bg, onClick }) => (
   <div 
      onClick={onClick}
      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 border border-transparent hover:border-gray-100 cursor-pointer transition-all group"
   >
      <div className={`p-2 rounded-lg ${bg} group-hover:scale-105 transition-transform`}>{icon}</div>
      <div className="flex-1">
         <p className="text-sm font-bold text-gray-700 group-hover:text-[var(--color-primary)]">{label}</p>
      </div>
      <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-500" />
   </div>
);

export default AcademicStaffDashboardPage;