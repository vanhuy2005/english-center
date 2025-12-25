import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  ClipboardCheck,
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MoreVertical,
  Edit2,
  Save,
  RotateCcw,
  CheckSquare,
  LayoutGrid,
  List
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal
} from "../../../components/common"; // Import path
import api from "../../../services/api";
import { toast } from "react-hot-toast";

const AttendanceTrackingPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'grid'
  const [searchTerm, setSearchTerm] = useState("");

 
  const localDefaultDate = (() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
  })();
  const [date, setDate] = useState(localDefaultDate);

  const [editingRow, setEditingRow] = useState(null); // ID of student being edited
  const [editForm, setEditForm] = useState({ status: "", note: "" });
  
  
  const modifiedRef = useRef({});
  const modifiedDataRef = useRef({});
  const prevSelectedClassRef = useRef(selectedClass);
  const lastFetchDateRef = useRef(null);

  const statusOptions = useMemo(
    () => [
      { value: "present", label: "Có mặt", color: "success", icon: <CheckCircle size={14}/> },
      { value: "absent", label: "Vắng", color: "danger", icon: <XCircle size={14}/> },
      { value: "late", label: "Đi muộn", color: "warning", icon: <Clock size={14}/> },
      { value: "excused", label: "Có phép", color: "info", icon: <Clock size={14}/> },
      { value: "no_record", label: "Chưa điểm danh", color: "secondary", icon: <User size={14}/> },
    ],
    []
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (prevSelectedClassRef.current !== selectedClass) {
      modifiedRef.current = {};
      modifiedDataRef.current = {};
      prevSelectedClassRef.current = selectedClass;
    }
    setAttendanceData([]);
    lastFetchDateRef.current = null;
    if (selectedClass) fetchAttendance();
  }, [selectedClass, date]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes"); // Adjust endpoint
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/attendance/class/${selectedClass}`, {
        params: { startDate: date, endDate: date },
      });
      const byStudent = response.data?.data?.byStudent || [];
      
      let rows = [];
      if (Array.isArray(byStudent) && byStudent.length > 0) {
        rows = byStudent.map((item) => {
          const student = item.student || {};
          const record = item.records?.[0] || null;
          return {
            _id: student._id,
            studentCode: student.studentCode || "",
            fullName: student.fullName || "",
            status: record ? record.status : "no_record",
            note: record ? record.note || "" : "",
            attendanceId: record ? record._id : null,
          };
        });
      }

     
      if (rows.length === 0) {
        try {
          const rosterRes = await api.get(`/classes/${selectedClass}/students`);
          const students = rosterRes.data?.data || [];
          rows = Array.isArray(students)
            ? students.map((s) => ({
                _id: s.student?._id || s._id,
                studentCode: s.student?.studentCode || s.studentCode || "",
                fullName: s.student?.fullName || s.fullName || "",
                status: "no_record",
                note: "",
                attendanceId: null,
              }))
            : [];
        } catch (err) { }
      }

 
      const prevMap = { ...modifiedDataRef.current[date] };
      if (lastFetchDateRef.current === date) {
        (attendanceData || []).forEach((r) => { if (r?._id) prevMap[r._id] = r; });
      }

      const merged = rows.map((r) => {
        const id = r._id?.toString();
        if (modifiedRef.current[date]?.has(id)) {
          return { ...r, ...prevMap[id] };
        }
    
        if (prevMap[id]?.status !== "no_record" && r.status === "no_record") {
           return { ...r, ...prevMap[id] };
        }
        return r;
      });

      setAttendanceData(merged);
      lastFetchDateRef.current = date;
    } catch (error) {
      console.error(error);
      setAttendanceData([]);
    }
  };

  const handleSaveStatus = async (studentId, newStatus, newNote = "") => {
    if (!selectedClass) return toast.error("Vui lòng chọn lớp");

    const payload = {
      student: studentId,
      class: selectedClass,
      date,
      status: newStatus,
      note: newNote,
    };

    try {
   
      setAttendanceData((prev) =>
        prev.map((r) =>
          r._id === studentId
            ? { ...r, status: newStatus, note: newNote, localOverride: true }
            : r
        )
      );

   
      if (!modifiedRef.current[date]) modifiedRef.current[date] = new Set();
      modifiedRef.current[date].add(studentId);
      if (!modifiedDataRef.current[date]) modifiedDataRef.current[date] = {};
      modifiedDataRef.current[date][studentId] = {
         ...attendanceData.find(r => r._id === studentId),
         status: newStatus,
         note: newNote,
         localOverride: true
      };

     
      await api.post(`/staff/academic/attendance`, payload);
      toast.success("Cập nhật thành công");
      setEditingRow(null);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi cập nhật điểm danh");
      
    }
  };

  const handleMarkAllPresent = () => {
     if (!window.confirm("Bạn có chắc muốn đánh dấu tất cả là 'Có mặt'?")) return;
     attendanceData.forEach(student => {
        if (student.status === 'no_record') {
           handleSaveStatus(student._id, 'present');
        }
     });
  };

  const filteredData = attendanceData.filter(
    (s) =>
      s.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

 

  const getStatusBadge = (status) => {
    const opt = statusOptions.find(o => o.value === status) || statusOptions[4];
    return (
      <Badge variant={opt.color} className="flex items-center gap-1.5 px-2.5 py-1">
        {opt.icon} {opt.label}
      </Badge>
    );
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <ClipboardCheck className="w-6 h-6 text-white" />
               </div>
               Điểm Danh Lớp Học
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Quản lý chuyên cần và ghi nhận trạng thái tham gia
            </p>
          </div>
          
          <div className="flex gap-2">
             <Button variant="outline" className="text-gray-600 border-gray-300" onClick={() => fetchAttendance()}>
                <RotateCcw size={18} />
             </Button>
             <div className="bg-gray-100 p-1 rounded-lg flex gap-1">
                <button 
                   onClick={() => setViewMode('table')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'table' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <List size={18} />
                </button>
                <button 
                   onClick={() => setViewMode('grid')}
                   className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-[var(--color-primary)]' : 'text-gray-500 hover:text-gray-700'}`}
                >
                   <LayoutGrid size={18} />
                </button>
             </div>
          </div>
        </div>

        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex flex-col xl:flex-row gap-4 items-center justify-between">
              
              {/* Selection Controls */}
              <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                 <div className="relative w-full md:w-64">
                    <select
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm font-medium"
                       value={selectedClass}
                       onChange={(e) => setSelectedClass(e.target.value)}
                    >
                       <option value="">-- Chọn lớp học --</option>
                       {classes.map((cls) => (
                          <option key={cls._id} value={cls._id}>{cls.name}</option>
                       ))}
                    </select>
                 </div>
                 <div className="relative w-full md:w-48">
                    <input 
                       type="date" 
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                       value={date}
                       onChange={(e) => setDate(e.target.value)}
                    />
                 </div>
              </div>

            
              <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                 <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input 
                       type="text" 
                       placeholder="Tìm học viên..." 
                       className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
                 {selectedClass && (
                    <Button 
                       className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-md whitespace-nowrap"
                       onClick={handleMarkAllPresent}
                    >
                       <CheckSquare size={18} className="mr-2"/> Tất cả có mặt
                    </Button>
                 )}
              </div>

           </div>
        </Card>

        
        {!selectedClass ? (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                 <Clock size={40} className="text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">Vui lòng chọn lớp và ngày để bắt đầu điểm danh</p>
           </div>
        ) : (
           <>
             
              {viewMode === 'table' && (
                 <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                             <tr>
                                <th className="px-6 py-4 w-16">#</th>
                                <th className="px-6 py-4">Học Viên</th>
                                <th className="px-6 py-4 text-center">Trạng Thái</th>
                                <th className="px-6 py-4">Ghi Chú</th>
                                <th className="px-6 py-4 text-right">Thao Tác</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {filteredData.map((row, idx) => (
                                <tr key={row._id} className={`hover:bg-blue-50/30 transition-colors ${editingRow === row._id ? 'bg-blue-50/50' : ''}`}>
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
                                      {editingRow === row._id ? (
                                         <select 
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 w-full"
                                            value={editForm.status || row.status}
                                            onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                                         >
                                            {statusOptions.map(opt => (
                                               <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                         </select>
                                      ) : (
                                         getStatusBadge(row.status)
                                      )}
                                   </td>
                                   <td className="px-6 py-4">
                                      {editingRow === row._id ? (
                                         <input 
                                            type="text" 
                                            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm outline-none focus:border-blue-500 w-full"
                                            placeholder="Nhập ghi chú..."
                                            value={editForm.note}
                                            onChange={(e) => setEditForm({...editForm, note: e.target.value})}
                                         />
                                      ) : (
                                         <span className="text-gray-500 italic truncate max-w-[200px] block">{row.note || "-"}</span>
                                      )}
                                   </td>
                                   <td className="px-6 py-4 text-right">
                                      {editingRow === row._id ? (
                                         <div className="flex justify-end gap-2">
                                            <Button 
                                               size="sm" 
                                               className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 px-3"
                                               onClick={() => handleSaveStatus(row._id, editForm.status, editForm.note)}
                                            >
                                               <Save size={14} />
                                            </Button>
                                            <Button 
                                               size="sm" 
                                               variant="outline" 
                                               className="h-8 px-3"
                                               onClick={() => setEditingRow(null)}
                                            >
                                               <XCircle size={14} />
                                            </Button>
                                         </div>
                                      ) : (
                                         <Button 
                                            size="sm" 
                                            variant="ghost" 
                                            className="text-gray-500 hover:text-blue-600 h-8 w-8 p-0"
                                            onClick={() => {
                                               setEditingRow(row._id);
                                               setEditForm({ status: row.status, note: row.note });
                                            }}
                                         >
                                            <Edit2 size={16} />
                                         </Button>
                                      )}
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </Card>
              )}

            
              {viewMode === 'grid' && (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredData.map((row) => (
                       <Card key={row._id} className="border border-gray-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                          {/* Quick Status Bar */}
                          <div className={`h-1 w-full absolute top-0 left-0 ${
                             row.status === 'present' ? 'bg-emerald-500' : 
                             row.status === 'absent' ? 'bg-rose-500' : 
                             row.status === 'late' ? 'bg-amber-500' : 'bg-gray-200'
                          }`} />
                          
                          <div className="p-4 pt-5">
                             <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[var(--color-primary)] border border-gray-200">
                                      {row.fullName?.charAt(0).toUpperCase()}
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-gray-800 text-sm line-clamp-1">{row.fullName}</h4>
                                      <p className="text-xs text-gray-500 font-mono">{row.studentCode}</p>
                                   </div>
                                </div>
                             </div>

                             <div className="grid grid-cols-2 gap-2 mt-4">
                                <button 
                                   onClick={() => handleSaveStatus(row._id, 'present')}
                                   className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${row.status === 'present' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                   <CheckCircle size={18} className={row.status === 'present' ? 'text-emerald-600' : 'text-gray-400'} />
                                   <span className="text-[10px] mt-1 font-medium">Có mặt</span>
                                </button>
                                <button 
                                   onClick={() => handleSaveStatus(row._id, 'absent')}
                                   className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all ${row.status === 'absent' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                                >
                                   <XCircle size={18} className={row.status === 'absent' ? 'text-rose-600' : 'text-gray-400'} />
                                   <span className="text-[10px] mt-1 font-medium">Vắng</span>
                                </button>
                             </div>
                             
                            
                             <div className="mt-2 text-center">
                                <button 
                                   className="text-xs text-gray-400 hover:text-blue-600 flex items-center justify-center gap-1 w-full py-1"
                                   onClick={() => {
                                      setEditingRow(row._id);
                                      setEditForm({ status: row.status, note: row.note });
                                      setViewMode('table'); // Switch back to table for detailed edit
                                   }}
                                >
                                   <MoreVertical size={12} /> Tùy chọn khác (Trễ, Phép...)
                                </button>
                             </div>
                          </div>
                       </Card>
                    ))}
                 </div>
              )}
           </>
        )}

      </div>
    </div>
  );
};

export default AttendanceTrackingPage;