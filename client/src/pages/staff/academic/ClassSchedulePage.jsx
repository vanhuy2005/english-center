import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
  Search,
  Clock,
  MapPin,
  User,
  Users,
  Briefcase,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal,
} from "../../../components/common";
import api from "../../../services/api";
import { scheduleService } from "../../../services";
import toast from "react-hot-toast";

// --- HELPER: Safe Data Extraction ---
const getDayName = (dayOfWeek) => {
  const days = [
    { value: 0, label: "Chủ Nhật" },
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
  ];
  return (
    days.find((d) => d.value === Number(dayOfWeek))?.label || "Không xác định"
  );
};

// Helper để lấy giá trị capacity an toàn (Fix lỗi Object object)
const getCapacityValue = (capacity) => {
  if (typeof capacity === "object" && capacity !== null) {
    return capacity.max || 0;
  }
  return capacity || 0;
};

const ClassSchedulePage = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState(null);
  const [expandedClassId, setExpandedClassId] = useState(null);

  // Modal states
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  // Form states
  const [scheduleForm, setScheduleForm] = useState({
    dayOfWeek: "1",
    startTime: "",
    endTime: "",
  });

  const [assignForm, setAssignForm] = useState({
    dayOfWeek: "",
    room: "",
    teacher: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    studentId: "",
    date: new Date().toISOString().split("T")[0],
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    topic: "",
    description: "",
  });

  const daysOptions = [
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
    { value: 0, label: "Chủ Nhật" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classRes, staffRes] = await Promise.all([
        api.get("/staff/enrollment/classes", { params: { limit: 100 } }),
        api.get("/staffs", { params: { role: "teacher", limit: 100 } }),
      ]);

      const classData =
        classRes.data?.data?.classes || classRes.data?.data || [];
      const teacherData = staffRes.data?.data || [];

      setClasses(Array.isArray(classData) ? classData : []);
      setTeachers(Array.isArray(teacherData) ? teacherData : []);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Lỗi tải dữ liệu lớp học");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get("/staff/enrollment/students", {
        params: { limit: 200 },
      });
      const data = res.data?.data?.students || res.data?.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách học viên");
    }
  };

  const openPersonalModal = async () => {
    if (students.length === 0) await fetchStudents();
    setPersonalForm({
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      topic: "",
      description: "",
    });
    setShowPersonalModal(true);
  };

  const handleCreatePersonal = async () => {
    if (!personalForm.studentId) return toast.error("Vui lòng chọn học viên");
    if (!personalForm.date) return toast.error("Vui lòng chọn ngày");

    try {
      await scheduleService.create({
        student: personalForm.studentId,
        date: personalForm.date,
        startTime: personalForm.startTime,
        endTime: personalForm.endTime,
        room: personalForm.room,
        topic: personalForm.topic,
        description: personalForm.description,
        type: "personal",
      });

      toast.success("Đã tạo lịch học riêng thành công");
      setShowPersonalModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi khi tạo buổi học riêng");
    }
  };

  // --- CLASS SCHEDULE HANDLERS ---

  const handleAddSchedule = (classItem) => {
    setSelectedClass(classItem);
    setEditingSchedule(null);
    setScheduleForm({ dayOfWeek: "1", startTime: "", endTime: "" });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (classItem, scheduleItem, index) => {
    setSelectedClass(classItem);
    setEditingSchedule({ ...scheduleItem, index });
    setScheduleForm({
      dayOfWeek: String(scheduleItem.dayOfWeek),
      startTime: scheduleItem.startTime,
      endTime: scheduleItem.endTime,
    });
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (classItem, index) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch này khỏi lớp học?"))
      return;

    try {
      let updatedSchedule = [...(classItem.schedule || [])];
      updatedSchedule.splice(index, 1);

      // Filter out invalid items
      updatedSchedule = updatedSchedule.filter(
        (item) =>
          item.dayOfWeek !== undefined &&
          item.dayOfWeek !== null &&
          item.startTime &&
          item.endTime
      );

      await api.put(`/classes/${classItem._id}`, { schedule: updatedSchedule });

      setClasses((prev) =>
        prev.map((c) =>
          c._id === classItem._id ? { ...c, schedule: updatedSchedule } : c
        )
      );
      toast.success("Đã xóa lịch học");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Lỗi xóa lịch học");
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.startTime || !scheduleForm.endTime) {
      return toast.error("Vui lòng nhập giờ bắt đầu và kết thúc");
    }

    try {
      let updatedSchedule = [...(selectedClass.schedule || [])];
      const newItem = {
        dayOfWeek: parseInt(scheduleForm.dayOfWeek),
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        room: editingSchedule?.room || selectedClass.room || "",
        teacher:
          editingSchedule?.teacher?._id || editingSchedule?.teacher || null,
      };

      if (editingSchedule) {
        updatedSchedule[editingSchedule.index] = {
          ...editingSchedule,
          ...newItem,
        };
      } else {
        updatedSchedule.push(newItem);
      }

      // Filter out invalid schedule items before sending
      updatedSchedule = updatedSchedule.filter(
        (item) =>
          item.dayOfWeek !== undefined &&
          item.dayOfWeek !== null &&
          item.startTime &&
          item.endTime
      );

      await api.put(`/classes/${selectedClass._id}`, {
        schedule: updatedSchedule,
      });

      setClasses((prev) =>
        prev.map((c) =>
          c._id === selectedClass._id ? { ...c, schedule: updatedSchedule } : c
        )
      );
      toast.success(
        editingSchedule ? "Cập nhật thành công" : "Thêm lịch thành công"
      );
      setShowScheduleModal(false);
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error(error.response?.data?.message || "Lỗi lưu lịch học");
    }
  };

  const handleAssignRoom = async () => {
    // if (!assignForm.dayOfWeek) return toast.error("Vui lòng chọn ngày");

    try {
      console.log("🔍 DEBUG - Selected Class:", selectedClass);
      console.log("🔍 DEBUG - Assign Form:", assignForm);

      const updatePayload = {};

      if (assignForm.dayOfWeek) {
        // Update specific schedule item
        const dayOfWeek = parseInt(assignForm.dayOfWeek);
        let currentSchedule = selectedClass.schedule
          ? [...selectedClass.schedule]
          : [];
        const idx = currentSchedule.findIndex((s) => s.dayOfWeek === dayOfWeek);

        if (idx !== -1) {
          currentSchedule[idx] = {
            ...currentSchedule[idx],
            room: assignForm.room || currentSchedule[idx].room,
            teacher: assignForm.teacher || currentSchedule[idx].teacher,
          };

          // Filter out invalid items
          currentSchedule = currentSchedule.filter(
            (item) =>
              item.dayOfWeek !== undefined &&
              item.dayOfWeek !== null &&
              item.startTime &&
              item.endTime
          );

          updatePayload.schedule = currentSchedule;
        } else {
          return toast.error("Không tìm thấy lịch học cho ngày này để gán");
        }
      } else {
        // Update top level
        if (assignForm.teacher) {
          updatePayload.teacher = assignForm.teacher;
        }
        if (assignForm.room) {
          updatePayload.room = assignForm.room;
        }
      }

      console.log(
        "📤 Sending payload to server:",
        JSON.stringify(updatePayload, null, 2)
      );

      const response = await api.put(
        `/classes/${selectedClass._id}`,
        updatePayload
      );
      console.log("✅ Server response:", response.data);

      // Update local state
      setClasses((prev) =>
        prev.map((c) => {
          if (c._id !== selectedClass._id) return c;

          if (assignForm.dayOfWeek) {
            return {
              ...c,
              schedule: updatePayload.schedule,
            };
          } else {
            return {
              ...c,
              teacher: assignForm.teacher
                ? teachers.find((t) => t._id === assignForm.teacher)
                : c.teacher,
              room: assignForm.room || c.room,
            };
          }
        })
      );

      toast.success("Cập nhật phòng/giáo viên thành công");
      setShowAssignModal(false);
      // Reset form
      setAssignForm({ dayOfWeek: "", room: "", teacher: "" });
    } catch (error) {
      console.error("❌ Error assigning:", error);
      console.error("❌ Error response:", error.response);
      console.error("❌ Error data:", error.response?.data);
      toast.error(error.response?.data?.message || "Lỗi cập nhật thông tin");
    }
  };

  // --- RENDER ---

  const filteredClasses = classes.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loading size="large" />
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 font-sans text-gray-800">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] flex items-center gap-3">
              <div className="p-2 bg-[var(--color-primary)] rounded-lg shadow-sm">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              Quản Lý Lịch Học
            </h1>
            <p className="text-gray-500 text-sm mt-1 ml-12">
              Thiết lập thời khóa biểu cho các lớp và buổi học riêng
            </p>
          </div>
          <Button
            onClick={openPersonalModal}
            className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-light)] text-white shadow-md flex items-center gap-2"
          >
            <Plus size={18} /> Tạo Buổi Học Riêng
          </Button>
        </div>

        {/* --- SEARCH --- */}
        <Card className="border border-gray-200 shadow-sm">
          <div className="p-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm lớp học theo tên hoặc mã lớp..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* --- CLASS LIST --- */}
        <div className="space-y-4">
          {filteredClasses.length > 0 ? (
            filteredClasses.map((classItem) => {
              const isExpanded = expandedClassId === classItem._id;
              const scheduleList = classItem.schedule || [];

              // Lấy capacity an toàn
              const capacityMax = getCapacityValue(classItem.capacity);
              const currentStudents =
                classItem.currentEnrollment || classItem.students?.length || 0;

              return (
                <div
                  key={classItem._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300"
                >
                  {/* Card Header (Clickable) */}
                  <div
                    className="p-5 flex flex-col md:flex-row items-center gap-4 cursor-pointer hover:bg-gray-50"
                    onClick={() =>
                      setExpandedClassId(isExpanded ? null : classItem._id)
                    }
                  >
                    {/* Class Info */}
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-[var(--color-primary)]">
                          {classItem.name}
                        </h3>
                        <Badge variant="info" className="text-xs font-mono">
                          {classItem.classCode}
                        </Badge>
                        {classItem.status === "ongoing" && (
                          <Badge variant="success" className="text-xs">
                            Đang học
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Briefcase size={14} />{" "}
                          {classItem.teacher?.fullName || "Chưa có GV"}
                        </span>
                        {/* FIX: Hiển thị capacity an toàn */}
                        <span className="flex items-center gap-1">
                          <Users size={14} /> {currentStudents}/{capacityMax}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin size={14} /> {classItem.room || "TBA"}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Preview */}
                    <div className="flex gap-2 items-center">
                      <div className="hidden md:flex gap-1">
                        {scheduleList.length > 0 ? (
                          scheduleList.map((s, idx) => (
                            <Badge
                              key={idx}
                              variant="secondary"
                              className="text-xs font-normal bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] border-none"
                            >
                              {getDayName(s.dayOfWeek).replace("Thứ ", "T")}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">
                            Chưa xếp lịch
                          </span>
                        )}
                      </div>
                      <div
                        className={`p-2 rounded-full transition-transform duration-300 ${
                          isExpanded ? "bg-gray-100 rotate-180" : ""
                        }`}
                      >
                        <ChevronDown size={20} className="text-gray-500" />
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50/50 p-6 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2">
                          <Clock
                            size={18}
                            className="text-[var(--color-secondary)]"
                          />{" "}
                          Chi tiết lịch học
                        </h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs bg-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedClass(classItem);
                              setShowAssignModal(true);
                            }}
                          >
                            <MapPin size={14} className="mr-1" /> Gán Phòng/GV
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSchedule(classItem);
                            }}
                          >
                            <Plus size={14} className="mr-1" /> Thêm lịch
                          </Button>
                        </div>
                      </div>

                      {scheduleList.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {scheduleList.map((s, idx) => (
                            <div
                              key={idx}
                              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center group"
                            >
                              <div>
                                <p className="font-bold text-[var(--color-primary)]">
                                  {getDayName(s.dayOfWeek)}
                                </p>
                                <p className="text-sm text-gray-600 font-medium">
                                  {s.startTime} - {s.endTime}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {s.room || classItem.room || "Chưa có phòng"}{" "}
                                  •{" "}
                                  {s.teacher?.fullName ||
                                    classItem.teacher?.fullName ||
                                    "Chưa có GV"}
                                </p>
                              </div>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  className="p-1.5 hover:bg-blue-50 text-blue-600 rounded"
                                  onClick={() =>
                                    handleEditSchedule(classItem, s, idx)
                                  }
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded"
                                  onClick={() =>
                                    handleDeleteSchedule(classItem, idx)
                                  }
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500 text-sm">
                            Lớp này chưa có lịch học nào.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 shadow-sm">
              <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">
                Không tìm thấy lớp học phù hợp
              </p>
            </div>
          )}
        </div>
      </div>

      {/* --- SCHEDULE MODAL --- */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title={editingSchedule ? "Cập Nhật Lịch Học" : "Thêm Lịch Học Mới"}
          size="md"
        >
          <div className="space-y-4 p-1">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Thứ trong tuần
              </label>
              <Select
                className="w-full"
                value={scheduleForm.dayOfWeek}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    dayOfWeek: e.target.value,
                  })
                }
                options={daysOptions}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="time"
                label="Giờ bắt đầu"
                value={scheduleForm.startTime}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    startTime: e.target.value,
                  })
                }
              />
              <Input
                type="time"
                label="Giờ kết thúc"
                value={scheduleForm.endTime}
                onChange={(e) =>
                  setScheduleForm({ ...scheduleForm, endTime: e.target.value })
                }
              />
            </div>
            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                onClick={handleSaveSchedule}
              >
                {editingSchedule ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- ASSIGN MODAL --- */}
      {showAssignModal && selectedClass && (
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title="Gán Phòng & Giáo Viên"
          size="md"
        >
          <div className="space-y-4 p-1">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-100 text-sm mb-2">
              Đang thiết lập cho lớp: <strong>{selectedClass.name}</strong>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Áp dụng cho ngày
              </label>
              <Select
                className="w-full"
                value={assignForm.dayOfWeek}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, dayOfWeek: e.target.value })
                }
                options={[
                  { value: "", label: "-- Chọn thứ --" },
                  ...daysOptions,
                ]}
              />
            </div>

            <Input
              label="Phòng học"
              value={assignForm.room}
              onChange={(e) =>
                setAssignForm({ ...assignForm, room: e.target.value })
              }
              placeholder="VD: P.101, Lab 2..."
            />

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Giáo viên (Tùy chọn)
              </label>
              <Select
                className="w-full"
                value={assignForm.teacher}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, teacher: e.target.value })
                }
                options={[
                  { value: "", label: "-- Giữ nguyên --" },
                  ...teachers.map((t) => ({ value: t._id, label: t.fullName })),
                ]}
              />
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowAssignModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-[var(--color-secondary)] text-white hover:bg-[var(--color-secondary-dark)]"
                onClick={handleAssignRoom}
              >
                Xác nhận thay đổi
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- PERSONAL SCHEDULE MODAL --- */}
      {showPersonalModal && (
        <Modal
          isOpen={showPersonalModal}
          onClose={() => setShowPersonalModal(false)}
          title="Tạo Buổi Học Riêng (1-1 / Bù)"
          size="lg"
        >
          <div className="space-y-5 p-1">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Học viên <span className="text-red-500">*</span>
              </label>
              <Select
                className="w-full"
                value={personalForm.studentId}
                onChange={(e) =>
                  setPersonalForm({
                    ...personalForm,
                    studentId: e.target.value,
                  })
                }
                options={[
                  { value: "", label: "-- Chọn học viên --" },
                  ...students.map((s) => ({
                    value: s._id,
                    label: `${s.fullName} (${s.studentCode || "N/A"})`,
                  })),
                ]}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Input
                type="date"
                label="Ngày học"
                value={personalForm.date}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, date: e.target.value })
                }
              />
              <Input
                type="time"
                label="Bắt đầu"
                value={personalForm.startTime}
                onChange={(e) =>
                  setPersonalForm({
                    ...personalForm,
                    startTime: e.target.value,
                  })
                }
              />
              <Input
                type="time"
                label="Kết thúc"
                value={personalForm.endTime}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, endTime: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Phòng học"
                value={personalForm.room}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, room: e.target.value })
                }
                placeholder="VD: Online, P.202"
              />
              <Input
                label="Chủ đề / Bài học"
                value={personalForm.topic}
                onChange={(e) =>
                  setPersonalForm({ ...personalForm, topic: e.target.value })
                }
                placeholder="VD: Ôn tập Unit 5"
              />
            </div>

            <Input
              label="Ghi chú thêm"
              value={personalForm.description}
              onChange={(e) =>
                setPersonalForm({
                  ...personalForm,
                  description: e.target.value,
                })
              }
              placeholder="VD: Học bù cho ngày nghỉ..."
            />

            <div className="flex gap-3 pt-4 border-t border-gray-100 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPersonalModal(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                className="bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)]"
                onClick={handleCreatePersonal}
              >
                Lưu lịch riêng
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ClassSchedulePage;
