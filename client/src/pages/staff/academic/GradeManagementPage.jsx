import React, { useState, useEffect } from "react";
import { 
  Award, 
  Save, 
  CheckCircle, 
  Search, 
  BarChart2, 
  FileText,
  User,
  GraduationCap
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  Loading, 
  Input 
} from "../../../components/common"; // Import path đúng
import api from "../../../services/api";
import { toast } from "react-hot-toast";

// --- HELPERS ---
const getScoreColor = (score) => {
  if (score >= 8) return "text-emerald-600 font-bold";
  if (score >= 5) return "text-amber-600 font-medium";
  return "text-rose-600";
};

const GradeManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [classStats, setClassStats] = useState({ avg: 0, passRate: 0 });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
       fetchGrades();
    } else {
       setGrades([]);
    }
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeGrades = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((g) => {
      const student = g.student || {};
      const studentObj = typeof student === "object" ? student : { _id: student };
      const scores = g.scores || {};
      
      // Logic tính điểm TB
      const mid = scores.midterm ?? null;
      const fin = scores.final ?? null;
      let avg = g.totalScore;
      
      if (avg === undefined) {
        const count = (mid !== null ? 1 : 0) + (fin !== null ? 1 : 0);
        avg = count > 0 ? (Number(mid || 0) + Number(fin || 0)) / count : 0;
      }
      
      return {
        _id: studentObj._id || g.student || g._id,
        gradeId: g._id,
        studentCode: studentObj.studentCode || "",
        fullName: studentObj.fullName || studentObj.name || "",
        midterm: mid,
        final: fin,
        average: Number(avg),
        status: g.isPublished ? "approved" : "pending",
      };
    });
  };

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(selectedClass);
      if (isObjectId) {
        // 1. Fetch grades existing
        const response = await api.get(`/staff/academic/grades/${selectedClass}`, { validateStatus: () => true });
        let gradeRows = [];
        
        if (response.status === 200 && Array.isArray(response.data?.data)) {
           gradeRows = normalizeGrades(response.data.data);
        }

        // 2. Fetch roster to merge empty students
        const rosterRes = await api.get(`/classes/${selectedClass}/students`, { validateStatus: () => true });
        const students = rosterRes.data?.data || [];

        // Merge logic
        if (Array.isArray(students) && students.length > 0) {
           const byId = {};
           gradeRows.forEach(r => { if (r?._id) byId[r._id] = r; });
           
           const merged = students.map(s => {
              const id = s._id;
              if (byId[id]) return byId[id];
              return {
                 _id: s._id,
                 studentCode: s.studentCode || "",
                 fullName: s.fullName || "",
                 midterm: "", // Empty string for input
                 final: "",
                 average: 0,
                 status: "pending"
              };
           });
           setGrades(merged);
           
           // Calculate Class Stats
           const totalAvg = merged.reduce((sum, s) => sum + (s.average || 0), 0);
           const passed = merged.filter(s => (s.average || 0) >= 5).length;
           setClassStats({
              avg: merged.length ? (totalAvg / merged.length) : 0,
              passRate: merged.length ? Math.round((passed / merged.length) * 100) : 0
           });
        } else {
           setGrades(gradeRows);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Lỗi tải bảng điểm");
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    // Chỉ cho phép nhập số hoặc rỗng
    if (value !== "" && (isNaN(value) || value < 0 || value > 10)) return;

    setGrades((prev) =>
      prev.map((r) => {
        if (r._id === studentId) {
           const mid = field === "midterm" ? Number(value) : Number(r.midterm || 0);
           const fin = field === "final" ? Number(value) : Number(r.final || 0);
           const hasMid = field === "midterm" ? value !== "" : r.midterm !== "" && r.midterm !== null;
           const hasFin = field === "final" ? value !== "" : r.final !== "" && r.final !== null;
           
           let count = 0;
           if (hasMid) count++;
           if (hasFin) count++;
           
           const avg = count > 0 ? (mid + fin) / count : 0;

           return { ...r, [field]: value, average: avg };
        }
        return r;
      })
    );
  };

  const handleSaveGrade = async (row) => {
    if (!selectedClass) return toast.error("Vui lòng chọn lớp");

    try {
      // Get Course ID from Class
      const classRes = await api.get(`/classes/${selectedClass}`);
      const courseId = classRes.data?.data?.course?._id || classRes.data?.data?.course;

      const payload = {
        student: row._id,
        class: selectedClass,
        course: courseId,
        scores: {
          midterm: row.midterm !== "" ? Number(row.midterm) : undefined,
          final: row.final !== "" ? Number(row.final) : undefined,
        },
      };

      await api.post(`/grades`, payload);
      toast.success("Đã lưu điểm");
      // Optional: Refresh or mark row as saved
    } catch (err) {
      console.error(err);
      toast.error("Lỗi lưu điểm");
    }
  };

  const handleApprove = async (gradeId) => {
     try {
        await api.patch(`/grades/${gradeId}/publish`);
        toast.success("Đã phê duyệt và công bố điểm");
        setGrades(prev => prev.map(r => r.gradeId === gradeId ? { ...r, status: 'approved' } : r));
     } catch (err) {
        toast.error("Lỗi phê duyệt");
     }
  };

  // Filter
  const filteredGrades = grades.filter(g => 
     g.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
     g.studentCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !selectedClass) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <Award className="w-6 h-6 text-white" />
               </div>
               Quản Lý Điểm Số
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Nhập điểm, tính điểm trung bình và xét duyệt kết quả
            </p>
          </div>
        </div>

        {/* --- TOOLBAR & STATS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Class Selector */}
           <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
              <div className="p-4 flex gap-4 items-center">
                 <div className="relative flex-1">
                    <select
                       value={selectedClass}
                       onChange={(e) => setSelectedClass(e.target.value)}
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none font-medium text-sm"
                    >
                       <option value="">-- Chọn lớp học để nhập điểm --</option>
                       {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>{cls.name} ({cls.classCode})</option>
                       ))}
                    </select>
                 </div>
                 {selectedClass && (
                    <div className="relative w-64">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                       <input 
                          type="text" 
                          placeholder="Tìm học viên..." 
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                       />
                    </div>
                 )}
              </div>
           </Card>

           {/* Class Stats Mini */}
           <Card className="border border-gray-200 shadow-sm bg-white">
              <div className="p-4 flex justify-around items-center h-full">
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Sĩ số</p>
                    <p className="text-2xl font-bold text-[var(--color-primary)]">{grades.length}</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Điểm TB Lớp</p>
                    <p className="text-2xl font-bold text-blue-600">{classStats.avg.toFixed(1)}</p>
                 </div>
                 <div className="w-px h-8 bg-gray-200"></div>
                 <div className="text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Qua môn</p>
                    <p className="text-2xl font-bold text-emerald-600">{classStats.passRate}%</p>
                 </div>
              </div>
           </Card>
        </div>

        {/* --- GRADES TABLE --- */}
        {selectedClass ? (
           <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
              <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                       <tr>
                          <th className="px-6 py-4 w-16">#</th>
                          <th className="px-6 py-4">Học Viên</th>
                          <th className="px-6 py-4 text-center w-32">Giữa Kỳ (40%)</th>
                          <th className="px-6 py-4 text-center w-32">Cuối Kỳ (60%)</th>
                          <th className="px-6 py-4 text-center w-24">TB Môn</th>
                          <th className="px-6 py-4 text-center w-32">Trạng Thái</th>
                          <th className="px-6 py-4 text-right">Thao Tác</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                       {filteredGrades.map((row, idx) => (
                          <tr key={row._id} className="hover:bg-blue-50/30 transition-colors group">
                             <td className="px-6 py-4 text-gray-400 font-mono text-xs">{idx + 1}</td>
                             
                             <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 text-xs">
                                      {row.fullName?.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                      <p className="font-bold text-[var(--color-primary)]">{row.fullName}</p>
                                      <p className="text-xs text-gray-500 font-mono">{row.studentCode}</p>
                                   </div>
                                </div>
                             </td>

                             <td className="px-6 py-4 text-center">
                                <input 
                                   type="text" 
                                   className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                   placeholder="-"
                                   value={row.midterm ?? ""}
                                   onChange={(e) => handleGradeChange(row._id, 'midterm', e.target.value)}
                                   disabled={row.status === 'approved'}
                                />
                             </td>

                             <td className="px-6 py-4 text-center">
                                <input 
                                   type="text" 
                                   className="w-16 text-center border border-gray-300 rounded px-2 py-1 text-sm focus:border-blue-500 outline-none"
                                   placeholder="-"
                                   value={row.final ?? ""}
                                   onChange={(e) => handleGradeChange(row._id, 'final', e.target.value)}
                                   disabled={row.status === 'approved'}
                                />
                             </td>

                             <td className="px-6 py-4 text-center">
                                <span className={`text-lg ${getScoreColor(row.average)}`}>
                                   {row.average.toFixed(1)}
                                </span>
                             </td>

                             <td className="px-6 py-4 text-center">
                                <Badge 
                                   variant={row.status === 'approved' ? 'success' : 'warning'}
                                   className="px-2 py-0.5 whitespace-nowrap"
                                >
                                   {row.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt'}
                                </Badge>
                             </td>

                             <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                   <Button 
                                      size="sm" 
                                      className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white h-8 px-3 shadow-sm border-none"
                                      onClick={() => handleSaveGrade(row)}
                                      disabled={row.status === 'approved'}
                                   >
                                      <Save size={14} className="mr-1" /> Lưu
                                   </Button>
                                   
                                   {row.status === 'pending' && row.gradeId && (
                                      <Button 
                                         size="sm" 
                                         className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3 shadow-sm border-none"
                                         onClick={() => handleApprove(row.gradeId)}
                                      >
                                         <CheckCircle size={14} className="mr-1" /> Duyệt
                                      </Button>
                                   )}
                                </div>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </Card>
        ) : (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                 <GraduationCap size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Vui lòng chọn lớp học để bắt đầu nhập điểm</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default GradeManagementPage;