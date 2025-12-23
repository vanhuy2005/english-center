import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart3, 
  Users, 
  BookOpen, 
  TrendingUp, 
  CheckCircle,
  Calendar,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react";
import { Card, Loading } from "../../../components/common"; 
import { LineChart, BarChart, DoughnutChart } from "../../../components/charts"; 
import api from "../../../services/api";
import { toast } from "react-hot-toast";

// --- HELPERS: Tính toán dữ liệu ---

// 1. Phân loại điểm số
const calculateGradeDistribution = (students) => {
  const distribution = [0, 0, 0, 0, 0]; // [Xuất sắc, Giỏi, Khá, TB, Yếu]
  
  students.forEach(s => {
    const score = Number(s.average || 0);
    if (score >= 9) distribution[0]++;      // Xuất sắc
    else if (score >= 8) distribution[1]++; // Giỏi
    else if (score >= 6.5) distribution[2]++; // Khá
    else if (score >= 5) distribution[3]++;   // Trung bình
    else distribution[4]++;                   // Yếu
  });
  
  return distribution;
};

// 2. Tính xu hướng tuyển sinh (6 tháng gần nhất)
const calculateEnrollmentTrend = (students) => {
  const last6Months = [];
  const counts = [0, 0, 0, 0, 0, 0];
  const today = new Date();

  // Tạo labels cho 6 tháng
  for (let i = 5; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
    last6Months.push(`Tháng ${d.getMonth() + 1}`);
  }

  // Đếm số lượng
  students.forEach(s => {
    if (!s.createdAt) return;
    const date = new Date(s.createdAt);
    const monthDiff = (today.getFullYear() - date.getFullYear()) * 12 + (today.getMonth() - date.getMonth());
    
    if (monthDiff >= 0 && monthDiff < 6) {
      // monthDiff = 0 là tháng hiện tại (index 5), monthDiff = 5 là 6 tháng trước (index 0)
      counts[5 - monthDiff]++;
    }
  });

  return { labels: last6Months, data: counts };
};

const AcademicStatisticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    averageGrade: 0,
    activeClasses: 0
  });

  const [chartData, setChartData] = useState({
    attendance: { labels: [], data: [] },
    grades: [],
    enrollment: { labels: [], data: [] }
  });

  useEffect(() => {
    fetchRealData();
  }, []);

  const fetchRealData = async () => {
    try {
      setLoading(true);
      
      // Gọi song song các API danh sách để lấy dữ liệu thô
      const [studentsRes, classesRes, statsRes] = await Promise.allSettled([
        api.get("/staff/academic/students", { params: { limit: 1000 } }), // Lấy hết để tính toán
        api.get("/classes", { params: { limit: 1000 } }),
        api.get("/staff/academic/statistics") // Lấy thêm thống kê server-side (nếu có Attendance Trend)
      ]);

      // 1. Xử lý dữ liệu Học viên
      const studentsList = studentsRes.status === 'fulfilled' ? (studentsRes.value.data?.data || []) : [];
      
      // Tính toán chỉ số học viên
      const totalStudents = studentsList.length;
      const totalScore = studentsList.reduce((sum, s) => sum + (Number(s.average) || 0), 0);
      const totalAttendance = studentsList.reduce((sum, s) => sum + (Number(s.attendanceRate) || 0), 0);
      
      const avgGrade = totalStudents > 0 ? (totalScore / totalStudents).toFixed(1) : 0;
      const avgAttendance = totalStudents > 0 ? (totalAttendance / totalStudents).toFixed(1) : 0;

      // 2. Xử lý dữ liệu Lớp học
      const classesList = classesRes.status === 'fulfilled' ? (classesRes.value.data?.data || []) : [];
      const totalClasses = classesList.length;
      const activeClasses = classesList.filter(c => c.status === 'ongoing').length;

      // 3. Xử lý dữ liệu Biểu đồ
      const gradeDist = calculateGradeDistribution(studentsList);
      const enrollmentTrend = calculateEnrollmentTrend(studentsList);
      
      // Attendance Trend: Ưu tiên lấy từ API thống kê nếu có, nếu không mock flat line từ avgAttendance
      const serverStats = statsRes.status === 'fulfilled' ? (statsRes.value.data?.data || {}) : {};
      const attendanceTrendData = serverStats.attendanceTrend || Array(7).fill(avgAttendance); 

      // Cập nhật State
      setStats({
        totalClasses,
        totalStudents,
        averageAttendance: avgAttendance,
        averageGrade: avgGrade,
        activeClasses
      });

      setChartData({
        grades: gradeDist,
        enrollment: enrollmentTrend,
        attendance: {
           labels: ["T2", "T3", "T4", "T5", "T6", "T7", "CN"], // Nhãn tĩnh cho tuần
           data: attendanceTrendData
        }
      });

    } catch (error) {
      console.error("Error calculating statistics:", error);
      toast.error("Lỗi tính toán dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  // --- CHART CONFIGURATIONS ---

  const attendanceChartConfig = {
    labels: chartData.attendance.labels,
    datasets: [{
      label: "Tỷ lệ chuyên cần (%)",
      data: chartData.attendance.data,
      borderColor: "#10b981", // Emerald
      backgroundColor: "rgba(16, 185, 129, 0.1)",
      tension: 0.3,
      fill: true,
      pointBackgroundColor: "#fff",
      pointBorderColor: "#10b981",
      pointBorderWidth: 2
    }]
  };

  const gradeChartConfig = {
    labels: ["Xuất sắc (9-10)", "Giỏi (8-9)", "Khá (6.5-8)", "TB (5-6.5)", "Yếu (<5)"],
    datasets: [{
      label: "Số lượng học viên",
      data: chartData.grades,
      backgroundColor: [
        "#10b981", // Emerald
        "#3b82f6", // Blue
        "#f59e0b", // Amber
        "#8b5cf6", // Purple
        "#ef4444"  // Red
      ],
      borderWidth: 0,
      hoverOffset: 4
    }]
  };

  const enrollmentChartConfig = {
    labels: chartData.enrollment.labels,
    datasets: [
        {
            label: "Học viên mới",
            data: chartData.enrollment.data,
            backgroundColor: "#3b9797", // Secondary Color
            borderRadius: 4,
            barThickness: 30
        }
    ]
  };

  // --- COMPONENT: Stat Card ---
  const StatCard = ({ title, value, icon: Icon, color, subText, trend }) => {
    const styles = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
    };

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all group">
        <div className="p-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <div className="flex items-baseline gap-2">
               <h3 className="text-3xl font-extrabold text-[var(--color-primary)]">{value}</h3>
               {trend && (
                  <span className={`text-xs font-medium flex items-center ${trend > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                     {trend > 0 ? <ArrowUpRight size={12}/> : <ArrowDownRight size={12}/>}
                     {Math.abs(trend)}%
                  </span>
               )}
            </div>
            {subText && <p className="text-[11px] text-gray-400 mt-1 font-medium">{subText}</p>}
          </div>
          <div className={`p-3 rounded-xl border ${styles[color]} group-hover:scale-110 transition-transform`}>
            <Icon size={24} />
          </div>
        </div>
      </Card>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BarChart3 className="w-6 h-6 text-white" />
               </div>
               Thống Kê Học Vụ
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Dữ liệu được tính toán tự động từ hệ thống
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
             <Calendar size={16} />
             <span>Cập nhật: {new Date().toLocaleDateString("vi-VN")} {new Date().toLocaleTimeString("vi-VN", {hour: '2-digit', minute:'2-digit'})}</span>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng Lớp Học"
            value={stats.totalClasses}
            icon={BookOpen}
            color="blue"
            subText={`${stats.activeClasses} lớp đang hoạt động`}
          />
          <StatCard
            title="Tổng Học Viên"
            value={stats.totalStudents}
            icon={Users}
            color="emerald"
            subText="Dựa trên hồ sơ đăng ký"
          />
          <StatCard
            title="Tỷ Lệ Chuyên Cần"
            value={`${stats.averageAttendance}%`}
            icon={CheckCircle}
            color="purple"
            subText="Trung bình toàn hệ thống"
          />
          <StatCard
            title="Điểm Trung Bình"
            value={stats.averageGrade}
            icon={TrendingUp}
            color="orange"
            subText="Thang điểm 10"
          />
        </div>

        {/* --- CHARTS ROW 1 --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Attendance Trend (Line Chart) */}
           <div className="lg:col-span-8">
              <Card className="border border-gray-200 shadow-sm h-full">
                 <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <TrendingUp size={18} className="text-emerald-500"/> Xu hướng chuyên cần (7 ngày qua)
                    </h3>
                 </div>
                 <div className="p-5 h-[320px]">
                    <LineChart data={attendanceChartConfig} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
                 </div>
              </Card>
           </div>

           {/* Grade Distribution (Doughnut Chart) */}
           <div className="lg:col-span-4">
              <Card className="border border-gray-200 shadow-sm h-full">
                 <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <PieChart size={18} className="text-blue-500"/> Phân bố kết quả
                    </h3>
                 </div>
                 <div className="p-5 h-[320px] flex flex-col justify-center items-center relative">
                    <div className="relative h-[220px] w-full">
                       <DoughnutChart 
                          data={gradeChartConfig} 
                          options={{ 
                             maintainAspectRatio: false, 
                             cutout: '70%',
                             plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } }
                          }} 
                       />
                       {/* Center Text */}
                       <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                          <span className="text-3xl font-extrabold text-gray-800">{stats.averageGrade}</span>
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Điểm TB</span>
                       </div>
                    </div>
                 </div>
              </Card>
           </div>

           {/* Enrollment Trend (Bar Chart) */}
           <div className="lg:col-span-12">
              <Card className="border border-gray-200 shadow-sm">
                 <div className="p-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
                       <Users size={18} className="text-[var(--color-secondary)]"/> Học viên mới (6 tháng gần nhất)
                    </h3>
                 </div>
                 <div className="p-5 h-[300px]">
                    <BarChart 
                       data={enrollmentChartConfig} 
                       options={{ 
                          maintainAspectRatio: false,
                          scales: { y: { beginAtZero: true, grid: { borderDash: [2, 4] } }, x: { grid: { display: false } } }
                       }} 
                    />
                 </div>
              </Card>
           </div>

        </div>

      </div>
    </div>
  );
};

export default AcademicStatisticsPage;