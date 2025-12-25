import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Button,
  Loading,
  Badge,
  Modal,
} from "../../../components/common";
import {
  BookOpen,
  User,
  Search,
  Filter,
  CheckCircle,
  Clock,
  LayoutDashboard,
  School,
  Calendar,
  Users,
  ArrowRight,
  XCircle
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";


const safeExtract = (res) => {
  if (!res) return [];
  if (res.data?.data?.requests) return res.data.data.requests;
  if (res.data?.data?.classes) return res.data.data.classes;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const formatSchedule = (schedule) => {
  if (!schedule) return "Chưa xếp lịch";
  if (typeof schedule === 'string') return schedule;
  

  const formatSlot = (slot) => {
   
    const daysMap = {
      monday: "T2", tuesday: "T3", wednesday: "T4", thursday: "T5", friday: "T6", saturday: "T7", sunday: "CN",
      Monday: "T2", Tuesday: "T3", Wednesday: "T4", Thursday: "T5", Friday: "T6", Saturday: "T7", Sunday: "CN"
    };
    const day = daysMap[slot.dayOfWeek] || slot.dayOfWeek;
    const time = slot.startTime && slot.endTime ? `(${slot.startTime.slice(0, 5)}-${slot.endTime.slice(0, 5)})` : "";
    return `${day} ${time}`;
  };

  
  if (Array.isArray(schedule)) {
    return schedule.map(formatSlot).join(", ");
  }
  

  if (typeof schedule === 'object') {
    return formatSlot(schedule);
  }
  
  return "Lịch không xác định";
};

const AssignClassesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesMap, setClassesMap] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      

      const res = await api.get("/staff/enrollment/requests", {
        params: { status: "pending", type: "course_enrollment", limit: 100 },
      });
      const list = safeExtract(res);
      setRequests(list);

   
      const courseIds = Array.from(
        new Set(list.map((r) => r.course?._id || r.course).filter(Boolean))
      );

      if (courseIds.length > 0) {
        const clsRes = await api.get("/staff/enrollment/classes", {
          params: { 
            course: courseIds.join(","), 
            status: "upcoming,ongoing", 
            limit: 200 
          },
        });
        
        const clsData = safeExtract(clsRes);
        
        
        const map = {};
        clsData.forEach((c) => {
          const cId = typeof c.course === 'object' ? c.course?._id : c.course;
          if (cId) {
            if (!map[cId]) map[cId] = [];
            map[cId].push(c);
          }
        });
        setClassesMap(map);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

 
  const openAssignModal = (request) => {
    setSelectedRequest(request);
    setSelectedClassId("");
    setShowAssignModal(true);
  };

  const handleAssignSubmit = async () => {
    if (!selectedClassId || !selectedRequest) {
      toast.error("Vui lòng chọn lớp học");
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.put(`/staff/enrollment/requests/${selectedRequest._id}`, {
        action: "approve",
        classId: selectedClassId,
      });

      if (res.data?.success) {
        toast.success(`Đã xếp lớp thành công cho học viên ${selectedRequest.student?.fullName}`);
        setShowAssignModal(false);
        fetchPendingRequests(); // Refresh data
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi xếp lớp");
    } finally {
      setSubmitting(false);
    }
  };


  const filteredRequests = requests.filter(r => {
    const sName = r.student?.fullName?.toLowerCase() || "";
    const sCode = r.student?.studentCode?.toLowerCase() || "";
    const cName = r.course?.name?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();
    return sName.includes(search) || sCode.includes(search) || cName.includes(search);
  });


  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
      
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <LayoutDashboard className="w-6 h-6 text-white" />
               </div>
               Sắp Xếp Lớp Học
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Duyệt yêu cầu đăng ký và phân bổ học viên vào lớp phù hợp
            </p>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-100">
             <Clock size={20} />
             <span className="font-bold text-lg">{requests.length}</span>
             <span className="text-sm font-medium">Yêu cầu chờ xếp lớp</span>
          </div>
        </div>

        
        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên học viên, mã HV, tên khóa học..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex items-center text-sm text-gray-500 gap-2">
                 <Filter size={16} />
                 <span>Hiển thị: <strong>{filteredRequests.length}</strong> kết quả</span>
              </div>
           </div>
        </Card>

    
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          {filteredRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4">Học Viên</th>
                    <th className="px-6 py-4">Khóa Học Đăng Ký</th>
                    <th className="px-6 py-4">Ngày Yêu Cầu</th>
                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.map((req) => (
                    <tr key={req._id} className="hover:bg-blue-50/30 transition-colors group">
                      
                     
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                            {req.student?.fullName?.charAt(0).toUpperCase() || <User size={16}/>}
                          </div>
                          <div>
                            <p className="font-bold text-[var(--color-primary)]">{req.student?.fullName || req.student?.user?.fullName}</p>
                            <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-1">
                              {req.student?.studentCode || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                    
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-gray-800 font-medium">
                            <BookOpen size={16} className="text-[var(--color-secondary)]" />
                            {req.course?.name || "N/A"}
                         </div>
                         <div className="text-xs text-gray-500 mt-1 pl-6">
                            Mã: {req.course?.courseCode || req.course?.code || "---"}
                         </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                         {req.createdAt ? new Date(req.createdAt).toLocaleDateString("vi-VN") : "---"}
                      </td>

                     
                      <td className="px-6 py-4 text-center">
                         <Badge variant="warning" className="whitespace-nowrap px-3 py-1">
                            Chờ xếp lớp
                         </Badge>
                      </td>

                      
                      <td className="px-6 py-4 text-right">
                         <Button 
                            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-sm flex items-center gap-2 ml-auto h-8 px-3 text-xs"
                            onClick={() => openAssignModal(req)}
                         >
                            <School size={14} /> Xếp Lớp
                         </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="p-4 bg-gray-50 rounded-full mb-3 shadow-inner">
                  <CheckCircle size={40} className="text-emerald-400" />
               </div>
               <p className="text-lg font-medium text-gray-600">Không có yêu cầu chờ xếp lớp</p>
               <p className="text-sm mt-1">Tất cả yêu cầu đã được xử lý hoặc không tìm thấy kết quả.</p>
            </div>
          )}
        </Card>

      </div>

    
      {showAssignModal && selectedRequest && (
        <Modal 
           isOpen={showAssignModal} 
           onClose={() => setShowAssignModal(false)} 
           title="Xếp Lớp Cho Học Viên" 
           size="lg"
        >
           <div className="space-y-6 p-1">
              
              {/* Student Summary */}
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-blue-600 text-lg shadow-sm border border-blue-200">
                    {selectedRequest.student?.fullName?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1">
                    <h3 className="font-bold text-[var(--color-primary)] text-lg">{selectedRequest.student?.fullName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="info" className="text-xs">{selectedRequest.student?.studentCode}</Badge>
                        <span className="text-sm text-gray-600">Đăng ký: <strong className="text-blue-700">{selectedRequest.course?.name}</strong></span>
                    </div>
                 </div>
              </div>

            
              <div>
                 <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2 uppercase tracking-wide">
                    <School size={16} className="text-[var(--color-secondary)]" /> Danh sách lớp phù hợp
                 </h4>
                 
                 <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar bg-gray-50 p-2 rounded-lg border border-gray-100">
                    {classesMap[selectedRequest.course?._id]?.length > 0 ? (
                       classesMap[selectedRequest.course?._id].map(cls => {
                          // Safe access to max/current
                          let max = 30;
                          let current = 0;
                          if (cls.capacity && typeof cls.capacity === 'object') {
                             max = cls.capacity.max || 30;
                             current = cls.capacity.current || 0;
                          } else if (typeof cls.capacity === 'number') {
                             max = cls.capacity;
                          }
                          if (typeof cls.currentEnrollment === 'number') {
                             current = cls.currentEnrollment;
                          }

                          const available = max - current;
                          const isFull = available <= 0;
                          const isSelected = selectedClassId === cls._id;

                          return (
                             <div 
                                key={cls._id}
                                onClick={() => !isFull && setSelectedClassId(cls._id)}
                                className={`
                                   relative p-4 rounded-xl border cursor-pointer transition-all flex justify-between items-center group bg-white
                                   ${isSelected 
                                      ? 'border-[var(--color-secondary)] ring-1 ring-[var(--color-secondary)] shadow-md' 
                                      : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                                   }
                                   ${isFull ? 'opacity-60 cursor-not-allowed bg-gray-100 grayscale' : ''}
                                `}
                             >
                                <div>
                                   <div className="flex items-center gap-2">
                                      <p className={`font-bold text-sm transition-colors ${isSelected ? 'text-[var(--color-secondary)]' : 'text-gray-800'}`}>
                                         {cls.name}
                                      </p>
                                      {isSelected && <CheckCircle size={16} className="text-[var(--color-secondary)] fill-white" />}
                                   </div>
                                   <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                                      <span className="flex items-center gap-1 bg-gray-100 px-1.5 py-0.5 rounded">
                                        <Calendar size={10}/> 
                                        {formatSchedule(cls.schedule)} {/* Sử dụng hàm formatSchedule đã sửa */}
                                      </span>
                                      <span className="flex items-center gap-1"><Users size={10}/> {current}/{max} HV</span>
                                   </div>
                                </div>

                                <div className="text-right">
                                   {isFull ? (
                                      <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full">Hết chỗ</span>
                                   ) : (
                                      <div className="flex flex-col items-end">
                                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                                            Còn {available} chỗ
                                         </span>
                                      </div>
                                   )}
                                </div>
                             </div>
                          );
                       })
                    ) : (
                       <div className="p-8 text-center flex flex-col items-center">
                          <XCircle size={32} className="text-gray-300 mb-2" />
                          <p className="text-gray-500 text-sm font-medium">Không tìm thấy lớp học nào cho khóa này.</p>
                          <p className="text-xs text-gray-400 mt-1">Vui lòng kiểm tra lại hoặc tạo lớp mới.</p>
                       </div>
                    )}
                 </div>
              </div>

             
              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                 <Button variant="outline" onClick={() => setShowAssignModal(false)} disabled={submitting}>Hủy bỏ</Button>
                 <Button 
                    className="bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white shadow-md min-w-[140px]"
                    onClick={handleAssignSubmit}
                    disabled={!selectedClassId || submitting}
                    loading={submitting}
                 >
                    <CheckCircle size={18} className="mr-2" />
                    Xác nhận xếp lớp
                 </Button>
              </div>

           </div>
        </Modal>
      )}

    </div>
  );
};

export default AssignClassesPage;