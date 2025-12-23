import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  Card,
  Button,
  Badge,
  Loading,
  Input,
  Select,
  Modal,
} from "@components/common";
import api from "@services/api";
import { scheduleService, studentService } from "@services";
import { toast } from "react-hot-toast";

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
    dayOfWeek: "",
    startTime: "",
    endTime: "",
  });

  const [assignForm, setAssignForm] = useState({
    dayOfWeek: "",
    room: "",
    teacher: "",
  });

  const [teachers, setTeachers] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
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

  const daysOfWeek = [
    { value: 0, label: "Chủ Nhật" },
    { value: 1, label: "Thứ Hai" },
    { value: 2, label: "Thứ Ba" },
    { value: 3, label: "Thứ Tư" },
    { value: 4, label: "Thứ Năm" },
    { value: 5, label: "Thứ Sáu" },
    { value: 6, label: "Thứ Bảy" },
  ];

  useEffect(() => {
    (async () => {
      await loadData();
      // Quick test: auto-open personal schedule modal once after load
      try {
        await fetchStudents();
        setShowPersonalModal(true);
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [classRes, staffRes] = await Promise.all([
        api.get("classes?limit=100"),
        api.get("staffs?staffType=teacher&limit=100"),
      ]);

      setClasses(classRes.data.data || []);
      setStaffMembers(staffRes.data.data || []);
      setTeachers(staffRes.data.data || []);
      // do not fetch students here to keep list small; fetched when opening personal modal
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await studentService.getAll({ limit: 200 });
      const data = res?.data?.data || res?.data || [];
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách học viên");
    }
  };

  const openPersonalModal = async () => {
    await fetchStudents();
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
    if (!personalForm.studentId) return toast.error("Chọn học viên");
    if (!personalForm.date) return toast.error("Chọn ngày");
    try {
      const payload = {
        student: personalForm.studentId,
        date: personalForm.date,
        startTime: personalForm.startTime,
        endTime: personalForm.endTime,
        room: personalForm.room,
        topic: personalForm.topic,
        description: personalForm.description,
      };
      await scheduleService.create(payload);
      toast.success(
        "Tạo buổi riêng thành công — học viên sẽ thấy trong thời khóa biểu"
      );
      setShowPersonalModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo buổi riêng");
    }
  };

  const handleAddSchedule = (classItem) => {
    setSelectedClass(classItem);
    setEditingSchedule(null);
    setScheduleForm({ dayOfWeek: "", startTime: "", endTime: "" });
    setShowScheduleModal(true);
  };

  const handleEditSchedule = (classItem, scheduleItem, index) => {
    setSelectedClass(classItem);
    setEditingSchedule({ ...scheduleItem, index });
    setScheduleForm({
      dayOfWeek: scheduleItem.dayOfWeek,
      startTime: scheduleItem.startTime,
      endTime: scheduleItem.endTime,
    });
    setShowScheduleModal(true);
  };

  const handleDeleteSchedule = async (classItem, index) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch học này?")) return;

    try {
      const updatedSchedule = [...(classItem.schedule || [])];
      updatedSchedule.splice(index, 1);

      await api.put(`classes/${classItem._id}`, {
        schedule: updatedSchedule,
      });

      // Update local state
      setClasses(
        classes.map((c) =>
          c._id === classItem._id ? { ...c, schedule: updatedSchedule } : c
        )
      );
      toast.success("Xóa lịch học thành công");
    } catch (error) {
      console.error("Error deleting schedule:", error);
      toast.error("Lỗi xóa lịch học");
    }
  };

  const handleSaveSchedule = async () => {
    if (
      !scheduleForm.dayOfWeek ||
      !scheduleForm.startTime ||
      !scheduleForm.endTime
    ) {
      toast.error("Vui lòng điền tất cả thông tin lịch học");
      return;
    }

    try {
      const updatedSchedule = [...(selectedClass.schedule || [])];

      if (editingSchedule) {
        updatedSchedule[editingSchedule.index] = {
          dayOfWeek: parseInt(scheduleForm.dayOfWeek),
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        };
      } else {
        updatedSchedule.push({
          dayOfWeek: parseInt(scheduleForm.dayOfWeek),
          startTime: scheduleForm.startTime,
          endTime: scheduleForm.endTime,
        });
      }

      await api.put(`classes/${selectedClass._id}`, {
        schedule: updatedSchedule,
      });

      // Update local state
      setClasses(
        classes.map((c) =>
          c._id === selectedClass._id ? { ...c, schedule: updatedSchedule } : c
        )
      );

      toast.success(
        editingSchedule
          ? "Cập nhật lịch học thành công"
          : "Thêm lịch học thành công"
      );
      setShowScheduleModal(false);
      setScheduleForm({ dayOfWeek: "", startTime: "", endTime: "" });
    } catch (error) {
      console.error("Error saving schedule:", error);
      toast.error("Lỗi lưu lịch học");
    }
  };

  const handleAssignRoom = async () => {
    if (!assignForm.dayOfWeek || !assignForm.room) {
      toast.error("Vui lòng điền thông tin phòng học");
      return;
    }

    try {
      const updatedSchedule = (selectedClass.schedule || []).map((s) =>
        s.dayOfWeek === parseInt(assignForm.dayOfWeek)
          ? {
              ...s,
              room: assignForm.room,
              teacher: assignForm.teacher || s.teacher,
            }
          : s
      );

      await api.put(`classes/${selectedClass._id}`, {
        schedule: updatedSchedule,
        room: assignForm.room,
        teacher: assignForm.teacher || selectedClass.teacher,
      });

      // Update local state
      setClasses(
        classes.map((c) =>
          c._id === selectedClass._id ? { ...c, schedule: updatedSchedule } : c
        )
      );

      toast.success("Cập nhật phòng học thành công");
      setShowAssignModal(false);
      setAssignForm({ dayOfWeek: "", room: "", teacher: "" });
    } catch (error) {
      console.error("Error assigning room:", error);
      toast.error("Lỗi cập nhật phòng học");
    }
  };

  const getDayName = (dayOfWeek) => {
    return (
      daysOfWeek.find((d) => d.value === dayOfWeek)?.label || "Không xác định"
    );
  };

  const filteredClasses = classes.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.classCode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản Lý Lịch Học</h1>
          <p className="text-gray-600 mt-1">Sắp xếp lịch học cho các lớp học</p>
        </div>
        <div>
          <Button
            onClick={openPersonalModal}
            variant="primary"
            icon={<Plus size={16} />}
          >
            Tạo Buổi Riêng
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Tìm kiếm lớp học..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Calendar size={18} />}
          />
        </div>
      </div>

      {/* Classes List */}
      <div className="space-y-4">
        {filteredClasses.length > 0 ? (
          filteredClasses.map((classItem) => (
            <Card key={classItem._id} className="overflow-hidden">
              {/* Class Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                onClick={() =>
                  setExpandedClassId(
                    expandedClassId === classItem._id ? null : classItem._id
                  )
                }
              >
                <div className="flex-1">
                  <div className="flex items-center gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {classItem.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <span>Mã: {classItem.classCode}</span>
                        <span>•</span>
                        <span>
                          Sức chứa:{" "}
                          {classItem.capacity?.max ?? classItem.capacity ?? 0}
                        </span>
                        <span>•</span>
                        <span>Phòng: {classItem.room || "Chưa xác định"}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    color={
                      classItem.status === "ongoing"
                        ? "blue"
                        : classItem.status === "completed"
                        ? "green"
                        : "gray"
                    }
                  >
                    {classItem.status === "ongoing"
                      ? "Đang học"
                      : classItem.status === "completed"
                      ? "Kết thúc"
                      : "Sắp diễn ra"}
                  </Badge>
                  <ChevronDown
                    size={20}
                    className={`text-gray-600 transition-transform ${
                      expandedClassId === classItem._id ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </div>

              {/* Schedule Details */}
              {expandedClassId === classItem._id && (
                <div className="border-t px-6 py-4 bg-gray-50 space-y-4">
                  {/* Current Schedule */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">
                      Lịch Học Hiện Tại
                    </h4>
                    {classItem.schedule && classItem.schedule.length > 0 ? (
                      <div className="space-y-2">
                        {classItem.schedule.map((schedule, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-3 bg-white rounded-lg border"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">
                                {getDayName(schedule.dayOfWeek)}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {schedule.startTime} - {schedule.endTime}
                                {schedule.room && ` • Phòng: ${schedule.room}`}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() =>
                                  handleEditSchedule(classItem, schedule, idx)
                                }
                                className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                                title="Sửa"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteSchedule(classItem, idx)
                                }
                                className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                                title="Xóa"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        Chưa có lịch học nào
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      onClick={() => handleAddSchedule(classItem)}
                      icon={<Plus size={18} />}
                      variant="primary"
                    >
                      Thêm Lịch Học
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedClass(classItem);
                        setShowAssignModal(true);
                      }}
                      variant="secondary"
                    >
                      Chỉ Định Phòng & Giáo Viên
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          ))
        ) : (
          <Card className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Không tìm thấy lớp học nào</p>
          </Card>
        )}
      </div>

      {/* Schedule Modal */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Thêm/Sửa Lịch Học"
      >
        <div className="space-y-4">
          <Select
            label="Thứ"
            value={scheduleForm.dayOfWeek}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, dayOfWeek: e.target.value })
            }
            options={daysOfWeek}
          />

          <Input
            type="time"
            label="Giờ Bắt Đầu"
            value={scheduleForm.startTime}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, startTime: e.target.value })
            }
          />

          <Input
            type="time"
            label="Giờ Kết Thúc"
            value={scheduleForm.endTime}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, endTime: e.target.value })
            }
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSaveSchedule}
              variant="primary"
              className="flex-1"
            >
              <Check size={18} />
              Lưu
            </Button>
            <Button
              onClick={() => setShowScheduleModal(false)}
              variant="secondary"
              className="flex-1"
            >
              <X size={18} />
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Assign Room Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Chỉ Định Phòng & Giáo Viên"
      >
        <div className="space-y-4">
          <Select
            label="Chọn Thứ"
            value={assignForm.dayOfWeek}
            onChange={(e) =>
              setAssignForm({ ...assignForm, dayOfWeek: e.target.value })
            }
            options={daysOfWeek}
          />

          <Input
            label="Phòng Học"
            placeholder="Ví dụ: P101, P202..."
            value={assignForm.room}
            onChange={(e) =>
              setAssignForm({ ...assignForm, room: e.target.value })
            }
          />

          <Select
            label="Giáo Viên (Tùy Chọn)"
            value={assignForm.teacher}
            onChange={(e) =>
              setAssignForm({ ...assignForm, teacher: e.target.value })
            }
            options={[
              { value: "", label: "-- Không thay đổi --" },
              ...(teachers.map((t) => ({ value: t._id, label: t.fullName })) ||
                []),
            ]}
          />

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleAssignRoom}
              variant="primary"
              className="flex-1"
            >
              <Check size={18} />
              Lưu
            </Button>
            <Button
              onClick={() => setShowAssignModal(false)}
              variant="secondary"
              className="flex-1"
            >
              <X size={18} />
              Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Personal Schedule Modal (for academic staff) */}
      <Modal
        isOpen={showPersonalModal}
        onClose={() => setShowPersonalModal(false)}
        title="Tạo Buổi Riêng cho Học Viên"
      >
        <div className="space-y-4">
          <Select
            label="Học viên"
            value={personalForm.studentId}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, studentId: e.target.value })
            }
            options={students.map((s) => ({
              value: s._id,
              label:
                (s.fullName ||
                  s.user?.fullName ||
                  s.name ||
                  s.username ||
                  `#${s._id}`) +
                (s.phone || s.user?.phone
                  ? ` (${s.phone || s.user?.phone})`
                  : ""),
            }))}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Ngày"
              type="date"
              value={personalForm.date}
              onChange={(e) =>
                setPersonalForm({ ...personalForm, date: e.target.value })
              }
            />
            <Input
              label="Giờ bắt đầu"
              type="time"
              value={personalForm.startTime}
              onChange={(e) =>
                setPersonalForm({ ...personalForm, startTime: e.target.value })
              }
            />
            <Input
              label="Giờ kết thúc"
              type="time"
              value={personalForm.endTime}
              onChange={(e) =>
                setPersonalForm({ ...personalForm, endTime: e.target.value })
              }
            />
          </div>

          <Input
            label="Phòng"
            value={personalForm.room}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, room: e.target.value })
            }
          />

          <Input
            label="Tiêu đề / Chủ đề"
            value={personalForm.topic}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, topic: e.target.value })
            }
          />

          <Input
            label="Ghi chú / Mô tả"
            value={personalForm.description}
            onChange={(e) =>
              setPersonalForm({ ...personalForm, description: e.target.value })
            }
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreatePersonal}
              variant="primary"
              className="flex-1"
            >
              <Check size={18} /> Lưu
            </Button>
            <Button
              onClick={() => setShowPersonalModal(false)}
              variant="secondary"
              className="flex-1"
            >
              <X size={18} /> Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClassSchedulePage;
