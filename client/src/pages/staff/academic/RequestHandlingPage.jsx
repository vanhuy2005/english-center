import React, { useState, useEffect } from "react";
import { 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Filter, 
  Search, 
  Clock, 
  FileText,
  User,
  RefreshCw,
  ArrowRight,
  PauseCircle,
  HelpCircle,
  MoreHorizontal,
  BookOpen,
  Eye
} from "lucide-react";
import { 
  Card, 
  Button, 
  Badge, 
  Loading, 
  Modal, 
  Input 
} from "../../../components/common"; 
import api from "../../../services/api";
import { toast } from "react-hot-toast";

// --- HELPERS: Config hiển thị tiếng Việt & Màu sắc ---
const getTypeConfig = (type) => {
  const normalizedType = type?.toLowerCase() || "";
  const map = {
    leave: { label: "Xin nghỉ phép", color: "secondary", icon: <Clock size={14} /> },
    makeup: { label: "Học bù", color: "info", icon: <RefreshCw size={14} /> },
    transfer: { label: "Chuyển lớp", color: "primary", icon: <ArrowRight size={14} /> },
    pause: { label: "Bảo lưu", color: "warning", icon: <PauseCircle size={14} /> },
    reserve: { label: "Bảo lưu", color: "warning", icon: <PauseCircle size={14} /> }, 
    resume: { label: "Học lại", color: "success", icon: <RefreshCw size={14} /> },
    course_enrollment: { label: "Đăng ký môn", color: "primary", icon: <FileText size={14} /> },
    withdrawal: { label: "Thôi học", color: "danger", icon: <XCircle size={14} /> },
  };
  return map[normalizedType] || { label: type || "Khác", color: "default", icon: <HelpCircle size={14} /> };
};

const getStatusConfig = (status) => {
  switch (status) {
    case 'pending': 
      return { label: 'Chờ xử lý', variant: 'warning', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'approved': 
      return { label: 'Đã duyệt', variant: 'success', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'rejected': 
      return { label: 'Đã từ chối', variant: 'danger', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
    default: 
      return { label: 'Không rõ', variant: 'default', bg: 'bg-gray-100 text-gray-700 border-gray-200' };
  }
};

const RequestHandlingPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false); // Modal xem chi tiết
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [actionType, setActionType] = useState(""); // 'approved' | 'rejected'
  const [processNote, setProcessNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/academic/requests");
      const data = response.data?.requests || response.data?.data?.requests || response.data || [];
      const requestsList = Array.isArray(data) ? data : [];
      setRequests(requestsList);

      setStats({
        pending: requestsList.filter((r) => r.status === "pending").length,
        approved: requestsList.filter((r) => r.status === "approved").length,
        rejected: requestsList.filter((r) => r.status === "rejected").length,
      });
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenActionModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setProcessNote("");
    setShowModal(true);
  };

  const handleOpenDetailModal = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest) return;
    
    if (actionType === "rejected" && !processNote.trim()) {
      return toast.error("Vui lòng nhập lý do từ chối");
    }

    try {
      setProcessing(true);
      const endpoint = actionType === "approved" ? "approve" : "reject";
      const payload = actionType === "approved" 
        ? { note: processNote } 
        : { reason: processNote, note: processNote };

      await api.put(`/staff/academic/requests/${selectedRequest._id}/${endpoint}`, payload);
      
      toast.success(actionType === "approved" ? "Đã duyệt yêu cầu" : "Đã từ chối yêu cầu");
      setShowModal(false);
      fetchRequests(); 
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Lỗi khi xử lý yêu cầu");
    } finally {
      setProcessing(false);
    }
  };

  const filteredRequests = requests.filter(r => {
    const matchesSearch = 
      r.student?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      r.student?.studentCode?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass }) => (
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-all bg-white">
      <div className="p-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <h3 className={`text-3xl font-extrabold ${colorClass}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} ${colorClass}`}>
          <Icon size={24} />
        </div>
      </div>
    </Card>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
               <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                  <ClipboardList className="w-6 h-6 text-white" />
               </div>
               Xử Lý Yêu Cầu
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Tiếp nhận và xử lý các yêu cầu học vụ từ học viên
            </p>
          </div>
        </div>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            title="Chờ xử lý" 
            value={stats.pending} 
            icon={Clock} 
            colorClass="text-amber-600" 
            bgClass="bg-amber-50"
          />
          <StatCard 
            title="Đã duyệt" 
            value={stats.approved} 
            icon={CheckCircle} 
            colorClass="text-emerald-600" 
            bgClass="bg-emerald-50"
          />
          <StatCard 
            title="Đã từ chối" 
            value={stats.rejected} 
            icon={XCircle} 
            colorClass="text-rose-600" 
            bgClass="bg-rose-50"
          />
        </div>

        {/* --- TOOLBAR --- */}
        <Card className="border border-gray-200 shadow-sm">
           <div className="p-4 flex flex-col md:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                 <input 
                    type="text" 
                    placeholder="Tìm kiếm theo tên hoặc mã học viên..." 
                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all text-sm"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="relative w-full md:w-64">
                 <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                 <select 
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm cursor-pointer"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                 >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="pending">Chờ xử lý</option>
                    <option value="approved">Đã duyệt</option>
                    <option value="rejected">Đã từ chối</option>
                 </select>
              </div>
           </div>
        </Card>

        {/* --- TABLE --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 whitespace-nowrap">Học Viên</th>
                  <th className="px-6 py-4 whitespace-nowrap">Loại Yêu Cầu</th>
                  <th className="px-6 py-4 w-1/3 min-w-[200px]">Lý Do / Chi Tiết</th>
                  <th className="px-6 py-4 whitespace-nowrap">Trạng Thái</th>
                  <th className="px-6 py-4 text-right whitespace-nowrap">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const typeConf = getTypeConfig(req.type);
                    const statusConf = getStatusConfig(req.status);
                    
                    return (
                      <tr key={req._id} className="hover:bg-blue-50/30 transition-colors group">
                        
                        {/* Student Info */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200 text-xs shrink-0">
                              {req.student?.fullName?.charAt(0).toUpperCase() || <User size={16}/>}
                            </div>
                            <div>
                              <p className="font-bold text-[var(--color-primary)]">{req.student?.fullName}</p>
                              <p className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                                {req.student?.studentCode}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="px-6 py-4">
                           <div className="flex flex-col gap-1">
                             <Badge variant={typeConf.color} className="flex w-fit items-center gap-1.5 px-2.5 py-1 text-xs whitespace-nowrap">
                                {typeConf.icon} {typeConf.label}
                             </Badge>
                             <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(req.createdAt).toLocaleDateString("vi-VN")}
                             </span>
                           </div>
                        </td>

                        {/* Reason & Detail */}
                        <td className="px-6 py-4">
                           <div className="space-y-1">
                              {req.class && (
                                 <p className="text-xs font-semibold text-gray-700 bg-gray-50 px-2 py-0.5 rounded w-fit flex items-center gap-1">
                                    <BookOpen size={12}/> {req.class.name}
                                 </p>
                              )}
                              <p className="text-gray-600 line-clamp-2 italic" title={req.reason}>
                                 "{req.reason || "Không có nội dung"}"
                              </p>
                           </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                           <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusConf.bg}`}>
                              {statusConf.label}
                           </span>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                           {req.status === 'pending' ? (
                              <div className="flex justify-end gap-3">
                                 {/* Nút Từ chối - Đỏ Đậm */}
                                 <Button 
                                    size="sm" 
                                    className="bg-rose-600 hover:bg-rose-700 text-white border-none h-9 px-4 shadow-sm transition-all"
                                    onClick={() => handleOpenActionModal(req, 'rejected')}
                                 >
                                    <XCircle size={14} className="mr-1.5" /> Từ chối
                                 </Button>

                                 {/* Nút Duyệt - Xanh */}
                                 <Button 
                                    size="sm" 
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-9 px-4 shadow-md transition-all hover:-translate-y-0.5"
                                    onClick={() => handleOpenActionModal(req, 'approved')}
                                 >
                                    <CheckCircle size={14} className="mr-1.5" /> Duyệt
                                 </Button>
                              </div>
                           ) : (
                              <div className="flex justify-end">
                                 {/* Nút Chi Tiết - Màu Xám/Outline - Có sự kiện onClick */}
                                 <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="border-gray-300 text-gray-600 hover:bg-gray-100 hover:text-[var(--color-primary)] h-8 px-3 transition-colors"
                                    onClick={() => handleOpenDetailModal(req)}
                                 >
                                    <Eye size={14} className="mr-1.5"/> Chi tiết
                                 </Button>
                              </div>
                           )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center text-gray-400">
                       <div className="flex flex-col items-center">
                          <div className="p-4 bg-gray-50 rounded-full mb-3">
                             <ClipboardList size={40} className="text-gray-300" />
                          </div>
                          <p className="font-medium">Không tìm thấy yêu cầu nào</p>
                       </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

      </div>

      {/* --- ACTION CONFIRMATION MODAL --- */}
      {showModal && selectedRequest && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={
             <div className="flex items-center gap-2">
                {actionType === 'approved' ? <CheckCircle className="text-emerald-600" /> : <XCircle className="text-rose-600" />}
                <span className={actionType === 'approved' ? 'text-emerald-800' : 'text-rose-800'}>
                   {actionType === 'approved' ? "Phê Duyệt Yêu Cầu" : "Từ Chối Yêu Cầu"}
                </span>
             </div>
          }
          size="md"
        >
          <div className="space-y-4 p-1">
             <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Thông tin yêu cầu</p>
                <div className="text-sm space-y-2">
                   <p className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <span className="text-gray-600">Học viên:</span> 
                      <span className="font-bold text-[var(--color-primary)]">{selectedRequest.student?.fullName}</span>
                   </p>
                   <p className="flex justify-between items-center">
                      <span className="text-gray-600">Loại yêu cầu:</span> 
                      <Badge variant={getTypeConfig(selectedRequest.type).color} className="text-xs">{getTypeConfig(selectedRequest.type).label}</Badge>
                   </p>
                   <div className="pt-2 mt-2 bg-white p-3 rounded border border-gray-200">
                      <span className="text-gray-500 text-xs font-bold uppercase block mb-1">Lý do:</span>
                      <p className="italic text-gray-800">"{selectedRequest.reason}"</p>
                   </div>
                </div>
             </div>

             <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-1">
                   {actionType === 'approved' ? "Ghi chú phản hồi (Tùy chọn)" : "Lý do từ chối (Bắt buộc)"}
                   {actionType === 'rejected' && <span className="text-red-500">*</span>}
                </label>
                <textarea 
                   className={`w-full p-3 bg-white border rounded-lg focus:ring-2 focus:border-transparent outline-none text-sm min-h-[100px] ${actionType === 'rejected' ? 'border-rose-200 focus:ring-rose-500' : 'border-gray-300 focus:ring-emerald-500'}`}
                   placeholder={actionType === 'approved' ? "Nhập lời nhắn cho học viên..." : "Vui lòng nhập lý do từ chối..."}
                   value={processNote}
                   onChange={(e) => setProcessNote(e.target.value)}
                />
             </div>

             <div className="flex justify-end pt-4 border-t border-gray-100 gap-3">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy bỏ</Button>
                <Button 
                   className={`text-white shadow-md min-w-[120px] ${actionType === 'approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'}`}
                   onClick={handleConfirmAction}
                   loading={processing}
                >
                   {actionType === 'approved' ? "Xác nhận Duyệt" : "Xác nhận Từ chối"}
                </Button>
             </div>
          </div>
        </Modal>
      )}

      {/* --- DETAIL VIEW MODAL --- */}
      {showDetailModal && selectedRequest && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title="Chi Tiết Yêu Cầu"
          size="md"
        >
           <div className="space-y-4 p-1">
              <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
                 <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center font-bold text-gray-500 border border-gray-200">
                    {selectedRequest.student?.fullName?.charAt(0).toUpperCase()}
                 </div>
                 <div>
                    <h4 className="font-bold text-[var(--color-primary)] text-lg">{selectedRequest.student?.fullName}</h4>
                    <p className="text-xs text-gray-500 font-mono">{selectedRequest.student?.studentCode}</p>
                 </div>
                 <div className="ml-auto">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusConfig(selectedRequest.status).bg}`}>
                       {getStatusConfig(selectedRequest.status).label}
                    </span>
                 </div>
              </div>

              <div className="space-y-3 text-sm text-gray-700">
                 <p className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Loại yêu cầu:</span>
                    <span className="font-medium">{getTypeConfig(selectedRequest.type).label}</span>
                 </p>
                 <p className="flex justify-between border-b border-gray-100 pb-2">
                    <span className="text-gray-500">Ngày tạo:</span>
                    <span>{new Date(selectedRequest.createdAt).toLocaleString("vi-VN")}</span>
                 </p>
                 {selectedRequest.class && (
                    <p className="flex justify-between border-b border-gray-100 pb-2">
                       <span className="text-gray-500">Lớp liên quan:</span>
                       <span className="font-medium">{selectedRequest.class.name}</span>
                    </p>
                 )}
                 <div className="pt-2">
                    <span className="text-gray-500 block mb-1">Lý do:</span>
                    <p className="bg-gray-50 p-3 rounded border border-gray-200 italic">"{selectedRequest.reason}"</p>
                 </div>
                 
                 {/* Hiển thị phản hồi nếu có */}
                 {(selectedRequest.note || selectedRequest.rejectReason) && (
                    <div className="pt-2 mt-4 border-t border-gray-100">
                       <span className="text-gray-500 block mb-1 font-bold">Phản hồi từ trung tâm:</span>
                       <p className="bg-blue-50 p-3 rounded border border-blue-100 text-blue-800">
                          {selectedRequest.note || selectedRequest.rejectReason}
                       </p>
                    </div>
                 )}
              </div>

              <div className="flex justify-end pt-4">
                 <Button variant="outline" onClick={() => setShowDetailModal(false)}>Đóng</Button>
              </div>
           </div>
        </Modal>
      )}

    </div>
  );
};

export default RequestHandlingPage;