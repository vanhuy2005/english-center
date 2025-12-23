import React, { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Input,
  Select,
  Loading,
} from "@components/common";
import { scheduleService, studentService } from "@services";
import { courseService } from "@services";
import { toast } from "react-hot-toast";
import { Plus, Edit2, Trash2, X, Check } from "lucide-react";

function formatCurrency(amount) {
  try {
    return new Intl.NumberFormat("vi-VN").format(amount || 0);
  } catch (e) {
    return amount || 0;
  }
}

const CourseManagementPage = () => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    courseCode: "",
    fee: "",
    duration: "",
    level: "",
    description: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await courseService.getAll();
      const data = res?.data?.data || res?.data || [];
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      courseCode: "",
      fee: "",
      duration: "",
      level: "",
      description: "",
    });
    setShowModal(true);
  };

  // --- Schedule modal state ---
  const [students, setStudents] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({
    studentId: "",
    date: "",
    startTime: "09:00",
    endTime: "10:00",
    room: "",
    topic: "",
    description: "",
  });

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

  const openScheduleModal = async () => {
    await fetchStudents();
    setScheduleForm({
      studentId: "",
      date: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "10:00",
      room: "",
      topic: "",
      description: "",
    });
    setShowScheduleModal(true);
  };

  const handleCreateSchedule = async () => {
    if (!scheduleForm.studentId) return toast.error("Chọn học viên");
    if (!scheduleForm.date) return toast.error("Chọn ngày");

    try {
      const payload = {
        student: scheduleForm.studentId,
        date: scheduleForm.date,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        room: scheduleForm.room,
        topic: scheduleForm.topic,
        description: scheduleForm.description,
      };
      await scheduleService.create(payload);
      toast.success(
        "Tạo lịch thành công — học viên sẽ thấy trong thời khóa biểu"
      );
      setShowScheduleModal(false);
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi tạo lịch");
    }
  };

  const openEdit = (course) => {
    setEditing(course);
    setForm({
      name: course.name || "",
      courseCode: course.courseCode || "",
      fee: (course.fee && course.fee.amount) || "",
      duration: (course.duration && course.duration.weeks) || "",
      level: course.level || "",
      description: course.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name) return toast.error("Tên khóa là bắt buộc");

    try {
      if (editing) {
        const payload = {
          name: form.name,
          courseCode: form.courseCode,
          fee: { amount: parseFloat(form.fee) || 0 },
          duration: {
            weeks: form.duration ? parseInt(form.duration) : 0,
            hours: 0,
          },
          level: form.level,
          description: form.description,
        };
        await courseService.update(editing._id, payload);
        toast.success("Cập nhật khóa học thành công");
      } else {
        const payload = {
          name: form.name,
          courseCode: form.courseCode || undefined,
          fee: { amount: parseFloat(form.fee) || 0 },
          duration: {
            weeks: form.duration ? parseInt(form.duration) : 0,
            hours: 0,
          },
          level: form.level || "beginner",
          description: form.description,
        };
        await courseService.create(payload);
        toast.success("Tạo khóa học thành công");
      }
      setShowModal(false);
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Lỗi khi lưu khóa học");
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(`Xóa khóa "${course.name}"?`)) return;
    try {
      await courseService.delete(course._id);
      toast.success("Xóa khóa học thành công");
      fetchCourses();
    } catch (err) {
      console.error(err);
      toast.error("Không thể xóa khóa học");
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Quản Lý Khóa Học</h1>
          <p className="text-gray-600">
            Thêm, sửa, xóa các khóa học của trung tâm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={openScheduleModal}
            icon={<Plus size={16} />}
            variant="outline"
          >
            Tạo Buổi Riêng
          </Button>
          <Button
            onClick={openCreate}
            icon={<Plus size={16} />}
            variant="primary"
          >
            Tạo Khóa Học
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {courses.length === 0 ? (
          <Card className="text-center py-12">Chưa có khóa học nào</Card>
        ) : (
          courses.map((c) => (
            <Card
              key={c._id}
              className="flex items-start justify-between p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4 w-full">
                <div className="flex-1">
                  <div className="font-semibold text-lg text-gray-900">
                    {c.name}
                  </div>
                  <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                    {c.courseCode && (
                      <span className="uppercase text-xs text-gray-400">
                        {c.courseCode}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                      {c.level}
                    </span>
                  </div>
                  {c.description && (
                    <div className="mt-2 text-sm text-gray-600">
                      {c.description}
                    </div>
                  )}
                </div>

                <div className="text-right ml-4">
                  <div className="text-sm text-gray-500">Học phí</div>
                  <div className="font-semibold text-lg text-primary">
                    {formatCurrency(c.fee?.amount)} {c.fee?.currency || "VND"}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={() => openEdit(c)}>
                  <Edit2 size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(c)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? "Sửa Khóa Học" : "Tạo Khóa Học mới"}
      >
        <div className="space-y-4">
          <Input
            label="Tên Khóa"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Input
            label="Mã Khóa (tùy chọn)"
            value={form.courseCode}
            onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Học phí"
              type="number"
              value={form.fee}
              onChange={(e) => setForm({ ...form, fee: e.target.value })}
            />
            <Input
              label="Thời lượng (tuần)"
              type="number"
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: e.target.value })}
            />
          </div>
          <Select
            label="Trình độ"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value })}
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "elementary", label: "Elementary" },
              { value: "pre-intermediate", label: "Pre-Intermediate" },
              { value: "intermediate", label: "Intermediate" },
              { value: "upper-intermediate", label: "Upper-Intermediate" },
              { value: "advanced", label: "Advanced" },
            ]}
          />
          <Input
            label="Mô tả ngắn"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} variant="primary" className="flex-1">
              <Check size={16} /> Lưu
            </Button>
            <Button
              onClick={() => setShowModal(false)}
              variant="secondary"
              className="flex-1"
            >
              <X size={16} /> Hủy
            </Button>
          </div>
        </div>
      </Modal>

      {/* Schedule creation modal for academic staff */}
      <Modal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title={"Tạo Buổi Riêng cho Học Viên"}
      >
        <div className="space-y-4">
          <Select
            label="Học viên"
            value={scheduleForm.studentId}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, studentId: e.target.value })
            }
            options={students.map((s) => ({
              value: s._id,
              label: `${s.name} (${s.phone || s.email || s._id})`,
            }))}
          />

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Ngày"
              type="date"
              value={scheduleForm.date}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, date: e.target.value })
              }
            />
            <Input
              label="Giờ bắt đầu"
              type="time"
              value={scheduleForm.startTime}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, startTime: e.target.value })
              }
            />
            <Input
              label="Giờ kết thúc"
              type="time"
              value={scheduleForm.endTime}
              onChange={(e) =>
                setScheduleForm({ ...scheduleForm, endTime: e.target.value })
              }
            />
          </div>

          <Input
            label="Phòng"
            value={scheduleForm.room}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, room: e.target.value })
            }
          />

          <Input
            label="Tiêu đề / Chủ đề"
            value={scheduleForm.topic}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, topic: e.target.value })
            }
          />

          <Input
            label="Ghi chú / Mô tả ngắn"
            value={scheduleForm.description}
            onChange={(e) =>
              setScheduleForm({ ...scheduleForm, description: e.target.value })
            }
          />

          <div className="flex gap-3 pt-2">
            <Button
              onClick={handleCreateSchedule}
              variant="primary"
              className="flex-1"
            >
              <Check size={16} /> Lưu Buổi
            </Button>
            <Button
              onClick={() => setShowScheduleModal(false)}
              variant="secondary"
              className="flex-1"
            >
              <X size={16} /> Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CourseManagementPage;
