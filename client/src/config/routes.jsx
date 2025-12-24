import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Auth Pages
import LoginPage from "@pages/auth/LoginPage";
import RegisterPage from "@pages/auth/RegisterPage";

// Director Pages
import DirectorDashboard from "@pages/director/DirectorDashboard";
import UserManagementPage from "@pages/director/UserManagementPage";

// Student Pages
import StudentDashboard from "@pages/student/StudentDashboard";
import ProfilePage from "@pages/student/ProfilePage";
import NotificationsPage from "@pages/student/NotificationsPage";
import SchedulePage from "@pages/student/SchedulePage";
import StudentTimetablePage from "@pages/student/StudentTimetablePage";
import GradesPage from "@pages/student/GradesPage";
import TuitionPage from "@pages/student/TuitionPage";
import RequestFormPage from "@pages/student/RequestFormPage";
import MyCoursesPage from "@pages/student/MyCoursesPage";
import StudentGradesPage from "@pages/student/StudentGradesPage";
import StudentAttendancePage from "@pages/student/StudentAttendancePage";
import RequestListPage from "@pages/student/RequestListPage";

// Staff Pages
import EnrollmentStaffDashboard from "@pages/staff/EnrollmentStaffDashboard";
import AcademicStaffDashboard from "@pages/staff/academic/AcademicStaffDashboardPage";
import AccountantDashboard from "@pages/staff/accountant/AccountantDashboardPage";
import {
  StudentManagementPage as EnrollmentStudentManagement,
  RequestManagementPage as EnrollmentRequestManagement,
  ClassTrackingPage,
  StatisticsPage,
} from "@pages/staff/enrollment";

// Academic Staff Pages
import AcademicStaffDashboardPage from "@pages/staff/academic/AcademicStaffDashboardPage";
import ClassManagementPage from "@pages/staff/academic/ClassManagementPage";
import CourseManagementPage from "@pages/staff/academic/CourseManagementPage";
import ClassSchedulePage from "@pages/staff/academic/ClassSchedulePage";
import AttendanceTrackingPage from "@pages/staff/academic/AttendanceTrackingPage";
import GradeManagementPage from "@pages/staff/academic/GradeManagementPage";
import StudentProgressPage from "@pages/staff/academic/StudentProgressPage";
import RequestHandlingPage from "@pages/staff/academic/RequestHandlingPage";
import ClassReportsPage from "@pages/staff/academic/ClassReportsPage";
import AcademicStatisticsPage from "@pages/staff/academic/AcademicStatisticsPage";
import AssignClassesPage from "@pages/staff/academic/AssignClassesPage";

// Accountant Pages
import AccountantDashboardPage from "@pages/staff/accountant/AccountantDashboardPage";
import TuitionManagementPage from "@pages/staff/accountant/TuitionManagementPage";
import PaymentReceiptsPage from "@pages/staff/accountant/PaymentReceiptsPage";
import CreateReceiptPage from "@pages/staff/accountant/CreateReceiptPage";
import TuitionStatusPage from "@pages/staff/accountant/TuitionStatusPage";
import DebtTrackingPage from "@pages/staff/accountant/DebtTrackingPage";
import RefundProcessingPage from "@pages/staff/accountant/RefundProcessingPage";
import RevenueReportsPage from "@pages/staff/accountant/RevenueReportsPage";
import ExportReportsPage from "@pages/staff/accountant/ExportReportsPage";
import AccountantSchedulePage from "@pages/staff/accountant/AccountantSchedulePage";
import AccountantNotificationsPage from "@pages/staff/accountant/AccountantNotificationsPage";
import AccountantProfilePage from "@pages/staff/accountant/AccountantProfilePage";
import StudentFinancePage from "@pages/staff/accountant/StudentFinancePage";
import StudentPaymentHistoryPage from "@pages/staff/accountant/StudentPaymentHistoryPage";

// Student Management
import StudentListPage from "@pages/student/StudentListPage";
import StudentDetailPage from "@pages/student/StudentDetailPage";

// Class Management
import { ClassListPage, ClassDetailPage } from "@pages/classes";

// Schedule
import { ScheduleCalendarPage } from "@pages/schedule";

/**
 * Dashboard component selector based on role
 */
export const DashboardRoute = ({ role }) => {
  switch (role) {
    case "director":
      return <DirectorDashboard />;
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
 * Role-based route protection
 */
export const roleRoutes = {
  // Public routes (no authentication required)
  public: [
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
  ],

  // Common routes (all authenticated users)
  common: [
    { path: "/dashboard", element: <DashboardRoute /> },
    { path: "/profile", element: <div>Profile Page - TODO</div> },
    { path: "/notifications", element: <div>Notifications - TODO</div> },
  ],

  // Director-specific routes
  director: [
    { path: "/users", element: <UserManagementPage /> },
    { path: "/students", element: <StudentListPage /> },
    { path: "/students/:id", element: <StudentDetailPage /> },
    { path: "/classes", element: <ClassListPage /> },
    { path: "/classes/:id", element: <ClassDetailPage /> },
    { path: "/finance", element: <div>Finance Management - TODO</div> },
    { path: "/reports", element: <div>Reports - TODO</div> },
  ],

  // Student-specific routes
  student: [
    { path: "/profile", element: <ProfilePage /> },
    { path: "/notifications", element: <NotificationsPage /> },
    { path: "/schedule", element: <SchedulePage /> },
    { path: "/timetable", element: <StudentTimetablePage /> },
    { path: "/grades", element: <GradesPage /> },
    { path: "/tuition", element: <TuitionPage /> },
    { path: "/my-courses", element: <MyCoursesPage /> },
    { path: "/requests", element: <RequestListPage /> },
    { path: "/requests/new", element: <RequestFormPage /> },
    { path: "/attendance", element: <StudentAttendancePage /> },
  ],

  // Enrollment Staff routes
  enrollment: [
    { path: "/enrollment/students", element: <EnrollmentStudentManagement /> },
    { path: "/enrollment/requests", element: <EnrollmentRequestManagement /> },
    { path: "/enrollment/classes", element: <ClassTrackingPage /> },
    { path: "/enrollment/statistics", element: <StatisticsPage /> },
    { path: "/classes", element: <ClassListPage /> },
    { path: "/classes/:id", element: <ClassDetailPage /> },
  ],

  // Academic Staff routes
  academic: [
    { path: "/dashboard", element: <AcademicStaffDashboardPage /> },
    { path: "/academic/classes", element: <ClassManagementPage /> },
    { path: "/academic/courses", element: <CourseManagementPage /> },
    { path: "/academic/schedule", element: <ClassSchedulePage /> },
    { path: "/academic/attendance", element: <AttendanceTrackingPage /> },
    { path: "/academic/grades", element: <GradeManagementPage /> },
    { path: "/academic/students", element: <StudentProgressPage /> },
    { path: "/academic/assign-classes", element: <AssignClassesPage /> },
    { path: "/academic/requests", element: <RequestHandlingPage /> },
    { path: "/academic/reports", element: <ClassReportsPage /> },
    { path: "/academic/reports/class/:classId", element: <ClassReportsPage /> },
    { path: "/academic/statistics", element: <AcademicStatisticsPage /> },
    { path: "/students", element: <StudentListPage /> },
    { path: "/students/:id", element: <StudentDetailPage /> },
    { path: "/classes", element: <ClassListPage /> },
    { path: "/classes/:id", element: <ClassDetailPage /> },
  ],

  // Accountant routes
  accountant: [
    { path: "/dashboard", element: <AccountantDashboardPage /> },
    { path: "/accountant/tuition", element: <TuitionManagementPage /> },
    { path: "/accountant/tuition-status", element: <TuitionStatusPage /> },
    { path: "/accountant/receipts", element: <PaymentReceiptsPage /> },
    { path: "/accountant/create-receipt", element: <CreateReceiptPage /> },
    { path: "/accountant/debt", element: <DebtTrackingPage /> },
    { path: "/accountant/refund", element: <RefundProcessingPage /> },
    { path: "/accountant/reports", element: <RevenueReportsPage /> },
    { path: "/accountant/export", element: <ExportReportsPage /> },
    { path: "/accountant/schedule", element: <AccountantSchedulePage /> },
    { path: "/accountant/students", element: <StudentFinancePage /> },
    { path: "/accountant/students/:id/payments", element: <StudentPaymentHistoryPage /> },
    { path: "/notifications", element: <AccountantNotificationsPage /> },
    { path: "/profile", element: <AccountantProfilePage /> },
    { path: "/students/:id", element: <StudentDetailPage /> },
  ],
};

/**
 * Get available routes for a specific role
 */
export const getRoutesForRole = (role) => {
  return [...roleRoutes.common, ...(roleRoutes[role] || [])];
};

export default roleRoutes;
