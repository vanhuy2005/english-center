import React, { useState, useEffect } from "react";
import { Award } from "lucide-react";
import { Card, Button, Badge, Loading, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const GradeManagementPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) fetchGrades();
  }, [selectedClass]);

  const fetchClasses = async () => {
    try {
      const response = await api.get("/classes");
      const data = response.data?.data || response.data || [];
      setClasses(Array.isArray(data) ? data : []);
    } catch (error) {
      setClasses([]);
    } finally {
      setLoading(false);
    }
  };

  const normalizeGrades = (list) => {
    if (!Array.isArray(list)) return [];
    return list.map((g) => {
      const student = g.student || {};
      const studentObj =
        typeof student === "object" ? student : { _id: student };
      const scores = g.scores || {};
      const mid = scores.midterm ?? null;
      const fin = scores.final ?? null;
      let avg = g.totalScore;
      if (avg === undefined) {
        const count = (mid ? 1 : 0) + (fin ? 1 : 0);
        avg = count > 0 ? (Number(mid || 0) + Number(fin || 0)) / count : 0;
      }
      if (!isFinite(avg)) avg = 0;
      return {
        _id: studentObj._id || g.student || g._id,
        gradeId: g._id,
        studentCode: studentObj.studentCode || "",
        fullName: studentObj.fullName || studentObj.name || "",
        midterm: mid,
        final: fin,
        average: Number(avg),
        status: g.isPublished ? "approved" : "pending",
      };
    });
  };

  const fetchGrades = async () => {
    try {
      // If selectedClass isn't a valid ObjectId, skip calling grades route
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(selectedClass);
      let response = { data: { data: [] }, status: 200 };
      if (isObjectId) {
        // Request grades for the selected class using the class-specific route.
        // Allow non-2xx through so we can handle 400 without throwing.
        response = await api.get(`/staff/academic/grades/${selectedClass}`, {
          validateStatus: () => true,
        });
        if (response.status === 200 && Array.isArray(response.data?.data)) {
          const gradeRows = normalizeGrades(response.data.data);
          // Also fetch class roster and merge students without grades so
          // the UI shows all enrolled students (with empty scores).
          try {
            const rosterRes = await api.get(
              `/classes/${selectedClass}/students`,
              {
                validateStatus: () => true,
              }
            );
            const students = rosterRes.data?.data || [];
            if (Array.isArray(students) && students.length > 0) {
              const byId = {};
              gradeRows.forEach((r) => {
                if (r && r._id) byId[r._id.toString()] = r;
              });
              const merged = students.map((s) => {
                const id = s._id?.toString();
                if (id && byId[id]) return byId[id];
                return {
                  _id: s._id,
                  studentCode: s.studentCode || "",
                  fullName: s.fullName || "",
                  midterm: null,
                  final: null,
                  average: 0,
                  status: "pending",
                };
              });
              setGrades(merged);
              return;
            }
          } catch (mergeErr) {
            console.error("roster merge failed:", mergeErr);
          }

          setGrades(gradeRows);
          return;
        }
      }

      // 2) Try generic grades endpoint
      try {
        const listRes = await api.get(`/grades`, {
          params: { class: selectedClass },
          validateStatus: () => true,
        });
        if (listRes.status === 200 && Array.isArray(listRes.data?.data)) {
          setGrades(normalizeGrades(listRes.data.data));
          return;
        }
      } catch (e) {
        console.warn(
          "generic grades call failed:",
          e?.response?.status || e.message
        );
      }

      // 3) Try classes/:id/students first — ensure we show roster even if
      // attendance records for today are missing. This mirrors AttendanceTrackingPage
      try {
        const rosterRes = await api.get(`/classes/${selectedClass}/students`, {
          validateStatus: () => true,
        });
        const students = rosterRes.data?.data || [];
        if (Array.isArray(students) && students.length > 0) {
          const rows = students.map((s) => ({
            _id: s._id,
            studentCode: s.studentCode || "",
            fullName: s.fullName || "",
            midterm: null,
            final: null,
            average: 0,
            status: "pending",
          }));
          console.log("roster fallback returned students:", rows.length);
          setGrades(rows);
          return;
        }
      } catch (rosterErr) {
        console.error("roster fallback failed:", rosterErr);
      }

      // 4) Next try attendance service roster for today's local date
      try {
        const localDate = (() => {
          const d = new Date();
          const tzOffset = d.getTimezoneOffset() * 60000;
          return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
        })();
        const attendRes = await api.get(`/attendance/class/${selectedClass}`, {
          params: { startDate: localDate, endDate: localDate },
          validateStatus: () => true,
        });
        console.log(
          "attendance roster status:",
          attendRes.status,
          attendRes.data
        );
        const byStudent = attendRes.data?.data?.byStudent || [];
        if (Array.isArray(byStudent) && byStudent.length > 0) {
          const rows = byStudent.map((item) => {
            const student = item.student || {};
            return {
              _id: student._id,
              studentCode: student.studentCode || "",
              fullName: student.fullName || "",
              midterm: null,
              final: null,
              average: 0,
              status: "pending",
            };
          });
          setGrades(rows);
          return;
        }
      } catch (attErr) {
        console.error("attendance roster failed:", attErr);
      }

      setGrades([]);
    } catch (err) {
      console.error("Unexpected fetchGrades error:", err);
      setGrades([]);
    }
  };

  const handleGradeChange = (studentId, field, value) => {
    setGrades((prev) =>
      prev.map((r) =>
        r._id === studentId
          ? { ...r, [field]: value, average: computeAverage(r, field, value) }
          : r
      )
    );
  };

  const computeAverage = (row, changedField, changedValue) => {
    const mid =
      changedField === "midterm"
        ? Number(changedValue)
        : Number(row.midterm || 0);
    const fin =
      changedField === "final" ? Number(changedValue) : Number(row.final || 0);
    const count = (mid > 0 ? 1 : 0) + (fin > 0 ? 1 : 0);
    if (count === 0) return 0;
    return ((mid || 0) + (fin || 0)) / count;
  };

  const handleSaveGrade = async (row) => {
    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp trước khi lưu");
      return;
    }

    // Teacher API expects an array of grade entries: { student, gradeType, score }
    const gradesPayload = [];
    if (
      row.midterm !== null &&
      row.midterm !== undefined &&
      row.midterm !== ""
    ) {
      gradesPayload.push({
        student: row._id,
        gradeType: "midterm",
        score: Number(row.midterm),
      });
    }
    if (row.final !== null && row.final !== undefined && row.final !== "") {
      gradesPayload.push({
        student: row._id,
        gradeType: "final",
        score: Number(row.final),
      });
    }

    if (gradesPayload.length === 0) {
      toast.error("Không có điểm để lưu");
      return;
    }

    try {
      // Use generic grades endpoint which exists at /api/grades
      // Need course id from class to create/update grade
      const classRes = await api.get(`/classes/${selectedClass}`);
      const classData = classRes.data?.data || classRes.data;
      const courseId = classData?.course || classData?.course?._id;
      if (!courseId) {
        toast.error("Không thể xác định khóa học của lớp để lưu điểm");
        return;
      }

      // Build payload for createOrUpdateGrade endpoint
      const payload = {
        student: row._id,
        class: selectedClass,
        course: courseId,
        scores: {
          midterm: row.midterm !== "" ? Number(row.midterm) : undefined,
          final: row.final !== "" ? Number(row.final) : undefined,
        },
      };

      await api.post(`/grades`, payload);
      toast.success("Lưu điểm thành công");
      fetchGrades();
    } catch (err) {
      const serverMessage = err?.response?.data?.message || null;
      const isDuplicate =
        serverMessage &&
        /duplicate|E11000|already exists|unique/i.test(serverMessage);
      if (isDuplicate) {
        try {
          // Query the academic grades for this class and student
          const list = await api.get(`/staff/academic/grades`, {
            params: { classId: selectedClass, studentId: row._id },
          });
          const existing = list.data?.data?.[0];
          if (existing && existing._id) {
            const putRes = await api.put(
              `/staff/academic/grades/${existing._id}`,
              {
                midterm: row.midterm,
                final: row.final,
              }
            );
            const updated = putRes?.data?.data;
            toast.success("Cập nhật điểm thành công");
            setGrades((prev) =>
              prev.map((r) => (r._id === row._id ? { ...r, ...updated } : r))
            );
            return;
          }
        } catch (updateErr) {
          console.error("Error updating grade:", updateErr);
        }
      }

      console.error("Save grade error:", err);
      toast.error(serverMessage || "Không thể lưu điểm");
    }
  };

  const handleApprove = async (studentOrGradeId) => {
    try {
      if (!selectedClass) {
        toast.error("Không xác định được lớp để phê duyệt");
        return;
      }

      // 1) Try to find existing grade for this class + student
      const listRes = await api.get(`/grades`, {
        params: { class: selectedClass, student: studentOrGradeId },
        validateStatus: () => true,
      });

      if (
        listRes.status === 200 &&
        Array.isArray(listRes.data?.data) &&
        listRes.data.data.length > 0
      ) {
        const existing = listRes.data.data[0];
        const patchRes = await api.patch(
          `/grades/${existing._id}/publish`,
          {},
          { validateStatus: () => true }
        );
        if (patchRes.status === 200) {
          toast.success("Đã phê duyệt điểm");
          fetchGrades();
          return;
        }
      }

      // 2) If not found, and the provided id looks like an ObjectId, try
      // publishing directly (this may represent a grade id).
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(studentOrGradeId);
      if (isObjectId) {
        const tryPatch = await api.patch(
          `/grades/${studentOrGradeId}/publish`,
          {},
          { validateStatus: () => true }
        );
        if (tryPatch.status === 200) {
          toast.success("Đã phê duyệt điểm");
          fetchGrades();
          return;
        }

        // 3) As last resort, try academic publish route (some records may
        // be stored under academic namespace)
        const acad = await api.post(
          `/staff/academic/grades/${studentOrGradeId}/publish`,
          {},
          { validateStatus: () => true }
        );
        if (acad.status === 200) {
          toast.success("Đã phê duyệt điểm");
          fetchGrades();
          return;
        }
      }

      toast.error("Không thể phê duyệt điểm");
    } catch (err) {
      console.error("Approve error:", err);
      toast.error("Không thể phê duyệt điểm");
    }
  };

  const columns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và tên" },
    {
      key: "midterm",
      label: "Giữa kỳ",
      render: (value, row) => {
        if (!row) return "-";
        return (
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={row.midterm ?? ""}
            onChange={(e) =>
              handleGradeChange(row._id, "midterm", e.target.value)
            }
            className="w-20 px-2 py-1 border rounded"
          />
        );
      },
    },
    {
      key: "final",
      label: "Cuối kỳ",
      render: (value, row) => {
        if (!row) return "-";
        return (
          <input
            type="number"
            min="0"
            max="10"
            step="0.1"
            value={row.final ?? ""}
            onChange={(e) =>
              handleGradeChange(row._id, "final", e.target.value)
            }
            className="w-20 px-2 py-1 border rounded"
          />
        );
      },
    },
    {
      key: "average",
      label: "Trung bình",
      render: (value, row) => {
        const avg = (row && row.average) || 0;
        return (
          <span
            className={
              avg >= 8
                ? "text-green-600 font-semibold"
                : avg >= 5
                ? "text-yellow-600"
                : "text-red-600"
            }
          >
            {avg.toFixed(1)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value, row) => (
        <Badge
          variant={row && row.status === "approved" ? "success" : "warning"}
        >
          {row && row.status === "approved" ? "Đã duyệt" : "Chờ duyệt"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => handleSaveGrade(row)}>
            Lưu
          </Button>
          {row && row.status === "pending" && (
            <Button size="sm" onClick={() => handleApprove(row._id)}>
              Phê duyệt
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Quản lý điểm</h1>
      </div>

      <Card>
        <div className="mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9797]"
          >
            <option value="">Chọn lớp học</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
        </div>

        {selectedClass ? (
          <Table columns={columns} data={grades} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Vui lòng chọn lớp học
          </div>
        )}
      </Card>
    </div>
  );
};

export default GradeManagementPage;
