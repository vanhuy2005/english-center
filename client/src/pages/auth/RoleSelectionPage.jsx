import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Button } from "@components/common";

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  const roles = [
    { value: "student", label: "Học viên", icon: "👨‍🎓", color: "bg-blue-500" },
    {
      value: "teacher",
      label: "Giảng viên",
      icon: "👨‍🏫",
      color: "bg-green-500",
    },
    { value: "staff", label: "Nhân viên", icon: "👨‍💼", color: "bg-yellow-500" },
    {
      value: "director",
      label: "Giám đốc",
      icon: "👔",
      color: "bg-purple-500",
    },
  ];

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-bold text-primary text-center mb-6">
        Chọn vai trò của bạn
      </h2>

      <div className="grid grid-cols-2 gap-4">
        {roles.map((role) => (
          <button
            key={role.value}
            onClick={() => navigate(`/login?role=${role.value}`)}
            className="p-6 bg-white border-2 border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition-all text-center"
          >
            <div className="text-4xl mb-2">{role.icon}</div>
            <div className="font-semibold text-gray-700">{role.label}</div>
          </button>
        ))}
      </div>
    </Card>
  );
};

export default RoleSelectionPage;
