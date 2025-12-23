import React, { useEffect, useState } from "react";
import { Card, Button, Loading, Table } from "../../../components/common";
import api from "../../../services/api";
import toast from "react-hot-toast";

const AssignClassesPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classesMap, setClassesMap] = useState({});

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get("/staff/enrollment/requests", {
        params: { status: "pending", type: "course_enrollment", limit: 50 },
      });
      const data = res.data?.data || res.data || [];
      const list = Array.isArray(data) ? data : data.requests || [];
      setRequests(list);

      const courseIds = Array.from(
        new Set(list.map((r) => r.course?._id).filter(Boolean))
      );
      if (courseIds.length) {
        const clsRes = await api.get("/staff/enrollment/classes", {
          params: { course: courseIds.join(","), limit: 200 },
        });
        const clsData =
          clsRes.data?.data?.classes || clsRes.data?.data || clsRes.data || [];
        const map = {};
        (Array.isArray(clsData) ? clsData : []).forEach((c) => {
          map[c._id] = c;
        });
        setClassesMap(map);
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể tải danh sách yêu cầu");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (requestId, classId) => {
    if (!classId) return toast.error("Vui lòng chọn lớp");
    try {
      setLoading(true);
      const res = await api.put(`/staff/enrollment/requests/${requestId}`, {
        action: "approve",
        classId,
      });
      if (res.data?.success) {
        toast.success("Đã gán lớp và phê duyệt yêu cầu");
        fetchPendingRequests();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Không thể gán lớp");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "student",
      label: "Học viên",
      render: (v, r) => (
        <div>
          <div className="font-medium">
            {r.student?.fullName || r.student?.user?.fullName || "Không rõ"}
          </div>
          <div className="text-sm text-gray-600">{r.student?.studentCode}</div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Khóa học",
      render: (v, r) => r.course?.name || r.course?.title || "N/A",
    },
    {
      key: "assign",
      label: "Gán lớp",
      render: (v, r) => {
        const courseId = r.course?._id;
        const available = Object.values(classesMap).filter((c) => {
          const classCourseId =
            c.course && c.course._id
              ? String(c.course._id)
              : String(c.course || "");
          return String(courseId) === classCourseId;
        });
        return (
          <div className="flex items-center gap-2">
            <select
              className="px-2 py-1 border rounded"
              id={`sel-ac-${r._id}`}
              defaultValue=""
            >
              <option value="">-- Chọn lớp --</option>
              {available.map((c) => {
                const cap = c.capacity?.max ?? c.capacity ?? 0;
                const enrolled = c.currentEnrollment ?? c.students?.length ?? 0;
                return (
                  <option key={c._id} value={c._id}>
                    {c.name} ({enrolled}/{cap})
                  </option>
                );
              })}
            </select>
            <Button
              size="small"
              variant="primary"
              onClick={() => {
                const sel = document.getElementById(`sel-ac-${r._id}`);
                handleAssign(r._id, sel?.value);
              }}
            >
              Gán & Phê duyệt
            </Button>
          </div>
        );
      },
    },
  ];

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="large" />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Sắp Xếp Lớp Học</h1>
        <p className="text-gray-600">Gán lớp cho học viên đã đăng ký khóa</p>
      </div>

      <Card>
        <Table
          columns={columns}
          data={requests}
          emptyMessage="Không có yêu cầu cần gán lớp"
        />
      </Card>
    </div>
  );
};

export default AssignClassesPage;
