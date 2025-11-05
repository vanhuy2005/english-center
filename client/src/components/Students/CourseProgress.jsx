import React, { useState, useEffect } from "react";
import axios from "axios";

function CourseProgress({ student }) {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost:5000/api/courses");

      // Thêm dữ liệu tiến độ cho mỗi khóa học
      const coursesWithProgress = response.data.map((course) => {
        // Tính toán tiến độ dựa trên số tuần đã học
        const totalLessons = course.duration * 10; // Mỗi tuần 10 bài
        const completedLessons = Math.floor(totalLessons * 0.44); // 44% = 0.44
        const progress = Math.round((completedLessons / totalLessons) * 100);

        return {
          ...course,
          progress: progress,
          completedLessons: completedLessons,
          totalLessons: totalLessons,
          teacher: "Giảng viên (Chưa cập nhật)",
        };
      });

      setCourses(coursesWithProgress);
      setError(null);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Không thể tải danh sách khóa học");
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
        progress: 75,
        totalLessons: 120,
        completedLessons: 90,
        startDate: new Date("2024-09-01").toLocaleDateString("vi-VN"),
        endDate: new Date("2024-12-01").toLocaleDateString("vi-VN"),
        status: "Đang diễn ra",
        teacher: "Thầy John Smith",
      },
      {
        _id: 2,
        courseName: "IELTS 6.5",
        level: "Advanced",
        progress: 45,
        totalLessons: 160,
        completedLessons: 72,
        startDate: new Date("2024-10-15").toLocaleDateString("vi-VN"),
        endDate: new Date("2025-01-15").toLocaleDateString("vi-VN"),
        status: "Đang diễn ra",
        teacher: "Cô Sarah Johnson",
      },
      {
        _id: 3,
        courseName: "Conversational English",
        level: "Beginner",
        progress: 100,
        totalLessons: 80,
        completedLessons: 80,
        startDate: new Date("2024-06-01").toLocaleDateString("vi-VN"),
        endDate: new Date("2024-08-01").toLocaleDateString("vi-VN"),
        status: "Kết thúc",
        teacher: "Thầy Michael Brown",
      },
    ];
  };

  const renderCourseCard = (course) => (
    <div key={course._id} className="course-card-large">
      <div className="course-header">
        <h3>{course.courseName}</h3>
        <span
          className={`status-badge ${
            course.status === "Kết thúc" ? "completed" : "ongoing"
          }`}
        >
          {course.status}
        </span>
      </div>

      <div className="course-info">
        <p>
          <strong>Trình độ:</strong> {course.level}
        </p>
        <p>
          <strong>Giảng viên:</strong> {course.teacher}
        </p>
        <p>
          <strong>Khoá học:</strong> {course.startDate} - {course.endDate}
        </p>
      </div>

      <div className="progress-section">
        <div className="progress-header">
          <span>Tiến độ học tập</span>
          <span className="progress-text">{course.progress}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${course.progress}%` }}
          ></div>
        </div>
        <p className="lesson-count">
          Hoàn thành {course.completedLessons}/{course.totalLessons} bài học
        </p>
      </div>

      <button className="view-details-btn">Xem chi tiết →</button>
    </div>
  );

  if (loading) {
    return (
      <div className="course-progress-container">
        <h2>📚 Tiến độ khóa học</h2>
        <div className="loading-spinner">
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-progress-container">
        <h2>📚 Tiến độ khóa học</h2>
        <div className="error-message">
          <p>⚠️ {error}</p>
        </div>
        <div className="courses-grid">
          {getMockCourses().map((course) => renderCourseCard(course))}
        </div>
      </div>
    );
  }

  return (
    <div className="course-progress-container">
      <h2>📚 Tiến độ khóa học</h2>

      <div className="courses-grid">
        {courses.map((course) => renderCourseCard(course))}
      </div>

      {courses.length === 0 && (
        <div className="no-courses">
          <p>Bạn chưa đăng ký khóa học nào</p>
        </div>
      )}
    </div>
  );
}

export default CourseProgress;
