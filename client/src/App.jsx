import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@hooks";
import { Loading } from "@components/common";
import { AuthLayout, MainLayout } from "@layouts";
import { getMenuByRole } from "@config/menu";

// Auth Pages
import LoginPage from "@pages/auth/LoginPage";
import RoleSelectionPage from "@pages/auth/RoleSelectionPage";

// Dashboard Pages
import {
  DirectorDashboard,
  UserManagementPage,
  RevenueReportPage,
  StudentReportPage,
  ClassReportPage,
  TeacherReportPage,
  RetentionReportPage,
  DepartmentsPage,
} from "@pages/director";
import TeacherDashboardPage from "@pages/teacher/TeacherDashboardPage";
import StudentDashboard from "@pages/student/StudentDashboard";
import EnrollmentStaffDashboard from "@pages/staff/EnrollmentStaffDashboard";
import AcademicStaffDashboard from "@pages/staff/academic/AcademicStaffDashboardPage";
import AccountantDashboard from "@pages/staff/accountant/AccountantDashboardPage";
import {
  ClassManagementPage,
  AttendanceTrackingPage,
  GradeManagementPage,
  StudentProgressPage,
  RequestHandlingPage,
  ClassReportsPage,
  AcademicStatisticsPage,
} from "@pages/staff/academic";

// Student Pages
import ProfilePage from "@pages/student/ProfilePage";
import NotificationsPage from "@pages/student/NotificationsPage";
import SchedulePage from "@pages/student/SchedulePage";
import GradesPage from "@pages/student/GradesPage";
import TuitionPage from "@pages/student/TuitionPage";
import MyCoursesPage from "@pages/student/MyCoursesPage";
import RequestListPage from "@pages/student/RequestListPage";
import RequestFormPage from "@pages/student/RequestFormPage";
import EnrollPage from "@pages/student/EnrollPage";

// Enrollment Staff Pages
import {
  StudentManagementPage,
  RequestManagementPage,
  ClassTrackingPage,
  StatisticsPage,
} from "@pages/staff/enrollment";
import EnrollmentPlaceholderPage from "@pages/staff/enrollment/PlaceholderPage";

/**
 * Protected Route Component
 */
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Đang tải..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

/**
 * Dashboard Route based on role
 */
const DashboardRoute = () => {
  const { role } = useAuth();
  switch (role) {
    case "director":
      return <DirectorDashboard />;
    case "teacher":
      return <TeacherDashboardPage />;
    case "student":
      return <StudentDashboard />;
    case "enrollment":
      return <EnrollmentStaffDashboard />;
    case "academic":
      return <AcademicStaffDashboard />;
    case "accountant":
      return <AccountantDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/**
 * Layout Route with menu based on role
 */
const LayoutRoute = () => {
  const { role } = useAuth();
  const menuItems = getMenuByRole(role);

  return <MainLayout menuItems={menuItems} />;
};

function App() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Đang khởi tạo..." />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes with MainLayout */}
      <Route
        element={
          <ProtectedRoute>
            <LayoutRoute />
          </ProtectedRoute>
        }
      >
        {/* Dashboard Route */}
        <Route path="/dashboard" element={<DashboardRoute />} />

        {/* Director Routes */}
        <Route
          path="/users"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <UserManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/revenue"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <RevenueReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/students"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <StudentReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/classes"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <ClassReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/teachers"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <TeacherReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/retention"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <RetentionReportPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute allowedRoles={["director"]}>
              <DepartmentsPage />
            </ProtectedRoute>
          }
        />

        {/* Student Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["student", "academic", "accountant", "enrollment", "teacher", "director"]}>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute allowedRoles={["student", "academic", "accountant", "enrollment", "teacher", "director"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute allowedRoles={["student", "academic", "teacher"]}>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/grades"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <GradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tuition"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <TuitionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-courses"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <MyCoursesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RequestListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests/new"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <RequestFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enroll"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <EnrollPage />
            </ProtectedRoute>
          }
        />

        {/* Academic Staff Routes */}
        <Route path="/academic/classes" element={<ProtectedRoute allowedRoles={["academic", "director"]}><ClassManagementPage /></ProtectedRoute>} />
        <Route path="/academic/schedule" element={<ProtectedRoute allowedRoles={["academic", "director"]}><SchedulePage /></ProtectedRoute>} />
        <Route path="/academic/attendance" element={<ProtectedRoute allowedRoles={["academic", "director"]}><AttendanceTrackingPage /></ProtectedRoute>} />
        <Route path="/academic/grades" element={<ProtectedRoute allowedRoles={["academic", "director"]}><GradeManagementPage /></ProtectedRoute>} />
        <Route path="/academic/students" element={<ProtectedRoute allowedRoles={["academic", "director"]}><StudentProgressPage /></ProtectedRoute>} />
        <Route path="/academic/requests" element={<ProtectedRoute allowedRoles={["academic", "director"]}><RequestHandlingPage /></ProtectedRoute>} />
        <Route path="/academic/reports" element={<ProtectedRoute allowedRoles={["academic", "director"]}><ClassReportsPage /></ProtectedRoute>} />
        <Route path="/academic/statistics" element={<ProtectedRoute allowedRoles={["academic", "director"]}><AcademicStatisticsPage /></ProtectedRoute>} />

        {/* Enrollment Staff Routes */}
        <Route path="/enrollment/students" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><StudentManagementPage /></ProtectedRoute>} />
        <Route path="/enrollment/students/search" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><StudentManagementPage /></ProtectedRoute>} />
        <Route path="/enrollment/students/:id" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><EnrollmentPlaceholderPage title="Chi Tiết Học Viên" /></ProtectedRoute>} />
        <Route path="/classes" element={<ProtectedRoute allowedRoles={["enrollment", "director", "teacher"]}><ClassTrackingPage /></ProtectedRoute>} />
        <Route path="/enrollment/classes" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><ClassTrackingPage /></ProtectedRoute>} />
        <Route path="/enrollment/classes/:id" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><EnrollmentPlaceholderPage title="Chi Tiết Lớp Học" /></ProtectedRoute>} />
        <Route path="/enrollment/requests" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><RequestManagementPage /></ProtectedRoute>} />
        <Route path="/enrollment/notifications" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><NotificationsPage /></ProtectedRoute>} />
        <Route path="/enrollment/reports" element={<ProtectedRoute allowedRoles={["enrollment", "director"]}><StatisticsPage /></ProtectedRoute>} />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Route>

      {/* Redirects */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
