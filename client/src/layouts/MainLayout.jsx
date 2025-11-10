import React from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";
import DirectorSidebar from "./DirectorSidebar";
import EnrollmentSidebar from "./EnrollmentSidebar";
import TeacherSidebar from "./TeacherSidebar";
import AcademicStaffSidebar from "./AcademicStaffSidebar";
import AccountantSidebar from "./AccountantSidebar";
import { useAuth } from "@hooks";

/**
 * Main Layout Component - Sidebar always visible on left
 */
export const MainLayout = ({ menuItems = [] }) => {
  const { role } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Student Sidebar - Always visible on left */}
      {role === "student" && <StudentSidebar menuItems={menuItems} />}

      {/* Director Sidebar - Always visible on left */}
      {role === "director" && <DirectorSidebar menuItems={menuItems} />}

      {/* Enrollment Staff Sidebar - Always visible on left */}
      {role === "enrollment" && <EnrollmentSidebar menuItems={menuItems} />}

      {/* Teacher Sidebar - Always visible on left */}
      {role === "teacher" && <TeacherSidebar menuItems={menuItems} />}

      {/* Academic Staff Sidebar - Always visible on left */}
      {role === "academic" && <AcademicStaffSidebar menuItems={menuItems} />}

      {/* Accountant Sidebar - Always visible on left */}
      {role === "accountant" && <AccountantSidebar menuItems={menuItems} />}

      {/* Main Content - With left margin for sidebar */}
      <main className="ml-72 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
