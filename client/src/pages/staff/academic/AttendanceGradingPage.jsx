import React, { useState, useEffect } from "react";
import {
  ClipboardCheck,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  User,
  MoreVertical,
  Edit2,
  Save,
  RotateCcw,
  GraduationCap,
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
} from "../../../components/common"; // Import path đúng
import api from "../../../services/api";
import { toast } from "react-hot-toast";

const AttendanceGradingPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("list"); // 'list' only for now

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents(selectedClass);
    } else {
        setStudents([]);
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

  const fetchStudents = async (classId) => {
    setLoading(true);
    try {
     
      const response = await api.get(`/classes/${classId}`);
      const classData = response.data?.data || response.data;
      const studentIds = classData.students || [];

      if (studentIds.length > 0) {
   
        const studentsPromises = studentIds.map((id) =>
          api.get(`/students/${id}`).catch((err) => null)
        );
        const studentsResponses = await Promise.all(studentsPromises);
        const studentsData = studentsResponses
          .filter((res) => res !== null)
          .map((res) => res.data?.data || res.data);

        setStudents(studentsData);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Không thể tải danh sách học viên");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student?.studentCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  
  const getStatusBadge = (status) => {
      const config = {
          active: { label: "Đang học", color: "success" },
          inactive: { label: "Đã nghỉ", color: "secondary" },
          dropped: { label: "Bỏ học", color: "danger" }
      };
      const conf = config[status] || config.inactive;
      return <Badge variant={conf.color}>{conf.label}</Badge>;
  };

  if (loading && !selectedClass) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <ClipboardCheck className="w-6 h-6 text-white" />
               </div>
               Điểm Danh & Nhập Điểm
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Quản lý chuyên cần và kết quả học tập theo lớp
            </p>
          </div>
        </div>

      
        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative w-full md:w-1/3">
                 <select
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm font-medium cursor-pointer"
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                 >
                    <option value="">-- Chọn lớp học --</option>
                    {classes.map((cls) => (
                       <option key={cls._id} value={cls._id}>
                          {cls.className || cls.name} ({cls.classCode}) - {cls.students?.length || 0} HV
                       </option>
                    ))}
                 </select>
              </div>

              {selectedClass && (
                 <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input 
                       type="text" 
                       placeholder="Tìm kiếm học viên theo tên hoặc mã..." 
                       className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-sm"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                    />
                 </div>
              )}
           </div>
        </Card>

        
        {selectedClass ? (
           <>
              {loading ? (
                 <div className="flex justify-center py-12"><Loading /></div>
              ) : filteredStudents.length > 0 ? (
                 <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
                    <div className="overflow-x-auto">
                       <table className="w-full text-sm text-left">
                          <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                             <tr>
                                <th className="px-6 py-4 w-16">STT</th>
                                <th className="px-6 py-4">Học Viên</th>
                                <th className="px-6 py-4">Liên Hệ</th>
                                <th className="px-6 py-4 text-center">Trạng Thái</th>
                                <th className="px-6 py-4 text-center w-48">Hành Động</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                             {filteredStudents.map((student, index) => (
                                <tr key={student._id} className="hover:bg-blue-50/30 transition-colors group">
                                   <td className="px-6 py-4 text-gray-400 font-mono text-xs">{index + 1}</td>
                                   
                             
                                   <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                         <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 text-xs">
                                            {student.fullName?.charAt(0).toUpperCase() || "S"}
                                         </div>
                                         <div>
                                            <p className="font-bold text-[var(--color-primary)]">{student.fullName}</p>
                                            <p className="text-xs text-gray-500 font-mono">{student.studentCode}</p>
                                         </div>
                                      </div>
                                   </td>

                                 
                                   <td className="px-6 py-4">
                                      <div className="text-xs text-gray-600 space-y-1">
                                         <p>{student.email || "N/A"}</p>
                                         <p>{student.phone || "N/A"}</p>
                                      </div>
                                   </td>

                               
                                   <td className="px-6 py-4 text-center">
                                      {getStatusBadge(student.status)}
                                   </td>

                               
                                   <td className="px-6 py-4 text-center">
                                      <div className="flex justify-center gap-2">
                                         {/* Nút Điểm Danh */}
                                         <Button 
                                            size="sm" 
                                            variant="outline" 
                                            className="h-8 px-3 text-xs border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-[var(--color-primary)]"
                                            // TODO: Thêm onClick mở modal điểm danh cá nhân hoặc điều hướng
                                         >
                                            <CheckCircle size={14} className="mr-1.5" /> Điểm danh
                                         </Button>

                                         {/* Nút Nhập Điểm */}
                                         <Button 
                                            size="sm" 
                                            className="h-8 px-3 text-xs bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-sm border-none"
                                           
                                         >
                                            <Edit2 size={14} className="mr-1.5" /> Nhập điểm
                                         </Button>
                                      </div>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </Card>
              ) : (
                 <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-200">
                    <div className="p-4 bg-gray-50 rounded-full mb-3">
                       <User size={40} className="text-gray-300" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                       {searchTerm ? "Không tìm thấy học viên nào" : "Lớp học này chưa có học viên"}
                    </p>
                 </div>
              )}
           </>
        ) : (
           <div className="flex flex-col items-center justify-center py-24 bg-white rounded-xl border border-dashed border-gray-200">
              <div className="p-4 bg-gray-50 rounded-full mb-3">
                 <GraduationCap size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-700">Chưa chọn lớp học</h3>
              <p className="text-gray-500 mt-1 text-sm">Vui lòng chọn một lớp từ danh sách để bắt đầu quản lý</p>
           </div>
        )}

      </div>
    </div>
  );
};

export default AttendanceGradingPage;