import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Loading, Input, Badge } from "@components/common";
import { ArrowLeft, Star, Save, ThumbsUp, AlertCircle } from "lucide-react";
import api from "@services/api";
import { toast } from "react-hot-toast";

/**
 * Student Evaluation Page - Teacher evaluates students
 */
const StudentEvaluationPage = () => {
  const { classId } = useParams();
  const navigate = useNavigate();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [evaluations, setEvaluations] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, [classId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [classResponse, studentsResponse, evaluationsResponse] =
        await Promise.all([
          api.get(`/api/teachers/classes/${classId}`),
          api.get(`/api/teachers/classes/${classId}/students`),
          api.get(`/api/teachers/classes/${classId}/evaluations`),
        ]);

      setClassInfo(classResponse.data?.data?.class);
      setStudents(studentsResponse.data?.data?.students || []);

      // Build evaluations map
      const evaluationsData = evaluationsResponse.data?.data?.evaluations || [];
      const evaluationsMap = {};
      evaluationsData.forEach((evaluation) => {
        evaluationsMap[evaluation.student._id] = {
          participation: evaluation.participation || 0,
          homework: evaluation.homework || 0,
          attitude: evaluation.attitude || 0,
          progress: evaluation.progress || 0,
          comment: evaluation.comment || "",
        };
      });

      setEvaluations(evaluationsMap);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluationChange = (studentId, field, value) => {
    setEvaluations({
      ...evaluations,
      [studentId]: {
        ...(evaluations[studentId] || {
          participation: 0,
          homework: 0,
          attitude: 0,
          progress: 0,
          comment: "",
        }),
        [field]: value,
      },
    });
  };

  const handleSaveEvaluations = async () => {
    try {
      setSaving(true);

      const evaluationsArray = students.map((student) => ({
        student: student.student._id,
        ...(evaluations[student.student._id] || {
          participation: 0,
          homework: 0,
          attitude: 0,
          progress: 0,
          comment: "",
        }),
      }));

      await api.post(`/api/teachers/classes/${classId}/evaluations`, {
        evaluations: evaluationsArray,
      });

      toast.success("Lưu đánh giá thành công");
      fetchData();
    } catch (error) {
      console.error("Error saving evaluations:", error);
      toast.error(error.response?.data?.message || "Không thể lưu đánh giá");
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallScore = (studentId) => {
    const evaluation = evaluations[studentId];
    if (!evaluation) return 0;

    const { participation, homework, attitude, progress } = evaluation;
    return ((participation + homework + attitude + progress) / 4).toFixed(1);
  };

  const getScoreBadge = (score) => {
    if (score >= 8)
      return { variant: "success", label: "Xuất sắc", icon: ThumbsUp };
    if (score >= 6) return { variant: "info", label: "Khá", icon: Star };
    if (score >= 4)
      return { variant: "warning", label: "Trung bình", icon: AlertCircle };
    return { variant: "danger", label: "Cần cải thiện", icon: AlertCircle };
  };

  const evaluationCriteria = [
    { key: "participation", label: "Tham gia lớp học", max: 10 },
    { key: "homework", label: "Làm bài tập", max: 10 },
    { key: "attitude", label: "Thái độ học tập", max: 10 },
    { key: "progress", label: "Tiến bộ", max: 10 },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loading size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="secondary" size="small" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Đánh Giá Học Viên
          </h1>
          <p className="text-gray-600 mt-1">{classInfo?.name}</p>
        </div>
      </div>

      {/* Evaluation Guide */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-2">Hướng dẫn đánh giá</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-blue-800">
          {evaluationCriteria.map((criteria) => (
            <div key={criteria.key}>
              <p className="font-medium">{criteria.label}</p>
              <p>Thang điểm: 0-{criteria.max}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Students Evaluation */}
      <div className="space-y-4">
        {students.map((student) => {
          const studentEvaluation = evaluations[student.student._id] || {};
          const overallScore = calculateOverallScore(student.student._id);
          const scoreBadge = getScoreBadge(parseFloat(overallScore));
          const BadgeIcon = scoreBadge.icon;

          return (
            <Card key={student.student._id} className="p-6">
              <div className="space-y-4">
                {/* Student Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {student.student.fullName?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">
                        {student.student.fullName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {student.student.studentId}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Điểm tổng hợp</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {overallScore}
                      </span>
                      <Badge
                        variant={scoreBadge.variant}
                        className="flex items-center gap-1"
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {scoreBadge.label}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Evaluation Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {evaluationCriteria.map((criteria) => (
                    <div key={criteria.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {criteria.label}
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={criteria.max}
                          step="0.5"
                          value={studentEvaluation[criteria.key] || ""}
                          onChange={(e) =>
                            handleEvaluationChange(
                              student.student._id,
                              criteria.key,
                              parseFloat(e.target.value)
                            )
                          }
                          size="small"
                        />
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 cursor-pointer ${
                                i < (studentEvaluation[criteria.key] || 0) / 2
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                              onClick={() =>
                                handleEvaluationChange(
                                  student.student._id,
                                  criteria.key,
                                  (i + 1) * 2
                                )
                              }
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nhận xét
                  </label>
                  <textarea
                    value={studentEvaluation.comment || ""}
                    onChange={(e) =>
                      handleEvaluationChange(
                        student.student._id,
                        "comment",
                        e.target.value
                      )
                    }
                    placeholder="Nhận xét về học viên..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows="3"
                  />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="primary"
          onClick={handleSaveEvaluations}
          disabled={saving}
          size="large"
        >
          <Save className="w-5 h-5 mr-2" />
          {saving ? "Đang lưu..." : "Lưu đánh giá"}
        </Button>
      </div>
    </div>
  );
};

export default StudentEvaluationPage;
