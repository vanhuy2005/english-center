import React, { useState, useEffect } from "react";
import { studentService } from "../../services";
import Card from "../../components/common/Card";
import Loading from "../../components/common/Loading";
import Badge from "../../components/common/Badge";
import { useNavigate } from "react-router-dom";
import { 
  FileText, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  BookOpen, 
  MessageSquare,
  AlertCircle,
  MoreHorizontal
} from "lucide-react";

const RequestListPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchMyRequests();
  }, []);

  const fetchMyRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await studentService.getMyRequests();

      // Xử lý response an toàn cho mọi trường hợp
      if (Array.isArray(response)) {
        setRequests(response);
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else if (response?.data && Array.isArray(response.data)) {
        setRequests(response.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Error fetching requests:", err);
      setError(err.response?.data?.message || "Không thể tải danh sách yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  // --- CONFIG HELPER ---
  const getStatusConfig = (status) => {
    const map = {
      pending: { color: "text-amber-600 bg-amber-50", label: "Chờ xử lý", icon: Clock },
      approved: { color: "text-emerald-600 bg-emerald-50", label: "Đã duyệt", icon: CheckCircle },
      rejected: { color: "text-rose-600 bg-rose-50", label: "Từ chối", icon: XCircle },
      processing: { color: "text-blue-600 bg-blue-50", label: "Đang xử lý", icon: MoreHorizontal },
    };
    return map[status] || { color: "text-gray-600 bg-gray-50", label: status, icon: AlertCircle };
  };

  const getTypeLabel = (type) => {
    const map = {
      leave: "Xin nghỉ phép",
      makeup: "Xin học bù",
      transfer: "Chuyển lớp",
      pause: "Bảo lưu",
      consultation: "Tư vấn",
      course_enrollment: "Đăng ký khóa học",
    };
    return map[type] || "Khác";
  };

  // --- FILTER & STATS ---
  const filteredRequests = filter === "all" ? requests : requests.filter((r) => r.status === filter);
  
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu Cầu Của Tôi</h1>
          <p className="text-gray-500 mt-1">Theo dõi trạng thái các đơn từ và hỗ trợ</p>
        </div>
        <button
          onClick={() => navigate("/requests/create")} 
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--color-primary)] hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all active:scale-95"
        >
          <Plus size={18} />
          <span>Tạo yêu cầu mới</span>
        </button>
      </div>

      {/* 2. Stats Cards (Clean Style - No Border) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Tổng yêu cầu" 
          value={stats.total} 
          icon={FileText} 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <StatCard 
          label="Chờ xử lý" 
          value={stats.pending} 
          icon={Clock} 
          color="text-amber-600" 
          bg="bg-amber-50" 
        />
        <StatCard 
          label="Đã duyệt" 
          value={stats.approved} 
          icon={CheckCircle} 
          color="text-emerald-600" 
          bg="bg-emerald-50" 
        />
        <StatCard 
          label="Từ chối" 
          value={stats.rejected} 
          icon={XCircle} 
          color="text-rose-600" 
          bg="bg-rose-50" 
        />
      </div>

      {/* 3. Filter Tabs (Pill Style) */}
      <div className="flex flex-wrap gap-2 pb-2">
        {["all", "pending", "approved", "rejected"].map((key) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === key
                ? "bg-gray-900 text-white shadow-md"
                : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
            }`}
          >
            {key === "all" ? "Tất cả" : getStatusConfig(key).label}
          </button>
        ))}
      </div>

      {/* 4. Requests List */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-lg flex items-center gap-2 border border-red-100">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="p-4 bg-gray-50 rounded-full mb-4">
              <FileText size={40} className="text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">Chưa có dữ liệu phù hợp</p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const statusConf = getStatusConfig(request.status);
            const StatusIcon = statusConf.icon;

            return (
              <Card key={request._id} className="group hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="p-5">
                  {/* Top Row: Type & Status */}
                  <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gray-100 rounded-lg text-gray-600">
                        {request.type === 'consultation' ? <MessageSquare size={20}/> : 
                         request.type === 'course_enrollment' ? <BookOpen size={20}/> : <FileText size={20}/>}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                          {request.title || getTypeLabel(request.type)}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          {new Date(request.createdAt).toLocaleDateString("vi-VN", {
                            hour: '2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 border ${statusConf.color.replace('text-', 'border-').replace('bg-', 'border-opacity-20 ')} ${statusConf.bg} ${statusConf.color}`}>
                      <StatusIcon size={14} strokeWidth={2.5} />
                      {statusConf.label}
                    </div>
                  </div>

                  {/* Middle Row: Content Grid */}
                  <div className="bg-gray-50/80 rounded-xl p-4 mb-4 grid md:grid-cols-2 gap-y-3 gap-x-6">
                    {request.courseName && (
                      <div className="flex items-start gap-2 text-sm">
                        <BookOpen size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs uppercase font-semibold">Khóa học</span>
                          <span className="text-gray-800 font-medium">{request.courseName}</span>
                        </div>
                      </div>
                    )}
                    
                    {request.requestDate && (
                      <div className="flex items-start gap-2 text-sm">
                        <Calendar size={16} className="text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <span className="text-gray-500 block text-xs uppercase font-semibold">Thời gian</span>
                          <span className="text-gray-800 font-medium">
                            {new Date(request.requestDate).toLocaleDateString("vi-VN")}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className={`${request.courseName ? 'col-span-2' : 'col-span-2'} flex items-start gap-2 text-sm`}>
                      <MessageSquare size={16} className="text-gray-400 mt-0.5 shrink-0" />
                      <div>
                        <span className="text-gray-500 block text-xs uppercase font-semibold">Nội dung / Lý do</span>
                        <span className="text-gray-800">{request.reason}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Row: Response (Conditional) */}
                  {request.response && (
                    <div className={`text-sm rounded-xl p-4 flex gap-3 ${
                      request.status === 'approved' ? 'bg-green-50 text-green-900' : 
                      request.status === 'rejected' ? 'bg-red-50 text-red-900' : 'bg-blue-50 text-blue-900'
                    }`}>
                      <div className="mt-0.5 shrink-0">
                        {request.status === 'approved' ? <CheckCircle size={18}/> : <MessageSquare size={18}/>}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-xs uppercase mb-1 opacity-80">
                          Phản hồi từ {request.processorName || "Quản trị viên"}
                        </div>
                        <p className="leading-relaxed">{request.response}</p>
                        {request.processedAt && (
                          <div className="text-xs mt-2 opacity-60 font-medium">
                            {new Date(request.processedAt).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

// --- Sub-component: Stat Card ---
const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <Card className="border border-gray-100 hover:border-gray-200 transition-colors">
    <div className="p-4 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-gray-900">{value}</h4>
      </div>
      <div className={`p-3 rounded-xl ${bg} ${color}`}>
        <Icon size={24} />
      </div>
    </div>
  </Card>
);

export default RequestListPage;