import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { LineChart, PieChart } from "@components/charts";
import { reportService } from "@services";
import { formatDate } from "@utils/date";
import {
  Users,
  UserPlus,
  TrendingUp,
  GraduationCap,
  Award,
  MoreHorizontal,
  Calendar
} from "lucide-react";


const StudentReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    newStudents: 0,
    graduatedStudents: 0,
    growth: 0,
  });
  const [enrollmentData, setEnrollmentData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [topStudents, setTopStudents] = useState([]);

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const [statsRes, enrollmentRes, distributionRes, topStudentsRes] =
        await Promise.all([
          reportService.getStudentStats(),
          reportService.getEnrollmentTrend({ limit: 12 }),
          reportService.getStudentDistribution(),
          reportService.getTopStudents({ limit: 10 }),
        ]);

      setStats(statsRes.data || stats);
      setEnrollmentData(enrollmentRes.data || []);
      setDistributionData(distributionRes.data || []);

      const topStudentsData =
        topStudentsRes?.data?.data || topStudentsRes?.data || [];
      setTopStudents(Array.isArray(topStudentsData) ? topStudentsData : []);
    } catch (error) {
      console.error("Error fetching student data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading text="Đang tải dữ liệu..." />
      </div>
    );
  }

  const renderRankBadge = (index) => {
    const rank = index + 1;
    let badgeStyle = "bg-gray-100 text-gray-600 border-gray-200"; // Mặc định
    
    if (index === 0) badgeStyle = "bg-yellow-50 text-yellow-700 border-yellow-200 ring-1 ring-yellow-200"; // Gold
    if (index === 1) badgeStyle = "bg-slate-50 text-slate-700 border-slate-200 ring-1 ring-slate-200"; // Silver
    if (index === 2) badgeStyle = "bg-orange-50 text-orange-700 border-orange-200 ring-1 ring-orange-200"; // Bronze

    return (
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${badgeStyle} mx-auto`}>
        {rank}
      </div>
    );
  };

  const tableColumns = [
    { 
      key: "rank", 
      label: "Hạng", 
      width: "80px",
      align: "center" 
    },
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và Tên", className: "font-medium text-gray-900" },
    { key: "course", label: "Khóa học" },
    { key: "gpa", label: "GPA" },
    { key: "attendance", label: "Chuyên cần" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen font-sans">
    
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Thống Kê Học Viên
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Tổng quan số liệu, xu hướng ghi danh và xếp hạng thành tích.
          </p>
        </div>
        
      
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Calendar className="w-4 h-4" />
            Tháng này
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm text-gray-700">
             <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

     
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng Học Viên"
          value={stats.totalStudents}
          icon={<Users className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Đang Học"
          value={stats.activeStudents}
          icon={<GraduationCap className="w-6 h-6" />}
          variant="green"
        />
        <StatCard
          title="Ghi Danh Mới"
          value={stats.newStudents}
          icon={<UserPlus className="w-6 h-6" />}
          variant="purple"
          trend={{ value: stats.growth, label: "so với tháng trước" }}
        />
        <StatCard
          title="Đã Tốt Nghiệp"
          value={stats.graduatedStudents}
          icon={<Award className="w-6 h-6" />}
          variant="orange"
        />
      </div>

    
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
        <Card className="lg:col-span-2 shadow-sm border-gray-200" title="Xu Hướng Ghi Danh">
          <div className="mt-4">
            <LineChart
              data={enrollmentData}
              lines={[
                {
                  dataKey: "newStudents",
                  name: "Học viên mới",
                  stroke: "#8b5cf6", 
                  strokeWidth: 2,
                },
                {
                  dataKey: "activeStudents",
                  name: "Đang học",
                  stroke: "#10b981",
                  strokeWidth: 2,
                },
              ]}
              height={320}
            />
          </div>
        </Card>

       
        <Card className="shadow-sm border-gray-200" title="Phân Bổ Theo Khóa">
          <div className="mt-4">
            <PieChart
              data={distributionData}
              dataKey="value"
              nameKey="name"
              height={320}
              colors={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']}
            />
          </div>
        </Card>
      </div>

     
      <Card className="shadow-sm border-gray-200" title="Bảng Vàng Thành Tích">
        <div className="mt-2">
          <Table
            columns={tableColumns}
            data={topStudents.map((student, index) => ({
              rank: renderRankBadge(index),
              studentCode: <span className="text-gray-600 font-mono text-sm">{student.studentCode}</span>,
              fullName: student.fullName,
              course: student.course,
              gpa: (
                <span className="font-bold text-gray-800">{student.gpa}</span>
              ),
              attendance: (
                <Badge variant={student.attendance >= 90 ? "success" : "warning"}>
                  {student.attendance}%
                </Badge>
              ),
            }))}
          />
        </div>
      </Card>

    
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Trạng Thái" className="shadow-sm border-gray-200">
          <div className="space-y-4 mt-2">
            <StatusItem label="Đang học" count={stats.activeStudents} color="bg-green-500" />
            <StatusItem label="Tạm nghỉ" count={25} color="bg-yellow-500" />
            <StatusItem label="Bảo lưu" count={12} color="bg-orange-500" />
            <StatusItem label="Đã nghỉ" count={8} color="bg-red-500" />
          </div>
        </Card>

        <Card title="Trình Độ" className="shadow-sm border-gray-200">
          <div className="space-y-4 mt-2">
            <StatusItem label="Beginner" count={120} color="bg-blue-500" />
            <StatusItem label="Elementary" count={95} color="bg-indigo-500" />
            <StatusItem label="Intermediate" count={80} color="bg-purple-500" />
            <StatusItem label="Advanced" count={45} color="bg-pink-500" />
          </div>
        </Card>

        <Card title="Độ Tuổi" className="shadow-sm border-gray-200">
          <div className="space-y-4 mt-2">
            <StatusItem label="6-12 tuổi" count={85} color="bg-cyan-500" />
            <StatusItem label="13-17 tuổi" count={110} color="bg-teal-500" />
            <StatusItem label="18-25 tuổi" count={95} color="bg-emerald-500" />
            <StatusItem label="26+ tuổi" count={50} color="bg-slate-500" />
          </div>
        </Card>
      </div>
    </div>
  );
};


const StatCard = ({ title, value, icon, variant = "blue", trend }) => {
 
  const variants = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };

  const currentStyle = variants[variant] || variants.blue;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`flex items-center text-xs font-semibold ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                <TrendingUp className={`w-3 h-3 mr-1 ${trend.value < 0 ? 'rotate-180' : ''}`} />
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="text-xs text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        
    
        <div className={`p-3 rounded-xl shrink-0 ${currentStyle}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Status Item Component - Polished UI
 */
const StatusItem = ({ label, count, color }) => {
  return (
    <div className="flex items-center justify-between group">
      <div className="flex items-center gap-3">
        {/* Dot indicator */}
        <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-opacity-20 ring-offset-1 ring-current shrink-0 ${color.replace('bg-', 'text-')}`}>
            <span className={`block w-full h-full rounded-full ${color}`} />
        </span>
        <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{label}</span>
      </div>
      <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-md border border-gray-100">
        {count}
      </span>
    </div>
  );
};

export default StudentReportPage;