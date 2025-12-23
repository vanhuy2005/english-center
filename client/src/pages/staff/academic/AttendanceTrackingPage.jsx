import React, { useState, useEffect, useMemo, useRef } from "react";
import { ClipboardCheck } from "lucide-react";
import { Card, Badge, Loading, Input, Table } from "@components/common";
import api from "@services/api";
import { toast } from "react-hot-toast";

const AttendanceTrackingPage = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  // Use local date (YYYY-MM-DD) so client-side date matches user's day
  const localDefaultDate = (() => {
    const d = new Date();
    const tzOffset = d.getTimezoneOffset() * 60000; // offset in ms
    return new Date(Date.now() - tzOffset).toISOString().split("T")[0];
  })();
  const [date, setDate] = useState(localDefaultDate);
  const [editingRow, setEditingRow] = useState(null);
  const [editStatus, setEditStatus] = useState("");
  // Track which students were modified by the user, keyed by date.
  // e.g. modifiedRef.current = { '2025-12-22': Set(['id1','id2']) }
  const modifiedRef = useRef({});
  // Store the modified row data per date so it can be re-applied when
  // returning to that date without depending on in-memory table state.
  const modifiedDataRef = useRef({});
  const prevSelectedClassRef = useRef(selectedClass);
  const lastFetchDateRef = useRef(null);

  const statusOptions = useMemo(
    () => [
      { value: "present", label: "Có mặt" },
      { value: "absent", label: "Vắng" },
      { value: "excused", label: "Vắng có lý do" },
      { value: "no_record", label: "Chưa điểm danh" },
    ],
    []
  );

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    // If the selected class changed, clear any saved per-date local edits.
    // If only the date changed, keep per-date edits so returning to a
    // previous date preserves the user's saved changes.
    if (prevSelectedClassRef.current !== selectedClass) {
      modifiedRef.current = {};
      modifiedDataRef.current = {};
      prevSelectedClassRef.current = selectedClass;
    }

    // clear local rows to avoid merging previous-date in-memory table
    setAttendanceData([]);
    // reset last fetch date so we won't merge previous-date prevMap
    lastFetchDateRef.current = null;
    if (selectedClass) fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClass, date]);

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

  const fetchAttendance = async () => {
    try {
      console.log("[attendance] fetchAttendance start", {
        selectedClass,
        date,
      });
      const response = await api.get(`/attendance/class/${selectedClass}`, {
        params: { startDate: date, endDate: date },
      });
      const byStudent = response.data?.data?.byStudent || [];
      console.log(
        "[attendance] GET /attendance/class response:",
        response.data
      );

      let rows = [];
      if (Array.isArray(byStudent) && byStudent.length > 0) {
        rows = byStudent.map((item) => {
          const student = item.student || {};
          const record =
            Array.isArray(item.records) && item.records.length > 0
              ? item.records[0]
              : null;
          return {
            _id: student._id,
            studentCode: student.studentCode || "",
            fullName: student.fullName || "",
            status: record ? record.status : "no_record",
            note: record ? record.note || "" : "",
            attendanceId: record ? record._id : null,
          };
        });
      }

      if (rows.length === 0) {
        try {
          const rosterRes = await api.get(`/classes/${selectedClass}/students`);
          console.log("[attendance] roster response:", rosterRes.data);
          const students = rosterRes.data?.data || [];
          rows = Array.isArray(students)
            ? students.map((s) => ({
                _id: s._id,
                studentCode: s.studentCode || "",
                fullName: s.fullName || "",
                status: "no_record",
                note: "",
                attendanceId: null,
              }))
            : [];
        } catch (err) {
          // ignore
        }
      }

      console.log("[attendance] built rows:", rows);

      // Merge server rows with local optimistic state to avoid flicker:
      // if the server returns 'no_record' but the local state recently
      // recorded a non-'no_record' status, keep the local status.
      try {
        // Build a map of previous local data for this date. This includes
        // any explicit user-saved rows (modifiedDataRef) and, when the
        // current in-memory table was fetched for the same date, the
        // existing `attendanceData`.
        const prevMap = {};
        if (modifiedDataRef.current[date]) {
          Object.assign(prevMap, modifiedDataRef.current[date]);
        }
        if (lastFetchDateRef.current === date) {
          (attendanceData || []).forEach((r) => {
            if (r && r._id) prevMap[r._id.toString()] = r;
          });
        }

        const merged = rows.map((r) => {
          const id = r._id?.toString();

          // If the user recently modified this row for this date, keep it.
          if (
            id &&
            modifiedRef.current[date] &&
            modifiedRef.current[date].has(id)
          ) {
            const prev = prevMap[id];
            if (prev && prev.status) {
              return {
                ...r,
                status: prev.status,
                note: prev.note,
                attendanceId: prev.attendanceId,
              };
            }
          }

          const prev = prevMap[id];
          if (
            prev &&
            prev.status &&
            prev.status !== "no_record" &&
            r.status === "no_record"
          ) {
            return {
              ...r,
              status: prev.status,
              note: prev.note,
              attendanceId: prev.attendanceId,
            };
          }

          return r;
        });

        console.log("[attendance] merged rows:", merged);
        setAttendanceData(merged);
        // remember which date these rows correspond to
        lastFetchDateRef.current = date;
      } catch (mergeErr) {
        console.error("[attendance] merge error:", mergeErr);
        setAttendanceData(rows);
        lastFetchDateRef.current = date;
      }
      // final guard: ensure lastFetchDateRef is set even if no merge branch
      if (lastFetchDateRef.current !== date) lastFetchDateRef.current = date;
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setAttendanceData([]);
    }
  };

  const handleSaveStatus = async (row) => {
    const studentId =
      row?._id || row?.student?._id || row?.studentId || row?.student_id;
    if (!studentId) {
      console.error(
        "[attendance] invalid row passed to handleSaveStatus:",
        row
      );
      toast.error("Dữ liệu học viên không hợp lệ — vui lòng thử lại");
      return;
    }

    const statusToSave =
      editStatus ||
      (row.status === "no_record" ? "present" : row.status) ||
      "present";
    const allowed = ["present", "absent", "late", "excused"];
    const finalStatus = allowed.includes(statusToSave)
      ? statusToSave
      : "present";

    if (!selectedClass) {
      toast.error("Vui lòng chọn lớp trước khi cập nhật");
      return;
    }

    const payload = {
      student: studentId,
      class: selectedClass,
      date,
      status: finalStatus,
      note: row.note || "",
    };

    console.log("[attendance] POST payload:", payload);

    try {
      const res = await api.post(`/staff/academic/attendance`, payload);
      const saved = res?.data?.data;
      console.log("[attendance] POST success:", saved || res.data);

      // Optimistically update local table for immediate feedback
      setAttendanceData((prev) =>
        prev.map((r) =>
          (r._id || r._id?._id || "")?.toString() === studentId?.toString()
            ? {
                ...r,
                status: finalStatus,
                note: row.note || "",
                attendanceId: saved ? saved._id : r.attendanceId,
                localOverride: true,
              }
            : r
        )
      );

      // mark this student as modified by the user so background refresh
      // won't overwrite the chosen status
      try {
        const d = date;
        if (!modifiedRef.current[d]) modifiedRef.current[d] = new Set();
        modifiedRef.current[d].add(studentId?.toString());
        if (!modifiedDataRef.current[d]) modifiedDataRef.current[d] = {};
        modifiedDataRef.current[d][studentId?.toString()] = {
          ...row,
          status: finalStatus,
          note: row.note || "",
          attendanceId: saved ? saved._id : row.attendanceId,
          localOverride: true,
        };
      } catch (e) {
        /* ignore */
      }

      toast.success("Trạng thái điểm danh đã được cập nhật");
      setEditingRow(null);
      setEditStatus("");
      // Do not auto-refresh immediately to avoid overwriting user's choice.
      // Rely on manual refresh / navigation to re-sync with server.
    } catch (err) {
      console.error(
        "[attendance] POST error:",
        err?.response?.data || err.message || err
      );
      const serverMessage =
        err?.response?.data?.message ||
        (err?.response?.data ? JSON.stringify(err.response.data) : null);
      const isDuplicate =
        serverMessage &&
        /duplicate|E11000|already exists|unique/i.test(serverMessage);

      if (isDuplicate) {
        try {
          const res = await api.get(`/staff/academic/attendance`, {
            params: {
              class: selectedClass,
              student: studentId,
              startDate: date,
              endDate: date,
            },
          });
          const existing = res.data?.data?.[0];
          if (existing && existing._id) {
            const putRes = await api.put(
              `/staff/academic/attendance/${existing._id}`,
              {
                status: finalStatus,
                note: row.note || "",
              }
            );
            const updated = putRes?.data?.data;
            console.log("[attendance] PUT success:", updated || putRes.data);

            // Update local table immediately
            setAttendanceData((prev) =>
              prev.map((r) =>
                (r._id || r._id?._id || "")?.toString() ===
                studentId?.toString()
                  ? {
                      ...r,
                      status: finalStatus,
                      note: row.note || "",
                      attendanceId: updated ? updated._id : r.attendanceId,
                      localOverride: true,
                    }
                  : r
              )
            );

            try {
              const d = date;
              if (!modifiedRef.current[d]) modifiedRef.current[d] = new Set();
              modifiedRef.current[d].add(studentId?.toString());
              if (!modifiedDataRef.current[d]) modifiedDataRef.current[d] = {};
              modifiedDataRef.current[d][studentId?.toString()] = {
                ...row,
                status: finalStatus,
                note: row.note || "",
                attendanceId: updated ? updated._id : row.attendanceId,
                localOverride: true,
              };
            } catch (e) {
              /* ignore */
            }

            toast.success("Cập nhật điểm danh thành công");
            setEditingRow(null);
            setEditStatus("");
            return;
          }
        } catch (updateErr) {
          console.error("Error updating existing attendance:", updateErr);
        }
      }

      toast.error(serverMessage || "Không thể cập nhật trạng thái");
    }
  };

  const columns = [
    { key: "studentCode", label: "Mã HV" },
    { key: "fullName", label: "Họ và tên" },
    {
      key: "status",
      label: "Trạng thái",
      render: (value, row) => {
        const statusVal = value || row?.status || "no_record";
        return (
          <div className="flex items-center gap-3">
            <Badge
              variant={
                statusVal === "present"
                  ? "success"
                  : statusVal === "no_record"
                  ? "secondary"
                  : "danger"
              }
            >
              {statusVal === "present"
                ? "Có mặt"
                : statusVal === "no_record"
                ? "Chưa điểm danh"
                : statusVal === "absent"
                ? "Vắng"
                : statusVal}
            </Badge>

            {editingRow === row?._id ? (
              <div className="flex items-center gap-2">
                <select
                  value={editStatus || statusVal}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="px-2 py-1 border rounded"
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  className="px-2 py-1 bg-green-500 text-white rounded"
                  onClick={() => handleSaveStatus(row)}
                >
                  Lưu
                </button>
                <button
                  className="px-2 py-1 bg-gray-300 rounded"
                  onClick={() => {
                    setEditingRow(null);
                    setEditStatus("");
                  }}
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                className="px-2 py-1 bg-blue-500 text-white rounded"
                onClick={() => {
                  setEditingRow(row?._id);
                  setEditStatus(
                    statusVal === "no_record" ? "present" : statusVal
                  );
                }}
              >
                Thay đổi
              </button>
            )}
          </div>
        );
      },
    },
    { key: "note", label: "Ghi chú" },
  ];

  if (loading) return <Loading fullScreen />;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardCheck className="w-8 h-8 text-[#3B9797]" />
        <h1 className="text-2xl font-bold text-gray-800">Theo dõi điểm danh</h1>
      </div>

      <Card>
        <div className="flex gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B9797]"
          >
            <option value="">Chọn lớp học</option>
            {classes.map((cls) => (
              <option key={cls._id} value={cls._id}>
                {cls.name}
              </option>
            ))}
          </select>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-48"
          />
        </div>

        {selectedClass ? (
          <Table columns={columns} data={attendanceData} />
        ) : (
          <div className="text-center py-12 text-gray-500">
            Vui lòng chọn lớp học
          </div>
        )}
      </Card>
    </div>
  );
};

export default AttendanceTrackingPage;
