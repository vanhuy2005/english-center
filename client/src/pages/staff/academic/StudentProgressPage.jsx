import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart2,
  GraduationCap,
  Eye,
  TrendingDown,
  Edit2, // Icon sửa
  Save,  // Icon lưu
  X      // Icon hủy
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Modal,
} from "../../../components/common"; 
import api from "../../../services/api";
import { toast } from "react-hot-toast";

const StudentProgressPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Modal & Edit States
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    average: 0,
    attendanceRate: 0,
    note: ""
  });
  const [updateLoading, setUpdateLoading] = useState(false);

  const [stats, setStats] = useState({
    good: 0,
    warning: 0,
    danger: 0,
    total: 0,
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const calculateStats = (data) => {
    const good = data.filter(s => (s.average || 0) >= 8 && (s.attendanceRate || 0) >= 80).length;
    const warning = data.filter(s => 
      ((s.average || 0) >= 5 && (s.average || 0) < 8) || 
      ((s.attendanceRate || 0) >= 60 && (s.attendanceRate || 0) < 80)
    ).length;
    const danger = data.filter(s => (s.average || 0) < 5 || (s.attendanceRate || 0) < 60).length;
    
    setStats({ good, warning, danger, total: data.length });
  };

  const fetchStudents = async () => {
    try {
      // Giả lập API call
      const response = await api.get("/staff/academic/students");
      const data = response.data?.data || response.data || [];
      const studentsList = Array.isArray(data) ? data : [];
      
      setStudents(studentsList);
      calculateStats(studentsList);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải dữ liệu học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLE EDIT LOGIC ---
  const handleOpenDetail = (student, mode = 'view') => {
    setSelectedStudent(student);
    // Reset form edit về giá trị hiện tại của student
    setEditForm({
      average: student.average || 0,
      attendanceRate: student.attendanceRate || 0,
      note: student.note || "" 
    });
    setIsEditing(mode === 'edit');
    setShowDetailModal(true);
  };

  const handleUpdateProgress = async () => {
    try {
      setUpdateLoading(true);
      
      // 1. Gọi API update (Giả sử endpoint)
      // await api.put(`/staff/academic/students/${selectedStudent._id}/progress`, editForm);
      
      // Giả lập delay mạng
      await new Promise(resolve => setTimeout(resolve, 800));

      // 2. Cập nhật state local (Optimistic Update)
      const updatedStudents = students.map(s => 
        s._id === selectedStudent._id 
          ? { ...s, ...editForm } 
          : s
      );
      
      setStudents(updatedStudents);
      calculateStats(updatedStudents);
      setSelectedStudent({ ...selectedStudent, ...editForm });
      
      toast.success("Cập nhật tiến độ thành công!");
      setIsEditing(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật tiến độ");
    } finally {
      setUpdateLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // --- RENDER HELPERS ---
  const getProgressColor = (value) => {
    if (value >= 80) return "bg-emerald-500";
    if (value >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getScoreColor = (value) => {
    if (value >= 8) return "text-emerald-600";
    if (value >= 5) return "text-amber-600";
    return "text-rose-600";
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => {
    const styles = {
      primary: "bg-blue-50 text-blue-600 border-blue-100",
      emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
      amber: "bg-amber-50 text-amber-600 border-amber-100",
      rose: "bg-rose-50 text-rose-600 border-rose-100",
    };

    return (
      <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all group">
        <div className="p-5 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-3xl font-extrabold text-[var(--color-primary)]">{value}</h3>
            {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
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
                  <TrendingUp className="w-6 h-6 text-white" />
               </div>
               Tiến Độ Học Tập
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Theo dõi và cập nhật kết quả học tập của học viên
            </p>
          </div>
        </div>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Tổng Học Viên"
            value={stats.total}
            icon={Users}
            color="primary"
            subtitle="Đang theo dõi"
          />
          <StatCard
            title="Học Lực Tốt"
            value={stats.good}
            icon={CheckCircle}
            color="emerald"
            subtitle="Điểm cao & chăm chỉ"
          />
          <StatCard
            title="Cần Chú Ý"
            value={stats.warning}
            icon={AlertTriangle}
            color="amber"
            subtitle="Có dấu hiệu sa sút"
          />
          <StatCard
            title="Cần Cải Thiện"
            value={stats.danger}
            icon={TrendingDown}
            color="rose"
            subtitle="Nguy cơ rớt môn"
          />
        </div>

        {/* --- MAIN CONTENT CARD --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input 
                   type="text" 
                   placeholder="Tìm kiếm học viên theo tên hoặc mã..." 
                   className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-sm"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <div className="flex gap-2">
                <Button variant="outline" className="border-gray-200 text-gray-600 hover:bg-gray-50 text-xs">
                   <BarChart2 size={14} className="mr-2" /> Xuất Báo Cáo
                </Button>
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Học Viên</th>
                  <th className="px-6 py-4 w-48">Chuyên Cần</th>
                  <th className="px-6 py-4 text-center">Điểm TB</th>
                  <th className="px-6 py-4">Xếp Loại</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((row) => {
                    const avg = row.average || 0;
                    const attend = row.attendanceRate || 0;
                    
                    const isGood = avg >= 8 && attend >= 80;
                    const isDanger = avg < 5 || attend < 60;
                    
                    return (
                      <tr key={row._id || row.id} className="hover:bg-blue-50/30 transition-colors group">
                        
                        {/* Student Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 text-xs">
                              {row.fullName?.charAt(0).toUpperCase() || "S"}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-primary)]">{row.fullName}</p>
                              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                {row.studentCode}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Attendance Progress */}
                        <td className="px-6 py-4">
                           <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-medium text-gray-700">{attend}%</span>
                           </div>
                           <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                 className={`h-full ${getProgressColor(attend)}`} 
                                 style={{ width: `${Math.min(attend, 100)}%` }}
                              />
                           </div>
                        </td>

                        {/* Average Grade */}
                        <td className="px-6 py-4 text-center">
                           <span className={`text-lg font-bold ${getScoreColor(avg)}`}>
                              {avg.toFixed(1)}
                           </span>
                        </td>

                        {/* Status Badge */}
                        <td className="px-6 py-4">
                           <Badge 
                              variant={isGood ? "success" : isDanger ? "danger" : "warning"}
                              className="px-2.5 py-1 whitespace-nowrap"
                           >
                              {isGood ? "Tốt" : isDanger ? "Cần cải thiện" : "Trung bình"}
                           </Badge>
                        </td>

                        {/* Actions - BUTTONS ARE NOW ALWAYS VISIBLE */}
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end gap-2">
                              <Button
                                 size="sm"
                                 variant="outline"
                                 className="h-8 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)] whitespace-nowrap flex items-center"
                                 onClick={() => handleOpenDetail(row, 'view')}
                              >
                                 <Eye size={14} className="mr-1.5" /> Chi tiết
                              </Button>
                              <Button
                                 size="sm"
                                 className="h-8 px-3 text-xs bg-[var(--color-secondary)]/10 border border-[var(--color-secondary)]/50 text-[var(--color-secondary)] hover:bg-[var(--color-secondary)] hover:text-white transition-all whitespace-nowrap flex items-center"
                                 onClick={() => handleOpenDetail(row, 'edit')}
                              >
                                 <Edit2 size={14} className="mr-1.5" /> Cập nhật
                              </Button>
                           </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                       <div className="flex flex-col items-center">
                          <Search size={40} className="mb-2 text-gray-200" />
                          <p>Không tìm thấy học viên nào</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* --- DETAIL & UPDATE MODAL --- */}
      {showDetailModal && selectedStudent && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
             setShowDetailModal(false);
             setIsEditing(false); // Reset edit mode khi đóng
          }}
          title={isEditing ? "Cập Nhật Tiến Độ" : "Chi Tiết Tiến Độ Học Viên"}
          size="lg"
        >
          <div className="space-y-6 p-1">
             
             {/* Header Info (Always Visible) */}
             <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                 <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 text-2xl shadow-sm border border-blue-200">
                    {selectedStudent.fullName?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-[var(--color-primary)] text-xl">{selectedStudent.fullName}</h3>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><GraduationCap size={14}/> {selectedStudent.studentCode}</span>
                        <span className="text-gray-300">|</span>
                        <span>{selectedStudent.email || "Chưa có email"}</span>
                    </div>
                 </div>
                 {!isEditing && (
                    <div className="text-right">
                       <div className={`text-2xl font-bold ${getScoreColor(selectedStudent.average || 0)}`}>
                          {(selectedStudent.average || 0).toFixed(1)}
                       </div>
                       <div className="text-xs text-gray-500 uppercase font-medium">Điểm TB</div>
                    </div>
                 )}
             </div>

             {/* VIEW MODE */}
             {!isEditing && (
                <>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Attendance */}
                      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                         <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-500" /> Điểm danh
                         </h4>
                         <div className="flex items-end justify-between mb-2">
                            <span className="text-sm text-gray-500">Tỷ lệ tham gia</span>
                            <span className="text-lg font-bold text-gray-800">{selectedStudent.attendanceRate || 0}%</span>
                         </div>
                         <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                            <div 
                               className={`h-full ${getProgressColor(selectedStudent.attendanceRate || 0)}`} 
                               style={{ width: `${Math.min(selectedStudent.attendanceRate || 0, 100)}%` }}
                            />
                         </div>
                         <p className="text-xs text-gray-400 mt-3 italic">
                            * Dữ liệu được tính trên tổng số buổi học đã diễn ra.
                         </p>
                      </div>

                      {/* Performance Status */}
                      <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                         <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <BarChart2 size={18} className="text-blue-500" /> Đánh giá
                         </h4>
                         <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100">
                               <span className="text-sm text-gray-600">Trạng thái</span>
                               <Badge 
                                  variant={(selectedStudent.average >= 8 && selectedStudent.attendanceRate >= 80) ? "success" : (selectedStudent.average < 5 || selectedStudent.attendanceRate < 60) ? "danger" : "warning"}
                               >
                                  {(selectedStudent.average >= 8 && selectedStudent.attendanceRate >= 80) ? "Tốt" : (selectedStudent.average < 5 || selectedStudent.attendanceRate < 60) ? "Cần cải thiện" : "Trung bình"}
                               </Badge>
                            </div>
                            
                            {((selectedStudent.average || 0) < 5 || (selectedStudent.attendanceRate || 0) < 60) && (
                               <div className="p-3 bg-red-50 border border-red-100 rounded text-xs text-red-700 flex gap-2">
                                  <AlertTriangle size={16} className="shrink-0" />
                                  <span>Học viên đang nằm trong nhóm nguy cơ. Cần liên hệ nhắc nhở.</span>
                               </div>
                            )}
                         </div>
                      </div>
                   </div>
                   
                   {/* Ghi chú */}
                   {selectedStudent.note && (
                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl">
                         <h4 className="font-bold text-gray-700 mb-2 text-sm">Ghi chú:</h4>
                         <p className="text-sm text-gray-600">{selectedStudent.note}</p>
                      </div>
                   )}
                </>
             )}

             {/* EDIT MODE */}
             {isEditing && (
                <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
                   <div className="grid grid-cols-2 gap-5">
                      <Input 
                         label="Điểm Trung Bình (0-10)" 
                         type="number"
                         min="0" max="10" step="0.1"
                         value={editForm.average}
                         onChange={(e) => setEditForm({...editForm, average: parseFloat(e.target.value) || 0})}
                      />
                      <Input 
                         label="Tỷ lệ chuyên cần (%)" 
                         type="number"
                         min="0" max="100"
                         value={editForm.attendanceRate}
                         onChange={(e) => setEditForm({...editForm, attendanceRate: parseInt(e.target.value) || 0})}
                      />
                   </div>
                   
                   <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Ghi chú / Nhận xét</label>
                      <textarea
                         className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none text-sm min-h-[100px]"
                         placeholder="Nhập ghi chú về sự tiến bộ của học viên..."
                         value={editForm.note}
                         onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                      />
                   </div>

                   <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg flex gap-3 text-xs text-yellow-800">
                      <AlertTriangle size={16} className="shrink-0" />
                      <p>Lưu ý: Việc cập nhật thủ công này sẽ ghi đè lên các giá trị được tính toán tự động từ hệ thống điểm danh và điểm số.</p>
                   </div>
                </div>
             )}

             {/* Footer Actions */}
             <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                {isEditing ? (
                   <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                         <X size={16} className="mr-2" /> Hủy bỏ
                      </Button>
                      <Button 
                         className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                         onClick={handleUpdateProgress}
                         loading={updateLoading}
                      >
                         <Save size={16} className="mr-2" /> Lưu thay đổi
                      </Button>
                   </>
                ) : (
                   <>
                      <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
                      <Button 
                         className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]"
                         onClick={() => {
                            // Sync state form with current data before editing
                            setEditForm({
                               average: selectedStudent.average || 0,
                               attendanceRate: selectedStudent.attendanceRate || 0,
                               note: selectedStudent.note || ""
                            });
                            setIsEditing(true);
                         }}
                      >
                         <Edit2 size={16} className="mr-2" /> Cập nhật
                      </Button>
                   </>
                )}
             </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

export default StudentProgressPage;