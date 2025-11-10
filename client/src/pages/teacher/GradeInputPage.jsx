import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Table, Input } from "@components/common";
import { classService } from "@services";
import apiClient from "@services/api";
import toast from "react-hot-toast";
import { useLanguage } from "@hooks";

/**
 * GradeInputPage - Teacher enters/updates grades
 */
const GradeInputPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState({});

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch class details
      const classRes = await classService.getById(classId);
      setClassData(classRes.data);

      // Fetch students in class
      const studentsRes = await classService.getStudents(classId);
      const studentList = studentsRes.data || [];
      setStudents(studentList);

      // Fetch existing grades
      try {
        const gradesRes = await apiClient.get(`/api/grades/class/${classId}`);
        if (gradesRes.data && gradesRes.data.length > 0) {
          const existingGrades = {};
          gradesRes.data.forEach((grade) => {
            existingGrades[grade.student._id || grade.student] = {
              midterm: grade.scores?.midterm || 0,
              final: grade.scores?.final || 0,
              assignment: grade.scores?.assignment || 0,
              participation: grade.scores?.participation || 0,
              _id: grade._id,
            };
          });
          setGrades(existingGrades);
        } else {
          // Initialize empty grades
          initializeGrades(studentList);
        }
      } catch (err) {
        // No existing grades, initialize empty
        initializeGrades(studentList);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const initializeGrades = (studentList) => {
    const initialGrades = {};
    studentList.forEach((student) => {
      initialGrades[student._id] = {
        midterm: 0,
        final: 0,
        assignment: 0,
        participation: 0,
      };
    });
    setGrades(initialGrades);
  };

  const handleGradeChange = (studentId, field, value) => {
    const numValue = parseFloat(value) || 0;
    // Validate score (0-10)
    if (numValue < 0 || numValue > 10) {
      toast.error("Điểm phải từ 0 đến 10");
      return;
    }

    setGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: numValue,
      },
    }));
  };

  const calculateFinalScore = (studentGrade) => {
    if (!studentGrade) return 0;
    // Formula: 10% Participation + 20% Assignment + 30% Midterm + 40% Final
    const finalScore =
      studentGrade.participation * 0.1 +
      studentGrade.assignment * 0.2 +
      studentGrade.midterm * 0.3 +
      studentGrade.final * 0.4;
    return Math.round(finalScore * 10) / 10;
  };

  const getGradeLabel = (score) => {
    if (score >= 9) return { label: "Xuất sắc", color: "text-success" };
    if (score >= 8) return { label: "Giỏi", color: "text-info" };
    if (score >= 6.5) return { label: "Khá", color: "text-primary" };
    if (score >= 5) return { label: "Trung bình", color: "text-warning" };
    return { label: "Yếu", color: "text-danger" };
  };

  const handleSaveGrades = async () => {
    try {
      setSaving(true);

      // Prepare grades data
      const gradesData = students.map((student) => {
        const studentGrade = grades[student._id] || {};
        return {
          _id: studentGrade._id, // Include if updating existing grade
          student: student._id,
          class: classId,
          scores: {
            midterm: studentGrade.midterm || 0,
            final: studentGrade.final || 0,
            assignment: studentGrade.assignment || 0,
            participation: studentGrade.participation || 0,
          },
          finalScore: calculateFinalScore(studentGrade),
        };
      });

      // Send to backend (bulk create/update)
      await apiClient.post(`/api/grades/bulk`, {
        classId,
        grades: gradesData,
      });

      toast.success("Lưu điểm thành công!");
      navigate(`/classes/${classId}`);
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error(error.response?.data?.message || "Không thể lưu điểm");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  const columns = [
    {
      header: "STT",
      accessor: (_, index) => index + 1,
      className: "w-16 text-center",
    },
    {
      header: "Mã HV",
      accessor: (row) => row.studentCode || "N/A",
    },
    {
      header: "Họ và tên",
      accessor: (row) => row.fullName || row.user?.fullName || "N/A",
    },
    {
      header: "Tham gia (10%)",
      accessor: (row) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={grades[row._id]?.participation || 0}
          onChange={(e) =>
            handleGradeChange(row._id, "participation", e.target.value)
          }
          className="w-20 text-center"
        />
      ),
    },
    {
      header: "Bài tập (20%)",
      accessor: (row) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={grades[row._id]?.assignment || 0}
          onChange={(e) =>
            handleGradeChange(row._id, "assignment", e.target.value)
          }
          className="w-20 text-center"
        />
      ),
    },
    {
      header: "Giữa kỳ (30%)",
      accessor: (row) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={grades[row._id]?.midterm || 0}
          onChange={(e) =>
            handleGradeChange(row._id, "midterm", e.target.value)
          }
          className="w-20 text-center"
        />
      ),
    },
    {
      header: "Cuối kỳ (40%)",
      accessor: (row) => (
        <Input
          type="number"
          min="0"
          max="10"
          step="0.5"
          value={grades[row._id]?.final || 0}
          onChange={(e) => handleGradeChange(row._id, "final", e.target.value)}
          className="w-20 text-center"
        />
      ),
    },
    {
      header: "Điểm TB",
      accessor: (row) => {
        const finalScore = calculateFinalScore(grades[row._id]);
        const gradeInfo = getGradeLabel(finalScore);
        return (
          <div className="text-center">
            <div className="text-lg font-bold">{finalScore.toFixed(1)}</div>
            <div className={`text-xs ${gradeInfo.color}`}>
              {gradeInfo.label}
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nhập điểm</h1>
          <p className="text-gray-600">
            Lớp: {classData?.className || "N/A"} (
            {classData?.classCode || "N/A"})
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate(-1)}>
          ← Quay lại
        </Button>
      </div>

      {/* Grade Structure Info */}
      <Card>
        <h3 className="text-lg font-semibold mb-4">Cấu trúc điểm</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">10%</div>
            <div className="text-sm text-gray-600">Tham gia</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">20%</div>
            <div className="text-sm text-gray-600">Bài tập</div>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">30%</div>
            <div className="text-sm text-gray-600">Giữa kỳ</div>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">40%</div>
            <div className="text-sm text-gray-600">Cuối kỳ</div>
          </div>
        </div>
      </Card>

      {/* Grades Table */}
      <Card>
        <Table columns={columns} data={students} />
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate(-1)}>
          Hủy
        </Button>
        <Button onClick={handleSaveGrades} loading={saving}>
          💾 Lưu điểm
        </Button>
      </div>
    </div>
  );
};

export default GradeInputPage;
