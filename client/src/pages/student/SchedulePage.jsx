import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Loading } from "@components/common";
import { getMySchedules } from "@services/scheduleApi";
import { Calendar, Clock, MapPin, ArrowLeft, AlertCircle } from "lucide-react";

const SchedulePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("📥 Fetching schedules...");

      // Tính tuần hiện tại
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const startOfWeek = new Date(now.setDate(diff));
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      const data = await getMySchedules(
        startOfWeek.toISOString(),
        endOfWeek.toISOString()
      );

      console.log("✓ Schedules loaded:", data);
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ Error fetching schedules:", err);
      setError("Lỗi tải lịch học");
      setSchedules(getMockSchedules());
    } finally {
      setLoading(false);
    }
  };

  const getMockSchedules = () => [
    {
      _id: "schedule_1",
      course: {
        _id: "course1",
        name: "English A1",
        code: "EN-A1",
      },
      dayOfWeek: "monday",
      startTime: "08:00",
      endTime: "10:00",
      classroom: "Phòng A1",
      date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    },
    {
      _id: "schedule_2",
      course: {
        _id: "course1",
        name: "English A1",
        code: "EN-A1",
      },
      dayOfWeek: "wednesday",
      startTime: "14:00",
      endTime: "16:00",
      classroom: "Phòng A1",
      date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  ];

  const getDayName = (dayOfWeek) => {
    const days = {
      monday: "Thứ Hai",
      tuesday: "Thứ Ba",
      wednesday: "Thứ Tư",
      thursday: "Thứ Năm",
      friday: "Thứ Sáu",
      saturday: "Thứ Bảy",
      sunday: "Chủ Nhật",
    };
    return days[dayOfWeek] || dayOfWeek;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/student")}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar size={32} className="text-blue-600" />
                Lịch Học
              </h1>
              <p className="text-gray-600 mt-1">Xem lịch học tuần này</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Schedules List */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {schedules.length > 0 ? (
          <div className="space-y-4">
            {schedules.map((schedule) => (
              <Card
                key={schedule._id}
                className="border-l-4 border-l-blue-600 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0 pt-1">
                    <div className="p-3 bg-blue-100 rounded-lg">
                      <Calendar size={24} className="text-blue-600" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {schedule.course?.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Mã khóa: {schedule.course?.code}
                    </p>

                    <div className="grid grid-cols-3 gap-4 mt-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} className="text-gray-500" />
                        <span className="text-gray-700">
                          {getDayName(schedule.dayOfWeek)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-gray-500" />
                        <span className="text-gray-700">
                          {schedule.startTime} - {schedule.endTime}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin size={16} className="text-gray-500" />
                        <span className="text-gray-700">
                          {schedule.classroom}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="flex-shrink-0">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      Sắp diễn ra
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-600 text-lg">
              Không có lịch học nào trong tuần này
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePage;
