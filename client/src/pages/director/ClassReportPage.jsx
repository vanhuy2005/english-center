import React, { useState, useEffect } from "react";
import { useLanguage } from "@hooks";
import { Card, Loading, Badge, Table } from "@components/common";
import { BarChart, PieChart } from "@components/charts";
import {
  School,
  Users,
  DoorOpen,
  DoorClosed,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  MoreHorizontal
} from "lucide-react";

// Import dữ liệu giả lập từ file vừa tạo
import { 
  classStats, 
  classStatusData, 
  classCapacityData, 
  classListData,
  breakdownStats
} from './mockClassData';

/**
 * Class Report Page - Thống kê lớp học (Polished UI)
 */
const ClassReportPage = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  
  // State quản lý dữ liệu
  const [stats, setStats] = useState(classStats);
  const [classData, setClassData] = useState([]);
  const [capacityData, setCapacityData] = useState([]);
  const [classList, setClassList] = useState([]);
  const [breakdown, setBreakdown] = useState({ byLevel: [], byTime: [], byDay: [] });

  useEffect(() => {
    fetchClassData();
  }, []);

  const fetchClassData = async () => {
    try {
      setLoading(true);
      
      // Giả lập độ trễ mạng (0.8s) để tạo hiệu ứng loading mượt mà
      await new Promise(resolve => setTimeout(resolve, 800));

      // Gán dữ liệu trực tiếp từ Mock Data
      // (Không gọi API để tránh lỗi service function missing)
      setStats(classStats);
      setClassData(classStatusData);
      setCapacityData(classCapacityData);
      setClassList(classListData);
      setBreakdown(breakdownStats);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loading text="Đang tải dữ liệu lớp học..." />
      </div>
    );
  }

  // Helper render Progress Bar cho cột Sĩ số
  const renderCapacityBar = (current, max) => {
    const percent = Math.round((current / max) * 100) || 0;
    
    // Logic màu sắc: >90% đỏ, >70% vàng, còn lại xanh
    let colorClass = "bg-emerald-500";
    if (percent >= 90) colorClass = "bg-rose-500";
    else if (percent >= 70) colorClass = "bg-amber-500";

    return (
      <div className="w-full max-w-[140px]">
        <div className="flex justify-between text-xs mb-1.5 font-medium text-gray-600">
          <span>{percent}%</span>
          <span>{current}/{max} HV</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${colorClass}`}
            style={{ width: `${percent}%` }}
          ></div>
        </div>
      </div>
    );
  };

  // Cấu hình cột cho bảng
  const tableColumns = [
    { key: "classCode", label: "Mã Lớp", width: "110px", className: "text-sm font-mono text-gray-600" },
    { key: "className", label: "Tên Lớp", className: "font-semibold text-gray-900" },
    { key: "course", label: "Khóa Học" },
    { key: "teacher", label: "Giảng Viên" },
    { key: "capacity", label: "Sĩ Số & Lấp Đầy" },
    { key: "status", label: "Trạng Thái", align: "center" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50/50 min-h-screen font-sans">
      
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
            Quản Lý Lớp Học
          </h1>
          <p className="text-gray-500 mt-1 text-sm md:text-base">
            Tổng quan tình trạng phòng học, lịch học và công suất đào tạo.
          </p>
        </div>
        
         <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Calendar className="w-4 h-4" />
            Kỳ hiện tại
          </button>
          <button className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm text-gray-700">
             <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Tổng Lớp Học"
          value={stats.totalClasses}
          icon={<School className="w-6 h-6" />}
          variant="blue"
        />
        <StatCard
          title="Đang Hoạt Động"
          value={stats.activeClasses}
          icon={<DoorOpen className="w-6 h-6" />}
          variant="green"
        />
        <StatCard
          title="Đang Tuyển Sinh"
          value={stats.openClasses}
          icon={<Users className="w-6 h-6" />}
          variant="purple"
          subtitle="Còn chỗ trống"
        />
        <StatCard
          title="Lớp Đã Đóng"
          value={stats.closedClasses}
          icon={<DoorClosed className="w-6 h-6" />}
          variant="orange"
        />
        <StatCard
          title="TB Học Viên/Lớp"
          value={stats.avgStudentsPerClass}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="teal"
        />
      </div>

      {/* 3. Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart: Status */}
        <Card title="Trạng Thái Lớp Học" className="shadow-sm border-gray-200">
          <div className="mt-4">
             <PieChart
              data={classData}
              dataKey="value"
              nameKey="name"
              height={300}
              // Dùng mảng màu từ data
            />
          </div>
        </Card>

        {/* Bar Chart: Capacity */}
        <Card title="Phân Tích Tỷ Lệ Lấp Đầy" className="shadow-sm border-gray-200">
          <div className="mt-4">
            <BarChart
              data={capacityData}
              bars={[
                {
                  dataKey: "count",
                  name: "Số lượng lớp",
                  fill: "#3b82f6",
                  radius: [4, 4, 0, 0],
                  barSize: 48
                },
              ]}
              height={300}
            />
          </div>
        </Card>
      </div>

      {/* 4. Main Class List Table */}
      <Card title="Danh Sách Lớp Học Tiêu Biểu" className="shadow-sm border-gray-200">
        <div className="mt-2">
            <Table
            columns={tableColumns}
            data={classList.map((cls) => ({
                classCode: cls.classCode,
                className: cls.className,
                course: <span className="text-blue-600 font-medium">{cls.course}</span>,
                teacher: (
                    <div className="flex items-center gap-3">
                        {cls.teacher ? (
                          <>
                            <img src={cls.teacher.avatar || `https://ui-avatars.com/api/?name=${cls.teacher.fullName}&background=random`} alt="" className="w-7 h-7 rounded-full border border-gray-200"/>
                            <span className="text-sm">{cls.teacher.fullName}</span>
                          </>
                        ) : (
                          <span className="text-gray-400 italic text-sm">Chưa phân công</span>
                        )}
                    </div>
                ),
                capacity: renderCapacityBar(cls.currentStudents, cls.maxStudents),
                status: (
                <Badge
                    variant={
                    cls.status === "active" ? "success" : 
                    cls.status === "open" ? "primary" :
                    cls.status === "full" ? "warning" : "default"
                    }
                >
                    {cls.status === "active" && "Đang học"}
                    {cls.status === "open" && "Tuyển sinh"}
                    {cls.status === "full" && "Full chỗ"}
                    {cls.status === "closed" && "Kết thúc"}
                </Badge>
                ),
            }))}
            />
        </div>
      </Card>

      {/* 5. Breakdown Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card title="Phân Bổ Theo Trình Độ" className="shadow-sm border-gray-200" icon={<BookOpen className="w-5 h-5 text-gray-400"/>}>
          <div className="space-y-4 mt-2">
            {breakdown.byLevel.map((item, index) => (
                 <StatusItem key={index} label={item.label} count={item.count} color={item.color} />
            ))}
          </div>
        </Card>

        <Card title="Phân Bổ Theo Khung Giờ" className="shadow-sm border-gray-200" icon={<Clock className="w-5 h-5 text-gray-400"/>}>
          <div className="space-y-4 mt-2">
            {breakdown.byTime.map((item, index) => (
                 <StatusItem key={index} label={item.label} count={item.count} color={item.color} />
            ))}
          </div>
        </Card>

        <Card title="Phân Bổ Theo Lịch Học" className="shadow-sm border-gray-200" icon={<Calendar className="w-5 h-5 text-gray-400"/>}>
           <div className="space-y-4 mt-2">
            {breakdown.byDay.map((item, index) => (
                 <StatusItem key={index} label={item.label} count={item.count} color={item.color} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// --- Sub Components ---

/**
 * Stat Card Component - Tái sử dụng style Soft UI
 */
const StatCard = ({ title, value, icon, variant = "blue", subtitle }) => {
  const variants = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-emerald-50 text-emerald-600 border-emerald-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    teal: "bg-teal-50 text-teal-600 border-teal-100",
  };
  
  const currentStyle = variants[variant] || variants.blue;

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-xl shrink-0 ${currentStyle}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

/**
 * Status Item Component - Dùng cho các Card Breakdown cuối trang
 */
const StatusItem = ({ label, count, color }) => {
    // Kiểm tra xem color là mã hex hay class tailwind
    const isTailwindClass = color.startsWith('bg-');
    
    return (
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-3">
          <span className={`w-2.5 h-2.5 rounded-full ring-2 ring-opacity-20 ring-offset-1 ring-current shrink-0 ${isTailwindClass ? color.replace('bg-', 'text-') : ''}`} style={!isTailwindClass ? { color: color } : {}}>
              <span className={`block w-full h-full rounded-full ${isTailwindClass ? color : ''}`} style={!isTailwindClass ? { backgroundColor: color } : {}} />
          </span>
          <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2.5 py-0.5 rounded-md border border-gray-100">
          {count}
        </span>
      </div>
    );
};

export default ClassReportPage;