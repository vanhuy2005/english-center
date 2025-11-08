import { useState, useEffect } from "react";
import api from "@services/api";
import { Card, Loading } from "@components/common";
import { Calendar } from "lucide-react";

const AccountantSchedulePage = () => {
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/staff/accountant/schedule");
      if (response.data.success) {
        setSchedules(response.data.data || []);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="text-blue-600" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lịch Công Việc</h1>
          <p className="text-gray-600 mt-1">
            Lịch trình thu học phí và công việc
          </p>
        </div>
      </div>

      <Card>
        <p className="text-gray-600">
          Chức năng lịch công việc đang được phát triển...
        </p>
      </Card>
    </div>
  );
};

export default AccountantSchedulePage;
