import { useState, useEffect } from "react";
import { gradeService } from "../../services";
import { DataGrid } from "@mui/x-data-grid";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/common";
import { Badge } from "@components/common";
import { Trophy, TrendingUp, Award, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

const GradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageGrade: 0,
    highestGrade: 0,
    lowestGrade: 0,
    totalCourses: 0,
  });

  useEffect(() => {
    fetchGrades();
  }, []);

  const fetchGrades = async () => {
    try {
      setLoading(true);
      const response = await gradeService.getMyGrades();
      console.log("📊 Grades response:", response);

      // Handle both response formats: { data: [...] } or just [...]
      let gradesData = [];
      if (response.data) {
        if (Array.isArray(response.data)) {
          gradesData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          gradesData = response.data.data;
        } else if (
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          // Single grade returned as object, wrap in array
          gradesData = [response.data];
        }
      }

      console.log(
        "✅ Processed grades:",
        gradesData,
        "Type:",
        typeof gradesData
      );
      setGrades(gradesData);
      calculateStats(gradesData);
    } catch (error) {
      console.error("❌ Error fetching grades:", error);
      toast.error("Không thể tải điểm!");
      setGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (gradesData) => {
    if (gradesData.length === 0) {
      setStats({
        averageGrade: 0,
        highestGrade: 0,
        lowestGrade: 0,
        totalCourses: 0,
      });
      return;
    }

    const grades = gradesData.map((g) => g.finalGrade || 0);
    const sum = grades.reduce((a, b) => a + b, 0);
    const avg = sum / grades.length;
    const max = Math.max(...grades);
    const min = Math.min(...grades);

    setStats({
      averageGrade: avg.toFixed(2),
      highestGrade: max.toFixed(2),
      lowestGrade: min.toFixed(2),
      totalCourses: gradesData.length,
    });
  };

  const getGradeColor = (grade) => {
    if (grade >= 9) return "bg-green-100 text-green-800";
    if (grade >= 8) return "bg-blue-100 text-blue-800";
    if (grade >= 6.5) return "bg-yellow-100 text-yellow-800";
    if (grade >= 5) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const getGradeLabel = (grade) => {
    if (grade >= 9) return "Xuất sắc";
    if (grade >= 8) return "Giỏi";
    if (grade >= 6.5) return "Khá";
    if (grade >= 5) return "Trung bình";
    return "Yếu";
  };

  const columns = [
    {
      field: "courseName",
      headerName: "Khóa học",
      flex: 1,
      minWidth: 200,
      valueGetter: (params) => params.row.course?.name || "N/A",
    },
    {
      field: "className",
      headerName: "Lớp học",
      flex: 1,
      minWidth: 150,
      valueGetter: (params) => params.row.class?.name || "N/A",
    },
    {
      field: "midtermGrade",
      headerName: "Điểm giữa kỳ",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span className="font-semibold">
          {params.value !== null && params.value !== undefined
            ? params.value.toFixed(1)
            : "-"}
        </span>
      ),
    },
    {
      field: "finalGrade",
      headerName: "Điểm cuối kỳ",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => (
        <span className="font-semibold">
          {params.value !== null && params.value !== undefined
            ? params.value.toFixed(1)
            : "-"}
        </span>
      ),
    },
    {
      field: "averageGrade",
      headerName: "Điểm TB",
      width: 120,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const avg =
          params.row.midtermGrade !== null &&
          params.row.midtermGrade !== undefined &&
          params.row.finalGrade !== null &&
          params.row.finalGrade !== undefined
            ? ((params.row.midtermGrade + params.row.finalGrade) / 2).toFixed(1)
            : "-";
        return <span className="font-bold text-blue-600">{avg}</span>;
      },
    },
    {
      field: "status",
      headerName: "Xếp loại",
      width: 150,
      align: "center",
      headerAlign: "center",
      renderCell: (params) => {
        const avg =
          params.row.midtermGrade !== null &&
          params.row.midtermGrade !== undefined &&
          params.row.finalGrade !== null &&
          params.row.finalGrade !== undefined
            ? (params.row.midtermGrade + params.row.finalGrade) / 2
            : 0;

        if (avg === 0)
          return <Badge className="bg-gray-100 text-gray-800">Chưa có</Badge>;

        return (
          <Badge className={getGradeColor(avg)}>{getGradeLabel(avg)}</Badge>
        );
      },
    },
    {
      field: "updatedAt",
      headerName: "Cập nhật",
      width: 150,
      valueGetter: (params) =>
        new Date(params.value).toLocaleDateString("vi-VN"),
    },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bảng Điểm</h1>
        <p className="text-gray-600">Xem điểm số và xếp loại của bạn</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-t-4 border-t-blue-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm Trung Bình
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-blue-600">
                  {stats.averageGrade}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getGradeLabel(parseFloat(stats.averageGrade))}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-green-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm Cao Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-green-600">
                  {stats.highestGrade}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getGradeLabel(parseFloat(stats.highestGrade))}
                </p>
              </div>
              <Trophy className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-red-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Điểm Thấp Nhất
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-red-600">
                  {stats.lowestGrade}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {getGradeLabel(parseFloat(stats.lowestGrade))}
                </p>
              </div>
              <Award className="w-10 h-10 text-red-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-purple-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Tổng Môn Học
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-purple-600">
                  {stats.totalCourses}
                </p>
                <p className="text-sm text-gray-500 mt-1">Khóa học</p>
              </div>
              <BookOpen className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Table */}
      <Card className="border-t-4 border-t-blue-600">
        <CardHeader>
          <CardTitle>Chi Tiết Điểm Số</CardTitle>
          <CardDescription>
            Danh sách điểm số của tất cả các khóa học
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ height: 500, width: "100%" }}>
            <DataGrid
              rows={grades}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[5, 10, 20]}
              loading={loading}
              disableSelectionOnClick
              getRowId={(row) => row._id}
              sx={{
                border: 0,
                "& .MuiDataGrid-cell:focus": {
                  outline: "none",
                },
                "& .MuiDataGrid-row:hover": {
                  backgroundColor: "#f3f4f6",
                },
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: "#f9fafb",
                  fontWeight: "bold",
                },
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GradesPage;
