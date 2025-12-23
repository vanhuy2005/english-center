import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Loading,
  Badge,
  Modal,
  Input,
} from "../../../components/common";
import {
  ClipboardList,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
  ArrowRight,
  BookOpen
} from "lucide-react";
import api from "../../../services/api";
import toast from "react-hot-toast";

// Helper: Safe data extraction
const safeExtract = (res) => {
  if (!res) return [];
  if (res.data?.data?.requests) return res.data.data.requests;
  if (Array.isArray(res.data?.data)) return res.data.data;
  if (Array.isArray(res.data)) return res.data;
  return [];
};

const RequestManagementPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    status: "pending",
    type: "",
    search: "", // Added search to state
  });

  // Modal State
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [processAction, setProcessAction] = useState("");
  const [processNote, setProcessNote] = useState("");
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    fetchRequests();
  }, [pagination.page, filters]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get("/staff/enrollment/requests", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          ...filters,
        },
      });

      const requestsList = safeExtract(response);
      setRequests(requestsList);

      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      } else {
         // Fallback pagination
         setPagination(prev => ({
            ...prev,
            total: requestsList.length,
            totalPages: Math.ceil(requestsList.length / prev.limit) || 1
         }));
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Không thể tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessClick = (request, action) => {
    setSelectedRequest(request);
    setProcessAction(action);
    setSelectedClassId("");
    setShowProcessModal(true);
  };

  const handleProcessRequest = async () => {
    if (!selectedRequest || !processAction) return;

    try {
      setLoading(true);
      const body = { action: processAction, note: processNote };
      
      // Nếu là duyệt yêu cầu đăng ký học, cần gửi kèm classId
      if (
        processAction === "approve" &&
        selectedRequest?.type === "course_enrollment" &&
        selectedClassId
      ) {
        body.classId = selectedClassId;
      }

      const response = await api.put(
        `/staff/enrollment/requests/${selectedRequest._id}`,
        body
      );

      if (response.data.success) {
        toast.success(
          processAction === "approve"
            ? "Đã phê duyệt yêu cầu thành công!"
            : "Đã từ chối yêu cầu!"
        );
        setShowProcessModal(false);
        setSelectedRequest(null);
        setProcessAction("");
        setProcessNote("");
        setAvailableClasses([]);
        setSelectedClassId("");
        fetchRequests();
      }
    } catch (error) {
      console.error("Error processing request:", error);
      toast.error(error.response?.data?.message || "Không thể xử lý yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classes for assignment when processing enrollment requests
  useEffect(() => {
    const fetchClassesIfNeeded = async () => {
      if (
        showProcessModal &&
        selectedRequest &&
        selectedRequest.type === "course_enrollment" &&
        processAction === "approve"
      ) {
        try {
          setLoadingClasses(true);
          const res = await api.get("/staff/enrollment/classes", {
            params: {
              status: "upcoming,ongoing",
              course: selectedRequest.course?._id, // Filter by course if API supports
            },
          });
          
          let classList = [];
          if (res.data?.data?.classes) classList = res.data.data.classes;
          else if (Array.isArray(res.data?.data)) classList = res.data.data;
          else if (Array.isArray(res.data)) classList = res.data;

          setAvailableClasses(classList);
        } catch (err) {
          console.error("Error fetching classes:", err);
          toast.error("Không thể tải danh sách lớp học");
          setAvailableClasses([]);
        } finally {
            setLoadingClasses(false);
        }
      }
    };
    fetchClassesIfNeeded();
  }, [showProcessModal, selectedRequest, processAction]);

  // --- UI HELPERS ---

  const getTypeConfig = (type) => {
    const map = {
      transfer: { label: "Đổi lớp", color: "info", icon: <RefreshCw size={14} /> },
      pause: { label: "Bảo lưu", color: "warning", icon: <Clock size={14} /> },
      resume: { label: "Học lại", color: "success", icon: <CheckCircle size={14} /> },
      leave: { label: "Xin nghỉ", color: "secondary", icon: <FileText size={14} /> },
      course_enrollment: { label: "Đăng ký môn", color: "primary", icon: <BookOpen size={14} /> }, // Custom type logic
    };
    return map[type] || { label: type, color: "secondary", icon: <FileText size={14} /> };
  };

  const getStatusConfig = (status) => {
    switch(status) {
        case 'pending': return { label: 'Chờ xử lý', color: 'bg-amber-100 text-amber-700 border-amber-200' };
        case 'approved': return { label: 'Đã duyệt', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
        case 'rejected': return { label: 'Từ chối', color: 'bg-rose-100 text-rose-700 border-rose-200' };
        default: return { label: status, color: 'bg-gray-100 text-gray-700 border-gray-200' };
    }
  };

  const StatCard = ({ label, value, icon: Icon, colorClass }) => (
    <Card className="border border-gray-200 shadow-sm bg-white">
      <CardContent className="p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
          <h3 className={`text-2xl font-bold ${colorClass}`}>{value}</h3>
        </div>
        <div className={`p-3 rounded-xl bg-gray-50 ${colorClass}`}>
          <Icon size={24} />
        </div>
      </CardContent>
    </Card>
  );

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
              Quản lý và phê duyệt các yêu cầu học vụ từ học viên
            </p>
          </div>
        </div>

        {/* --- STATS OVERVIEW (Client-side calculation for current view) --- */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard 
                label="Chờ xử lý" 
                value={requests.filter(r => r.status === 'pending').length} 
                icon={Clock} 
                colorClass="text-amber-600" 
            />
            <StatCard 
                label="Đã duyệt" 
                value={requests.filter(r => r.status === 'approved').length} 
                icon={CheckCircle} 
                colorClass="text-emerald-600" 
            />
            <StatCard 
                label="Từ chối" 
                value={requests.filter(r => r.status === 'rejected').length} 
                icon={XCircle} 
                colorClass="text-rose-600" 
            />
            <StatCard 
                label="Tổng yêu cầu" 
                value={pagination.total} 
                icon={FileText} 
                colorClass="text-blue-600" 
            />
        </div>

        {/* --- FILTERS TOOLBAR --- */}
        <Card className="border border-gray-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              
              {/* Search */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Tìm tên học viên, mã yêu cầu..."
                  value={filters.search}
                  onChange={(e) => {
                      setFilters(prev => ({...prev, search: e.target.value}));
                      setPagination(prev => ({...prev, page: 1}));
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none transition-all text-sm"
                />
              </div>

              {/* Status Filter */}
              <div className="relative w-full md:w-48">
                <select
                  className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm cursor-pointer"
                  value={filters.status}
                  onChange={(e) => {
                      setFilters(prev => ({...prev, status: e.target.value}));
                      setPagination(prev => ({...prev, page: 1}));
                  }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Chờ xử lý</option>
                  <option value="approved">Đã duyệt</option>
                  <option value="rejected">Từ chối</option>
                </select>
              </div>

              {/* Type Filter */}
              <div className="relative w-full md:w-48">
                <select
                  className="w-full pl-3 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm cursor-pointer"
                  value={filters.type}
                  onChange={(e) => {
                      setFilters(prev => ({...prev, type: e.target.value}));
                      setPagination(prev => ({...prev, page: 1}));
                  }}
                >
                  <option value="">Tất cả loại</option>
                  <option value="course_enrollment">Đăng ký môn</option>
                  <option value="transfer">Đổi lớp</option>
                  <option value="pause">Bảo lưu</option>
                  <option value="resume">Học lại</option>
                  <option value="leave">Xin nghỉ</option>
                </select>
              </div>

              {/* Reset */}
              <Button
                variant="outline"
                className="w-full md:w-auto border-gray-300 text-gray-600 hover:bg-gray-100 whitespace-nowrap"
                onClick={() => {
                  setFilters({ status: "pending", type: "", search: "" });
                  setPagination((prev) => ({ ...prev, page: 1 }));
                }}
              >
                <RefreshCw size={16} className="mr-2" /> Đặt lại
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- TABLE CONTENT --- */}
        <Card className="border border-gray-200 shadow-sm overflow-hidden bg-white">
          {loading ? (
             <div className="h-64 flex items-center justify-center">
                <Loading size="large" />
             </div>
          ) : requests.length > 0 ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50/80 text-gray-500 font-semibold text-xs uppercase border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 whitespace-nowrap">Học Viên</th>
                      <th className="px-6 py-4 whitespace-nowrap">Yêu Cầu</th>
                      <th className="px-6 py-4 whitespace-nowrap">Chi Tiết</th>
                      <th className="px-6 py-4 whitespace-nowrap">Trạng Thái</th>
                      <th className="px-6 py-4 whitespace-nowrap">Ngày Tạo</th>
                      <th className="px-6 py-4 text-right whitespace-nowrap">Hành Động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {requests.map((request) => {
                        const typeConfig = getTypeConfig(request.type);
                        const statusConfig = getStatusConfig(request.status);
                        
                        return (
                          <tr key={request._id} className="hover:bg-blue-50/30 transition-colors group">
                            
                            {/* Student */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold border border-gray-200">
                                  {request.student?.fullName?.charAt(0).toUpperCase() || <User size={16} />}
                                </div>
                                <div>
                                  <p className="font-bold text-[var(--color-primary)]">{request.student?.fullName || "N/A"}</p>
                                  <p className="text-xs text-gray-500 font-mono">{request.student?.studentCode}</p>
                                </div>
                              </div>
                            </td>

                            {/* Type */}
                            <td className="px-6 py-4">
                                <Badge variant={typeConfig.color} className="flex w-fit items-center gap-1.5 px-2.5 py-1">
                                    {typeConfig.icon} {typeConfig.label}
                                </Badge>
                            </td>

                            {/* Details (Reason/Class) */}
                            <td className="px-6 py-4 max-w-xs">
                                <div className="space-y-1">
                                    {request.class && (
                                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                            <BookOpen size={12} /> {request.class.name}
                                        </p>
                                    )}
                                    {request.type === 'transfer' && request.targetClass && (
                                        <p className="text-xs text-[var(--color-secondary)] flex items-center gap-1">
                                            <ArrowRight size={12} /> {request.targetClass.name}
                                        </p>
                                    )}
                                    <p className="text-xs text-gray-500 truncate" title={request.reason}>
                                        "{request.reason || 'Không có lý do'}"
                                    </p>
                                </div>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConfig.color}`}>
                                    {statusConfig.label}
                                </span>
                            </td>

                            {/* Date */}
                            <td className="px-6 py-4 text-xs text-gray-500">
                                {request.createdAt ? new Date(request.createdAt).toLocaleDateString("vi-VN") : "---"}
                            </td>

                            {/* Actions - ALWAYS VISIBLE */}
                            <td className="px-6 py-4 text-right">
                                {request.status === "pending" ? (
                                    <div className="flex justify-end gap-2">
                                        <Button 
                                            size="small" 
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white border-none h-8 px-3 shadow-sm"
                                            onClick={() => handleProcessClick(request, "approve")}
                                        >
                                            <CheckCircle size={14} className="mr-1.5" /> Duyệt
                                        </Button>
                                        <Button 
                                            size="small" 
                                            className="bg-white border-rose-200 text-rose-600 hover:bg-rose-50 h-8 px-3"
                                            onClick={() => handleProcessClick(request, "reject")}
                                        >
                                            <XCircle size={14} className="mr-1.5" /> Từ chối
                                        </Button>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">
                                        Đã xử lý {request.processedAt && new Date(request.processedAt).toLocaleDateString("vi-VN")}
                                    </span>
                                )}
                            </td>

                          </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>

              {/* --- PAGINATION --- */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/30 flex flex-col md:flex-row justify-between items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">
                  Hiển thị <span className="text-gray-900 font-bold">{(pagination.page - 1) * pagination.limit + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> / <span className="text-gray-900 font-bold">{pagination.total}</span> yêu cầu
                </span>
                
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                  <button
                    disabled={pagination.page === 1}
                    onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="text-sm font-semibold text-[var(--color-primary)] px-4">
                    Trang {pagination.page}
                  </span>
                  <button
                    disabled={pagination.page === pagination.totalPages}
                    onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    className="p-2 rounded-md hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <div className="p-4 bg-gray-50 rounded-full mb-3 shadow-inner">
                  <ClipboardList size={32} className="opacity-50" />
               </div>
               <p className="text-lg font-medium">Không có yêu cầu nào</p>
               <p className="text-sm mt-1">Thay đổi bộ lọc để tìm kiếm</p>
            </div>
          )}
        </Card>

      </div>

      {/* --- PROCESS MODAL --- */}
      {showProcessModal && selectedRequest && (
        <Modal
          isOpen={showProcessModal}
          onClose={() => {
            setShowProcessModal(false);
            setSelectedRequest(null);
            setProcessAction("");
            setProcessNote("");
          }}
          title={
            <div className="flex items-center gap-2">
                {processAction === "approve" 
                    ? <CheckCircle className="text-emerald-600" /> 
                    : <XCircle className="text-rose-600" />
                }
                <span>{processAction === "approve" ? "Phê duyệt yêu cầu" : "Từ chối yêu cầu"}</span>
            </div>
          }
          size="medium"
        >
          <div className="space-y-5 p-1">
            
            {/* Summary Box */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
               <div className="flex justify-between">
                  <span className="text-xs text-gray-500 uppercase font-bold">Học viên</span>
                  <span className="text-sm font-bold text-[var(--color-primary)]">
                      {selectedRequest.student?.fullName}
                  </span>
               </div>
               <div className="flex justify-between">
                  <span className="text-xs text-gray-500 uppercase font-bold">Loại</span>
                  <Badge variant={getTypeConfig(selectedRequest.type).color} className="text-xs px-2 py-0">
                      {getTypeConfig(selectedRequest.type).label}
                  </Badge>
               </div>
               <div className="border-t border-gray-200 my-2 pt-2">
                  <p className="text-xs text-gray-500 mb-1 font-bold uppercase">Lý do</p>
                  <p className="text-sm text-gray-700 italic bg-white p-2 rounded border border-gray-200">
                      "{selectedRequest.reason || "Không có lý do"}"
                  </p>
               </div>
            </div>

            {/* Approve Logic: Assign Class */}
            {processAction === "approve" && selectedRequest.type === "course_enrollment" && (
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">
                        Xếp lớp cho học viên <span className="text-red-500">*</span>
                    </label>
                    {loadingClasses ? (
                        <div className="py-2 text-center text-xs text-gray-500"><Loading size="small"/> Đang tải danh sách lớp...</div>
                    ) : (
                        <select
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value)}
                        >
                            <option value="">-- Chọn lớp học --</option>
                            {availableClasses.map((c) => {
                                const max = c.capacity?.max || c.maxStudents || 30;
                                const current = c.currentEnrollment || 0;
                                return (
                                    <option key={c._id} value={c._id} disabled={max - current <= 0}>
                                        {c.name} (Còn {Math.max(0, max - current)} chỗ)
                                    </option>
                                );
                            })}
                        </select>
                    )}
                    <p className="text-xs text-gray-500">Chỉ hiện các lớp đang hoạt động/sắp mở của khóa học này.</p>
                </div>
            )}

            {/* Note Input */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Ghi chú xử lý (Tùy chọn)</label>
                <textarea
                    className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] outline-none text-sm"
                    rows="3"
                    value={processNote}
                    onChange={(e) => setProcessNote(e.target.value)}
                    placeholder="Nhập lý do duyệt/từ chối hoặc ghi chú thêm..."
                />
            </div>

            {/* Warning for Approve */}
            {processAction === "approve" && (
                <div className="flex items-start gap-3 p-3 bg-emerald-50 text-emerald-800 rounded-lg text-xs border border-emerald-100">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>Hệ thống sẽ tự động cập nhật trạng thái học viên và gửi thông báo.</p>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                <Button 
                    variant="outline" 
                    onClick={() => { setShowProcessModal(false); setSelectedRequest(null); }}
                >
                    Hủy bỏ
                </Button>
                <Button
                    className={`text-white shadow-md ${
                        processAction === "approve" 
                        ? "bg-emerald-600 hover:bg-emerald-700" 
                        : "bg-rose-600 hover:bg-rose-700"
                    }`}
                    onClick={handleProcessRequest}
                    loading={loading}
                    disabled={processAction === "approve" && selectedRequest.type === "course_enrollment" && !selectedClassId}
                >
                    {processAction === "approve" ? "Xác nhận Duyệt" : "Xác nhận Từ chối"}
                </Button>
            </div>

          </div>
        </Modal>
      )}
    </div>
  );
};

export default RequestManagementPage;