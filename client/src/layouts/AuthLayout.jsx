import React from "react";
import { Outlet } from "react-router-dom";

/**
 * Auth Layout - for login, register pages
 */
export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(to bottom right, #132440, #16476A, #3B9797)' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">English Center</h1>
          <p className="text-gray-200">Hệ thống quản lý trung tâm Anh ngữ</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
