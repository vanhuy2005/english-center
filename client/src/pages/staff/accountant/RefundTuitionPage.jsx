import React, { useState, useEffect } from "react";
import {
  RotateCcw,
  User,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@services/api";
import { receiptService } from "@services/receiptService";
import { toast } from "react-hot-toast";
import { Card, Button, Select, Loading } from "@components/common";

const RefundTuitionPage = () => {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    amount: "",
    date: new Date().toISOString().split('T')[0], // Default to today
    refundMethod: "cash",
    reason: "dropout",
    note: ""
  });

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);

  // Fetch data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get("/students?limit=1000"),
        api.get("/classes?limit=1000"),
      ]);

      const studentsData = studentsRes.data?.data || studentsRes.data?.rows || [];
      const classesData = classesRes.data?.data || classesRes.data || [];

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu học viên/lớp học!");
    } finally {
      setDataLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.studentId || !formData.classId) {
        toast.error("Vui lòng chọn học viên và lớp học!");
        setLoading(false);
        return;
      }
      if (!formData.amount || Number(formData.amount) <= 0) {
        toast.error("Số tiền hoàn phải lớn hơn 0!");
        setLoading(false);
        return;
      }

      // Prepare data for receipt creation
      const receiptData = {
        studentId: formData.studentId,
        classId: formData.classId,
        amount: Number(formData.amount),
        paymentMethod: 'refund', // Mark as refund type
        description: `Hoàn học phí - ${getReasonLabel(formData.reason)}${formData.note ? ` - ${formData.note}` : ''}`,
        note: `Phương thức hoàn: ${formData.refundMethod}`,
      };

      console.log("📝 Sending refund receipt data:", receiptData);

      // Call API to create the refund receipt
      await receiptService.createReceipt(receiptData);

      toast.success("Hoàn học phí thành công! Phiếu hoàn đã được lưu.");
      navigate("/accountant/dashboard");
    } catch (error) {
      console.error("Error refunding tuition:", error);
      toast.error(error.response?.data?.message || "Hoàn học phí thất bại!");
    } finally {
      setLoading(false);
    }
  };

  // Helper to get readable reason label
  const getReasonLabel = (reason) => {
    const map = {
      dropout: "Học viên nghỉ học",
      transfer: "Chuyển lớp",
      overpaid: "Thu thừa",
      other: "Lý do khác"
    };
    return map[reason] || reason;
  };

  // Options for Select components
  const studentOptions = students.map(s => ({ value: s._id, label: `${s.studentCode} - ${s.fullName}` }));
  const classOptions = classes.map(c => ({ value: c._id, label: `${c.name || c.className} (${c.classCode})` }));
  const methodOptions = [
    { value: "cash", label: "Tiền mặt" },
    { value: "bank_transfer", label: "Chuyển khoản" },
    { value: "credit_card", label: "Thẻ tín dụng" },
    { value: "momo", label: "MoMo" },
    { value: "other", label: "Khác" }
  ];
  const reasonOptions = [
    { value: "dropout", label: "Học viên nghỉ học" },
    { value: "transfer", label: "Chuyển lớp" },
    { value: "overpaid", label: "Thu thừa" },
    { value: "other", label: "Lý do khác" }
  ];

  if (dataLoading) return <div className="h-screen flex items-center justify-center bg-gray-50"><Loading size="large" /></div>;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      {/* Full-width container */}
      <div className="w-full space-y-6">
        
        {/* --- HEADER --- */}
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-3">
              <div className="p-3 bg-[#D32F2F]/10 rounded-xl text-[#D32F2F] shadow-sm">
                 <RotateCcw size={24} />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-gray-900">Hoàn Học Phí</h1>
                 <p className="text-sm text-gray-500">Tạo phiếu chi hoàn tiền cho học viên</p>
              </div>
           </div>
           <Button variant="outline" onClick={() => navigate(-1)} className="hover:bg-gray-100 hover:text-gray-700 border-gray-300">
              <X size={18} className="mr-2"/> Hủy bỏ
           </Button>
        </div>

        {/* --- FORM CARD --- */}
        {/* Removed the red top border for a cleaner look */}
        <Card className="shadow-md border-gray-200">
           <form onSubmit={handleSubmit} className="p-8 space-y-8">
              
              {/* Section 1: Student Information */}
              <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-5">
                 <h3 className="font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg">
                    <User size={20} className="text-[var(--color-secondary)]"/> Thông Tin Học Viên
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Học viên <span className="text-[#D32F2F]">*</span></label>
                       <Select 
                          name="studentId"
                          value={formData.studentId}
                          onChange={(e) => handleInputChange({ target: { name: 'studentId', value: e.target.value } })}
                          options={studentOptions}
                          placeholder="-- Tìm kiếm & chọn học viên --"
                          className="w-full"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học liên quan <span className="text-[#D32F2F]">*</span></label>
                       <Select 
                          name="classId"
                          value={formData.classId}
                          onChange={(e) => handleInputChange({ target: { name: 'classId', value: e.target.value } })}
                          options={classOptions}
                          placeholder="-- Chọn lớp học --"
                          className="w-full"
                       />
                    </div>
                 </div>
              </div>

              {/* Section 2: Refund Details */}
              <div className="space-y-5">
                 <h3 className="font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-3 text-lg">
                    <DollarSign size={20} className="text-emerald-600"/> Chi Tiết Giao Dịch
                 </h3>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền hoàn (VND) <span className="text-[#D32F2F]">*</span></label>
                       <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                             type="number" 
                             name="amount"
                             value={formData.amount}
                             onChange={handleInputChange}
                             placeholder="VD: 5000000"
                             className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D32F2F]/50 focus:border-[#D32F2F] outline-none transition-all font-bold text-lg text-[#D32F2F]"
                             required
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Ngày thực hiện <span className="text-[#D32F2F]">*</span></label>
                       <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                          <input 
                             type="date" 
                             name="date"
                             value={formData.date}
                             onChange={handleInputChange}
                             className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)]/50 focus:border-[var(--color-secondary)] outline-none transition-all text-gray-700"
                             required
                          />
                       </div>
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức hoàn trả <span className="text-[#D32F2F]">*</span></label>
                       <Select 
                          name="refundMethod"
                          value={formData.refundMethod}
                          onChange={(e) => handleInputChange({ target: { name: 'refundMethod', value: e.target.value } })}
                          options={methodOptions}
                          className="w-full"
                       />
                    </div>

                    <div>
                       <label className="block text-sm font-medium text-gray-700 mb-2">Lý do hoàn <span className="text-[#D32F2F]">*</span></label>
                       <Select 
                          name="reason"
                          value={formData.reason}
                          onChange={(e) => handleInputChange({ target: { name: 'reason', value: e.target.value } })}
                          options={reasonOptions}
                          className="w-full"
                       />
                    </div>
                 </div>

                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ghi chú thêm</label>
                    <div className="relative">
                       <FileText className="absolute left-3 top-3 text-gray-400" size={18} />
                       <textarea 
                          name="note"
                          value={formData.note}
                          onChange={handleInputChange}
                          rows="4"
                          placeholder="Nhập ghi chú chi tiết về giao dịch này..."
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)]/50 focus:border-[var(--color-secondary)] outline-none transition-all resize-none text-gray-700"
                       ></textarea>
                    </div>
                 </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-gray-100 flex gap-4 justify-end">
                 <Button 
                    variant="outline" 
                    type="button" 
                    onClick={() => navigate("/accountant/dashboard")}
                    className="px-6 py-2.5 border-gray-300 text-gray-700 hover:bg-gray-50"
                 >
                    Hủy bỏ
                 </Button>
                 <Button 
                    type="submit" 
                    // Using the specific red color for the submit button
                    className="bg-[#D32F2F] hover:bg-[#b71c1c] text-white px-8 py-2.5 shadow-md text-base font-medium"
                    loading={loading}
                 >
                    <CheckCircle size={20} className="mr-2"/> Xác Nhận Hoàn Tiền
                 </Button>
              </div>

           </form>
        </Card>

      </div>
    </div>
  );
};

export default RefundTuitionPage;