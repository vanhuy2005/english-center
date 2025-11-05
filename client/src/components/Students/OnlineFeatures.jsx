import React, { useState, useEffect } from "react";
import axios from "axios";
import "./OnlineFeatures.css";

function OnlineFeatures() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    fetchAvailableCourses();
  }, []);

  const fetchAvailableCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/courses");

      // Lọc các khóa học có status là "Sắp khai giảng"
      const availableCourses = response.data.filter(
        (course) =>
          course.status === "Sắp khai giảng" || course.status === "Đang diễn ra"
      );

      setCourses(availableCourses);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học");
      // Hiển thị khóa học mẫu
      setCourses(getMockCourses());
    } finally {
      setLoading(false);
    }
  };

  const getMockCourses = () => {
    return [
      {
        _id: 1,
        courseName: "TOEIC 600+",
        level: "Intermediate",
        duration: 12,
        tuition: 3000000,
        status: "Đang diễn ra",
        description:
          "Khóa học chuẩn bị cho kỳ thi TOEIC 600+, tập trung vào kỹ năng đọc hiểu và nghe.",
        currentStudents: 15,
        maxStudents: 30,
        startDate: "2024-09-01",
      },
      {
        _id: 2,
        courseName: "IELTS 6.5",
        level: "Advanced",
        duration: 16,
        tuition: 4000000,
        status: "Sắp khai giảng",
        description:
          "Khóa học chuẩn bị cho kỳ thi IELTS band 6.5, đầy đủ 4 kỹ năng.",
        currentStudents: 12,
        maxStudents: 25,
        startDate: "2025-01-15",
      },
      {
        _id: 3,
        courseName: "Conversational English",
        level: "Beginner",
        duration: 8,
        tuition: 2000000,
        status: "Đang diễn ra",
        description:
          "Khóa học tiếng Anh giao tiếp cơ bản, phát triển kỹ năng nói và nghe.",
        currentStudents: 28,
        maxStudents: 35,
        startDate: "2024-10-01",
      },
    ];
  };

  const handleEnroll = (course) => {
    setSelectedCourse(course);
  };

  const confirmEnroll = () => {
    alert(`Bạn đã đăng ký khóa học "${selectedCourse.courseName}" thành công!`);
    setSelectedCourse(null);
  };

  if (loading) {
    return (
      <div className="online-features-container">
        <h2>🌐 Đăng ký khóa học</h2>
        <div className="loading-spinner">
          <p>Đang tải danh sách khóa học...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="online-features-container">
      <h2>🌐 Đăng ký khóa học</h2>

      {error && (
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
      )}

      <div className="courses-grid">
        {courses.map((course) => (
          <div key={course._id} className="course-card-enroll">
            <div className="course-card-badge">
              <span
                className={`course-status ${
                  course.status === "Đang diễn ra" ? "ongoing" : "upcoming"
                }`}
              >
                {course.status}
              </span>
              <span
                className={`course-level level-${course.level.toLowerCase()}`}
              >
                {course.level}
              </span>
            </div>

            <div className="course-card-content">
              <h3>{course.courseName}</h3>

              <p className="course-description">{course.description}</p>

              <div className="course-info-grid">
                <div className="info-item">
                  <span className="info-label">⏱️ Thời hạn:</span>
                  <span className="info-value">{course.duration} tuần</span>
                </div>

                <div className="info-item">
                  <span className="info-label">💰 Học phí:</span>
                  <span className="info-value price">
                    {course.tuition.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">👥 Học viên:</span>
                  <span className="info-value">
                    {course.currentStudents}/{course.maxStudents}
                  </span>
                </div>

                <div className="info-item">
                  <span className="info-label">📅 Khai giảng:</span>
                  <span className="info-value">
                    {new Date(course.startDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="capacity-bar">
                <div
                  className="capacity-fill"
                  style={{
                    width: `${
                      (course.currentStudents / course.maxStudents) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="capacity-text">
                Còn {course.maxStudents - course.currentStudents} chỗ trống
              </p>
            </div>

            <button
              className="enroll-btn"
              onClick={() => handleEnroll(course)}
              disabled={course.currentStudents >= course.maxStudents}
            >
              {course.currentStudents >= course.maxStudents
                ? "❌ Đầy học viên"
                : "➕ Đăng ký"}
            </button>
          </div>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="no-courses">
          <p>Không có khóa học nào để đăng ký</p>
        </div>
      )}

      {/* Modal Confirm Enroll */}
      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Xác nhận đăng ký</h3>

            <div className="modal-body">
              <p>
                <strong>Khóa học:</strong> {selectedCourse.courseName}
              </p>
              <p>
                <strong>Thời hạn:</strong> {selectedCourse.duration} tuần
              </p>
              <p>
                <strong>Học phí:</strong>{" "}
                <span className="price">
                  {selectedCourse.tuition.toLocaleString("vi-VN")}đ
                </span>
              </p>
              <p>
                <strong>Khai giảng:</strong>{" "}
                {new Date(selectedCourse.startDate).toLocaleDateString("vi-VN")}
              </p>

              <div className="modal-warning">
                <p>
                  ⚠️ Vui lòng kiểm tra thông tin trước khi xác nhận đăng ký.
                </p>
              </div>
            </div>

            <div className="modal-buttons">
              <button className="confirm-btn" onClick={confirmEnroll}>
                ✅ Xác nhận
              </button>
              <button
                className="cancel-btn"
                onClick={() => setSelectedCourse(null)}
              >
                ❌ Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OnlineFeatures;
