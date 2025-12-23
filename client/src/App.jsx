import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@hooks";
import { Loading } from "@components/common";
import { MainLayout } from "@layouts";
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
import AccountantDashboardPage from "@pages/staff/accountant/AccountantDashboardPage";
import {
  ClassManagementPage,
  AttendanceTrackingPage,
  GradeManagementPage,
  StudentProgressPage,
  RequestHandlingPage,
  ClassReportsPage,
  AcademicStatisticsPage,
} from "@pages/staff/academic";
import ClassSchedulePage from "@pages/staff/academic/ClassSchedulePage";
import CourseManagementPage from "@pages/staff/academic/CourseManagementPage";
import AssignClassesPage from "@pages/staff/academic/AssignClassesPage";

// Student Pages
import ProfilePage from "@pages/student/ProfilePage";
import NotificationsPage from "@pages/student/NotificationsPage";
import SchedulePage from "@pages/student/SchedulePage";
import StudentTimetablePage from "@pages/student/StudentTimetablePage";
import GradesPage from "@pages/student/GradesPage";
import TuitionPage from "@pages/student/TuitionPage";
import MyCoursesPage from "@pages/student/MyCoursesPage";
import RequestListPage from "@pages/student/RequestListPage";
import RequestFormPage from "@pages/student/RequestFormPage";
import EnrollPage from "@pages/student/EnrollPage";

// Enrollment Staff Pages
import {
  StudentManagementPage,
  StudentDetailPage,
  RequestManagementPage,
  ClassTrackingPage,
  StatisticsPage,
} from "@pages/staff/enrollment";
import EnrollmentPlaceholderPage from "@pages/staff/enrollment/PlaceholderPage";
import { ClassDetailPage } from "@pages/classes";

// Accountant Staff Pages
import {
  StudentFinancePage,
  TuitionStatusPage,
  TransactionListPage,
  TransactionDetailPage,
  PaymentManagementPage,
  ReceiptManagementPage,
  StudentPaymentHistoryPage,
  RevenueReportsPage,
  ExportReportsPage,
  UpdateTuitionPage,
  RefundTuitionPage,
  CreateReceiptPage,
  ReceiptStatisticsPage,
} from "./pages/staff/accountant";

import { AcademicStaffDashboardPage } from "./pages/staff/academic";

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
      return <AccountantDashboardPage />;
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
      <Route path="/login" element={<LoginPage />} />

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
            <ProtectedRoute
              allowedRoles={[
                "student",
                "academic",
                "accountant",
                "enrollment",
                "teacher",
                "director",
              ]}
            >
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute
              allowedRoles={[
                "student",
                "academic",
                "accountant",
                "enrollment",
                "teacher",
                "director",
              ]}
            >
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
          path="/timetable"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentTimetablePage />
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
        <Route
          path="/academic/classes"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <ClassManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/courses"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <CourseManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/schedule"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <ClassSchedulePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/attendance"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <AttendanceTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/grades"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <GradeManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/students"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <StudentProgressPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/assign-classes"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <AssignClassesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/requests"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <RequestHandlingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/reports"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <ClassReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/academic/statistics"
          element={
            <ProtectedRoute allowedRoles={["academic", "director"]}>
              <AcademicStatisticsPage />
            </ProtectedRoute>
          }
        />

        {/* Enrollment Staff Routes */}
        <Route
          path="/enrollment/students"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <StudentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/requests"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <RequestManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/students/search"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <StudentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/students/:id"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <StudentDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/classes"
          element={
            <ProtectedRoute
              allowedRoles={["enrollment", "director", "teacher"]}
            >
              <ClassTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/classes"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <ClassTrackingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/classes/:id"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <ClassDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/notifications"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enrollment/reports"
          element={
            <ProtectedRoute allowedRoles={["enrollment", "director"]}>
              <StatisticsPage />
            </ProtectedRoute>
          }
        />

        {/* Accountant Staff Routes */}
        <Route
          path="/accountant"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <AccountantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/dashboard"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <AccountantDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/students"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <StudentFinancePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/students/:id/payments"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <StudentPaymentHistoryPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/tuition"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <TuitionStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/tuition-status"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <TuitionStatusPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/receipts"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <ReceiptManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/receipts/statistics"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <ReceiptStatisticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/create-receipt"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <CreateReceiptPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/reports"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <RevenueReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/update-tuition"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <UpdateTuitionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/refund"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <RefundTuitionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/transactions"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <TransactionListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/transactions/:id"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <TransactionDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/payments"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <PaymentManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/accountant/export"
          element={
            <ProtectedRoute allowedRoles={["accountant", "director"]}>
              <ExportReportsPage />
            </ProtectedRoute>
          }
        />

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
