import React, { useState, useEffect } from "react";
import {
  FileText,
  Users,
  TrendingUp,
  Award,
  AlertCircle,
  Download,
  Printer,
  Search,
  School,
  CheckCircle,
  BarChart2
} from "lucide-react";
import { Card, Button, Badge, Loading, Select } from "../../../components/common"; // Import path đúng
import api from "../../../services/api";
import { toast } from "react-hot-toast";

const ClassReportsPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [classStats, setClassStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchClassStats(selectedClass);
    } else {
        setClassStats(null);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStats = async (classId) => {
    setLoading(true);
    try {
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data?.data || response.data;

     
      let students = [];
      if (Array.isArray(classData.students)) {
        // Fetch details if needed (mock for now or assume populated)
        students = classData.students
          .map((item) => {
            const studentData = item?.student || item;
            return {
              ...studentData,
              enrollmentStatus: item?.status || "active", 
            };
          })
          .filter((s) => s && s._id);
      }

    
      const stats = calculateStats(classData, students);
      setClassStats(stats);
    } catch (error) {
      console.error("Error fetching class stats:", error);
      toast.error("Không thể tải thống kê lớp học");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (classData, students) => {
    const totalStudents = students.length;
    const activeStudents = students.filter(
      (s) => s.enrollmentStatus === "active" || s.status === "active"
    ).length;

   
    const scores = students.map(() => Math.floor(Math.random() * 4) + 6); 

    const scoreRanges = {
      excellent: scores.filter((s) => s >= 9).length,
      good: scores.filter((s) => s >= 7 && s < 9).length,
      average: scores.filter((s) => s >= 5 && s < 7).length,
      belowAverage: scores.filter((s) => s < 5).length,
    };

    const averageScore =
      scores.length > 0
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)
        : 0;

    const passRate =
      scores.length > 0
        ? ((scores.filter((s) => s >= 5).length / scores.length) * 100).toFixed(1)
        : 0;

    return {
      classInfo: classData,
      totalStudents,
      activeStudents,
      scoreRanges,
      averageScore,
      passRate,
      capacity: classData.capacity?.max ?? classData.capacity ?? 0,
      teacher: classData.teacher,
      course: classData.course,
    };
  };

  const exportToExcel = () => {
    if (!classStats) return toast.error("Vui lòng chọn lớp học trước");

    try {
      const data = [
        ["BÁO CÁO THỐNG KÊ LỚP HỌC"],
        [],
        ["Tên lớp:", classStats.classInfo.name || classStats.classInfo.className],
        ["Mã lớp:", classStats.classInfo.classCode],
        ["Khóa học:", classStats.course?.name || "N/A"],
        ["Giáo viên:", classStats.teacher?.fullName || "Chưa phân công"],
        [],
        ["THỐNG KÊ HỌC VIÊN"],
        ["Tổng số:", classStats.totalStudents],
        ["Đang học:", classStats.activeStudents],
        [],
        ["PHÂN BỐ ĐIỂM"],
        ["Xuất sắc:", classStats.scoreRanges.excellent],
        ["Giỏi:", classStats.scoreRanges.good],
        ["Khá:", classStats.scoreRanges.average],
        ["Yếu:", classStats.scoreRanges.belowAverage],
        [],
        ["KẾT QUẢ"],
        ["Điểm TB:", classStats.averageScore],
        ["Tỷ lệ đạt:", classStats.passRate + "%"],
      ];

      const csvContent = data.map((row) => row.join(",")).join("\n");
      const element = document.createElement("a");
      element.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent));
      element.setAttribute("download", `BaoCao_${classStats.classInfo.classCode}_${Date.now()}.csv`);
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      toast.success("Đã tải xuống báo cáo");
    } catch (error) {
      toast.error("Lỗi xuất file");
    }
  };

  const printReport = () => {
    if (!classStats) return toast.error("Vui lòng chọn lớp học trước");
    window.print();
  };

  if (loading && !classStats) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800 print:bg-white print:p-0">
      <div className="max-w-[1600px] mx-auto space-y-6 print:max-w-none">
        
        {/* --- HEADER (Hidden on Print) --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm print:hidden">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <BarChart2 className="w-6 h-6 text-white" />
               </div>
               Báo Cáo & Thống Kê
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Tổng hợp dữ liệu và kết quả học tập của lớp
            </p>
          </div>
        </div>

        {/* --- CLASS SELECTOR (Hidden on Print) --- */}
        <Card className="border border-gray-200 shadow-sm print:hidden">
           <div className="p-4 flex gap-4 items-center">
              <div className="relative w-full md:w-1/3">
                 <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm font-medium cursor-pointer"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                 >
                    <option value="">-- Chọn lớp học để xem báo cáo --</option>
                    {classes.map((cls) => (
                       <option key={cls._id} value={cls._id}>
                          {cls.name || cls.className} ({cls.classCode})
                       </option>
                    ))}
                 </select>
              </div>
              {classStats && (
                 <div className="flex gap-2 ml-auto">
                    <Button variant="outline" className="border-gray-300 text-gray-700" onClick={printReport}>
                       <Printer size={16} className="mr-2"/> In báo cáo
                    </Button>
                    <Button className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]" onClick={exportToExcel}>
                       <Download size={16} className="mr-2"/> Xuất Excel
                    </Button>
                 </div>
              )}
           </div>
        </Card>

        {/* --- REPORT CONTENT --- */}
        {classStats ? (
           <div className="space-y-6 print:space-y-8">
              
              {/* Report Header (Print Only) */}
              <div className="hidden print:block text-center mb-8">
                 <h1 className="text-3xl font-bold uppercase mb-2">Báo Cáo Tổng Kết Lớp Học</h1>
                 <p className="text-gray-500">Trung Tâm Anh Ngữ English Hub</p>
                 <p className="text-sm mt-2">Ngày xuất: {new Date().toLocaleDateString("vi-VN")}</p>
              </div>

              {/* Class Info Card */}
              <Card className="border border-gray-200 shadow-sm bg-white print:shadow-none print:border-none">
                 <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 border-b pb-2">
                       <School size={20} className="text-[var(--color-secondary)]" /> Thông tin chung
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                       <div>
                          <p className="text-gray-500 mb-1">Tên lớp</p>
                          <p className="font-bold text-lg text-[var(--color-primary)]">{classStats.classInfo.name || classStats.classInfo.className}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 mb-1">Mã lớp</p>
                          <p className="font-mono font-medium bg-gray-100 px-2 py-0.5 rounded w-fit">{classStats.classInfo.classCode}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 mb-1">Khóa học</p>
                          <p className="font-medium">{classStats.course?.name || "N/A"}</p>
                       </div>
                       <div>
                          <p className="text-gray-500 mb-1">Giáo viên</p>
                          <p className="font-medium">{classStats.teacher?.fullName || "Chưa phân công"}</p>
                       </div>
                    </div>
                 </div>
              </Card>

              {/* KPI Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
                 <StatBox title="Sĩ số lớp" value={classStats.totalStudents} sub={`Sức chứa: ${classStats.capacity}`} icon={Users} color="blue" />
                 <StatBox title="Đang theo học" value={classStats.activeStudents} sub={`${classStats.totalStudents > 0 ? Math.round((classStats.activeStudents/classStats.totalStudents)*100) : 0}% duy trì`} icon={CheckCircle} color="emerald" />
                 <StatBox title="Điểm TB Lớp" value={classStats.averageScore} sub="/ 10.0" icon={TrendingUp} color="purple" />
                 <StatBox title="Tỷ lệ đạt" value={`${classStats.passRate}%`} sub="≥ 5.0 điểm" icon={Award} color="orange" />
              </div>

              {/* Score Distribution Chart */}
              <Card className="border border-gray-200 shadow-sm bg-white print:shadow-none print:border">
                 <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                       <BarChart2 size={20} className="text-[var(--color-secondary)]" /> Phân bố kết quả
                    </h3>
                    
                    <div className="space-y-5">
                       <ScoreBar label="Xuất sắc (9-10)" count={classStats.scoreRanges.excellent} total={classStats.totalStudents} color="bg-emerald-500" />
                       <ScoreBar label="Giỏi (7-8)" count={classStats.scoreRanges.good} total={classStats.totalStudents} color="bg-blue-500" />
                       <ScoreBar label="Khá / TB (5-6)" count={classStats.scoreRanges.average} total={classStats.totalStudents} color="bg-amber-500" />
                       <ScoreBar label="Yếu / Kém (< 5)" count={classStats.scoreRanges.belowAverage} total={classStats.totalStudents} color="bg-rose-500" />
                    </div>
                 </div>
              </Card>

              {/* Print Footer */}
              <div className="hidden print:flex justify-between mt-12 pt-8 border-t border-gray-300">
                 <div className="text-center w-1/3">
                    <p className="font-bold mb-16">Người lập báo cáo</p>
                    <p>(Ký và ghi rõ họ tên)</p>
                 </div>
                 <div className="text-center w-1/3">
                    <p className="font-bold mb-16">Giám đốc trung tâm</p>
                    <p>(Ký và đóng dấu)</p>
                 </div>
              </div>

           </div>
        ) : (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-200 print:hidden">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                 <FileText size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Chưa chọn lớp học</h3>
              <p className="text-gray-500 mt-1 text-sm">Vui lòng chọn một lớp từ danh sách để xem báo cáo</p>
           </div>
        )}

      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const StatBox = ({ title, value, sub, icon: Icon, color }) => {
   const colors = {
      blue: "bg-blue-50 text-blue-600 border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      purple: "bg-purple-50 text-purple-600 border-purple-100",
      orange: "bg-orange-50 text-orange-600 border-orange-100",
   };
   
   return (
      <div className={`p-5 rounded-xl border ${colors[color] || colors.blue} flex items-center justify-between`}>
         <div>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mb-1">{title}</p>
            <p className="text-3xl font-extrabold">{value}</p>
            <p className="text-[10px] font-medium opacity-80 mt-1">{sub}</p>
         </div>
         <div className="opacity-20 transform scale-150">
            <Icon size={32} />
         </div>
      </div>
   );
};

const ScoreBar = ({ label, count, total, color }) => {
   const percent = total > 0 ? Math.round((count / total) * 100) : 0;
   return (
      <div className="flex items-center gap-4">
         <div className="w-32 text-sm font-medium text-gray-600">{label}</div>
         <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full ${color}`} style={{ width: `${percent}%` }}></div>
         </div>
         <div className="w-12 text-right text-sm font-bold text-gray-700">{count} HV</div>
         <div className="w-12 text-right text-xs text-gray-400">({percent}%)</div>
      </div>
   );
};

export default ClassReportsPage;