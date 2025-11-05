import React, { useState, useEffect } from "react";
import axios from "axios";
import "./LeaveRequest.css";

function LeaveRequest() {
  const [activeTab, setActiveTab] = useState("leave");
  const [leaveForm, setLeaveForm] = useState({
    leaveType: "nghỉ_phép",
    startDate: "",
    endDate: "",
    reason: "",
    attachments: null,
  });

  const [makeupForm, setMakeupForm] = useState({
    courseId: "",
    courseName: "",
    requestedDate: "",
    reason: "",
    notes: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [leaveHistory, setLeaveHistory] = useState([]);
  const [makeupHistory, setMakeupHistory] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch leave requests
      const leaveResponse = await axios.get(
        "http://localhost:5000/api/leave-requests/my-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLeaveHistory(leaveResponse.data);

      // Fetch makeup class requests
      const makeupResponse = await axios.get(
        "http://localhost:5000/api/makeup-classes/my-requests",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMakeupHistory(makeupResponse.data);

      // Fetch courses
      const coursesResponse = await axios.get(
        "http://localhost:5000/api/courses"
      );
      setCourses(coursesResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "attachments") {
      setLeaveForm((prev) => ({
        ...prev,
        [name]: files[0],
      }));
    } else {
      setLeaveForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleMakeupChange = (e) => {
    const { name, value } = e.target;
    if (name === "courseName") {
      const selectedCourse = courses.find((c) => c.courseName === value);
      setMakeupForm((prev) => ({
        ...prev,
        courseId: selectedCourse?._id || "",
        courseName: value,
      }));
    } else {
      setMakeupForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();

    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/leave-requests",
        {
          leaveType: leaveForm.leaveType,
          startDate: leaveForm.startDate,
          endDate: leaveForm.endDate,
          reason: leaveForm.reason,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setLeaveHistory([response.data.data, ...leaveHistory]);
        setSubmitted(true);
        setLeaveForm({
          leaveType: "nghỉ_phép",
          startDate: "",
          endDate: "",
          reason: "",
          attachments: null,
        });

        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting leave request:", error);
      alert(error.response?.data?.message || "Lỗi khi nộp đơn");
    }
  };

  const handleMakeupSubmit = async (e) => {
    e.preventDefault();

    if (
      !makeupForm.courseId ||
      !makeupForm.requestedDate ||
      !makeupForm.reason
    ) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/makeup-classes",
        {
          courseId: makeupForm.courseId,
          courseName: makeupForm.courseName,
          requestedDate: makeupForm.requestedDate,
          reason: makeupForm.reason,
          notes: makeupForm.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        setMakeupHistory([response.data.data, ...makeupHistory]);
        setSubmitted(true);
        setMakeupForm({
          courseId: "",
          courseName: "",
          requestedDate: "",
          reason: "",
          notes: "",
        });

        setTimeout(() => {
          setSubmitted(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error submitting makeup request:", error);
      alert(error.response?.data?.message || "Lỗi khi nộp đơn");
    }
  };

  const getLeaveTypeLabel = (type) => {
    switch (type) {
      case "nghỉ_phép":
        return "Nghỉ phép";
      case "nghỉ_ốm":
        return "Nghỉ ốm";
      case "nghỉ_lý_do":
        return "Nghỉ có lý do";
      default:
        return type;
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === "Đã duyệt" || status === "Được duyệt") return "approved";
    if (status === "Từ chối") return "rejected";
    return "pending";
  };

  return (
    <div className="leave-request-container">
      <h2>📋 Xin nghỉ và học bù</h2>

      <div className="tab-buttons">
        <button
          className={`tab-btn ${activeTab === "leave" ? "active" : ""}`}
          onClick={() => setActiveTab("leave")}
        >
          📝 Xin Nghỉ
        </button>
        <button
          className={`tab-btn ${activeTab === "makeup" ? "active" : ""}`}
          onClick={() => setActiveTab("makeup")}
        >
          📚 Học Bù
        </button>
      </div>

      {/* Leave Tab */}
      {activeTab === "leave" && (
        <div className="leave-content">
          <div className="form-section">
            <h3>📝 Nộp đơn xin nghỉ</h3>

            {submitted && (
              <div className="success-message">
                ✅ Nộp đơn thành công! Đang chờ duyệt.
              </div>
            )}

            <form onSubmit={handleLeaveSubmit} className="leave-form">
              <div className="form-group">
                <label>Loại nghỉ *</label>
                <select
                  name="leaveType"
                  value={leaveForm.leaveType}
                  onChange={handleLeaveChange}
                  required
                >
                  <option value="nghỉ_phép">Nghỉ phép</option>
                  <option value="nghỉ_ốm">Nghỉ ốm</option>
                  <option value="nghỉ_lý_do">Nghỉ có lý do</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={leaveForm.startDate}
                    onChange={handleLeaveChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    name="endDate"
                    value={leaveForm.endDate}
                    onChange={handleLeaveChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lý do nghỉ *</label>
                <textarea
                  name="reason"
                  value={leaveForm.reason}
                  onChange={handleLeaveChange}
                  placeholder="Nhập lý do xin nghỉ"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  📤 Nộp đơn
                </button>
                <button type="reset" className="reset-btn">
                  🔄 Xóa
                </button>
              </div>
            </form>
          </div>

          <div className="history-section">
            <h3>📌 Lịch sử xin nghỉ</h3>

            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Loại nghỉ</th>
                      <th>Từ ngày</th>
                      <th>Đến ngày</th>
                      <th>Số ngày</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaveHistory.map((leave) => (
                      <tr key={leave._id}>
                        <td>{getLeaveTypeLabel(leave.leaveType)}</td>
                        <td>
                          {new Date(leave.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td>
                          {new Date(leave.endDate).toLocaleDateString("vi-VN")}
                        </td>
                        <td className="days-cell">{leave.numberOfDays} ngày</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              leave.status
                            )}`}
                          >
                            {leave.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {leaveHistory.length === 0 && !loading && (
              <div className="no-data">
                <p>Chưa có lịch sử xin nghỉ</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Makeup Tab */}
      {activeTab === "makeup" && (
        <div className="makeup-content">
          <div className="form-section">
            <h3>📚 Nộp đơn học bù</h3>

            {submitted && (
              <div className="success-message">
                ✅ Nộp đơn thành công! Đang chờ duyệt.
              </div>
            )}

            <form onSubmit={handleMakeupSubmit} className="leave-form">
              <div className="form-group">
                <label>Khóa học *</label>
                <select
                  name="courseName"
                  value={makeupForm.courseName}
                  onChange={handleMakeupChange}
                  required
                >
                  <option value="">Chọn khóa học</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course.courseName}>
                      {course.courseName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Ngày yêu cầu học bù *</label>
                  <input
                    type="date"
                    name="requestedDate"
                    value={makeupForm.requestedDate}
                    onChange={handleMakeupChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Lý do vắng và cần học bù *</label>
                <textarea
                  name="reason"
                  value={makeupForm.reason}
                  onChange={handleMakeupChange}
                  placeholder="Nhập lý do vắng và nhu cầu học bù"
                  rows="4"
                  required
                ></textarea>
              </div>

              <div className="form-group">
                <label>Ghi chú thêm (tùy chọn)</label>
                <textarea
                  name="notes"
                  value={makeupForm.notes}
                  onChange={handleMakeupChange}
                  placeholder="Nhập ghi chú thêm"
                  rows="3"
                ></textarea>
              </div>

              <div className="form-buttons">
                <button type="submit" className="submit-btn">
                  📤 Nộp đơn
                </button>
                <button type="reset" className="reset-btn">
                  🔄 Xóa
                </button>
              </div>
            </form>
          </div>

          <div className="history-section">
            <h3>📌 Lịch sử học bù</h3>

            {loading ? (
              <p>Đang tải...</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Khóa học</th>
                      <th>Ngày yêu cầu</th>
                      <th>Lý do</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {makeupHistory.map((makeup) => (
                      <tr key={makeup._id}>
                        <td>{makeup.courseName}</td>
                        <td>
                          {new Date(makeup.requestedDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </td>
                        <td className="reason-cell">
                          {makeup.reason.substring(0, 50)}...
                        </td>
                        <td>
                          <span
                            className={`status-badge ${getStatusBadgeClass(
                              makeup.status
                            )}`}
                          >
                            {makeup.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {makeupHistory.length === 0 && !loading && (
              <div className="no-data">
                <p>Chưa có lịch sử học bù</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default LeaveRequest;
