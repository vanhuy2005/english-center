const Student = require("../../shared/models/Student.model");
const Staff = require("../../shared/models/Staff.model");
const Course = require("../../shared/models/Course.model");
const Finance = require("../../shared/models/Finance.model");
const Attendance = require("../../shared/models/Attendance.model");
const Class = require("../../shared/models/Class.model");
const {
  successResponse,
  errorResponse,
} = require("../../shared/utils/response.util");

/**
 * @desc    Create new user account (Director only)
 * @route   POST /api/director/users
 * @access  Private (director only)
 */
exports.createUserAccount = async (req, res) => {
  try {
    const {
      fullName,
      phone,
      role,
      email,
      dateOfBirth,
      gender,
      address,
      studentData,
      teacherData,
      staffData,
    } = req.body;

    // Validate required fields
    if (!fullName || !phone || !role) {
      return errorResponse(
        res,
        "Vui lòng điền đầy đủ họ tên, số điện thoại và vai trò",
        400
      );
    }

    // Validate role
    const allowedRoles = [
      "student",
      "teacher",
      "enrollment",
      "academic",
      "accountant",
      "director",
    ];
    if (!allowedRoles.includes(role)) {
      return errorResponse(res, "Vai trò không hợp lệ", 400);
    }

    // Check if phone already exists
    let existingUser = await Student.findOne({ phone });
    if (!existingUser) {
      existingUser = await Staff.findOne({ phone });
    }
    if (existingUser) {
      return errorResponse(res, "Số điện thoại đã được sử dụng", 400);
    }

    // Check if email exists (if provided)
    if (email) {
      let existingEmail = await Student.findOne({ email });
      if (!existingEmail) {
        existingEmail = await Staff.findOne({ email });
      }
      if (existingEmail) {
        return errorResponse(res, "Email đã được sử dụng", 400);
      }
    }

    // Create role-specific profile
    let profile = null;
    if (role === "student") {
      const studentProfile = {
        fullName,
        phone,
        email: email || undefined,
        password: "123456",
        isFirstLogin: true,
      };

      // Add student-specific data if provided
      if (studentData) {
        if (studentData.dateOfBirth)
          studentProfile.dateOfBirth = new Date(studentData.dateOfBirth);
        if (studentData.gender) studentProfile.gender = studentData.gender;
        if (studentData.address) studentProfile.address = studentData.address;
        if (studentData.contactInfo)
          studentProfile.contactInfo = studentData.contactInfo;
        if (studentData.contactPerson)
          studentProfile.contactPerson = studentData.contactPerson;
      }

      profile = await Student.create(studentProfile);
    } else {
      // Staff roles
      const staffProfile = {
        fullName,
        phone,
        email: email || undefined,
        password: "123456",
        isFirstLogin: true,
        staffType: role,
        staffCode: `NV${role.toUpperCase().slice(0, 2)}${Date.now()
          .toString()
          .slice(-6)}`,
      };

      // Add common staff data
      if (dateOfBirth) staffProfile.dateOfBirth = new Date(dateOfBirth);
      if (gender) staffProfile.gender = gender;
      if (address) staffProfile.address = address;

      // Add teacher-specific data
      if (role === "teacher" && teacherData) {
        if (teacherData.specialization?.length > 0)
          staffProfile.specialization = teacherData.specialization;
        if (teacherData.qualifications?.length > 0)
          staffProfile.qualifications = teacherData.qualifications;
        if (teacherData.experience) {
          staffProfile.experience = {
            years: teacherData.experience.years || 0,
            description: teacherData.experience.description || "",
          };
        }
      }

      // Add other staff-specific data
      if (staffData) {
        if (staffData.position) staffProfile.position = staffData.position;
        if (staffData.department)
          staffProfile.department = staffData.department;
        if (staffData.accessLevel)
          staffProfile.accessLevel = staffData.accessLevel;
      }

      profile = await Staff.create(staffProfile);
    }

    const userData = {
      _id: profile._id,
      fullName: profile.fullName,
      phone: profile.phone,
      email: profile.email,
      role: role,
      status: profile.status,
      isFirstLogin: profile.isFirstLogin,
      createdAt: profile.createdAt,
    };

    successResponse(
      res,
      {
        user: userData,
        defaultPassword: "123456",
      },
      "Tạo tài khoản thành công",
      201
    );
  } catch (error) {
    console.error("Create User Account Error:", error);
    console.error("Error stack:", error.stack);
    console.error("Error name:", error.name);
    errorResponse(res, `Lỗi tạo tài khoản: ${error.message}`, 500);
  }
};

/**
 * @desc    Get all users (Director only)
 * @route   GET /api/director/users
 * @access  Private (director only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, status, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const skip = (pageNum - 1) * limitNum;
    let users = [];
    let total = 0;

    // Build search query
    const buildQuery = (baseQuery = {}) => {
      const query = { ...baseQuery };
      if (status && status !== "all") query.status = status;
      if (search) {
        query.$or = [
          { fullName: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ];
        if (search.includes("@")) {
          query.$or.push({ email: { $regex: search, $options: "i" } });
        }
      }
      return query;
    };

    if (!role) {
      // Load both students and staff
      const [students, staff] = await Promise.all([
        Student.find(buildQuery())
          .select("-password -refreshToken")
          .sort({ createdAt: -1 }),
        Staff.find(buildQuery())
          .select("-password -refreshToken")
          .sort({ createdAt: -1 }),
      ]);

      // Combine and sort
      const allUsers = [
        ...students.map((s) => ({ ...s.toObject(), role: "student" })),
        ...staff.map((s) => ({ ...s.toObject(), role: s.staffType })),
      ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      total = allUsers.length;
      users = allUsers.slice(skip, skip + limitNum);
    } else if (role === "student") {
      const [students, count] = await Promise.all([
        Student.find(buildQuery())
          .select("-password -refreshToken")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Student.countDocuments(buildQuery()),
      ]);
      users = students.map((s) => ({ ...s.toObject(), role: "student" }));
      total = count;
    } else {
      const [staff, count] = await Promise.all([
        Staff.find(buildQuery({ staffType: role }))
          .select("-password -refreshToken")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limitNum),
        Staff.countDocuments(buildQuery({ staffType: role })),
      ]);
      users = staff.map((s) => ({ ...s.toObject(), role: s.staffType }));
      total = count;
    }

    successResponse(
      res,
      {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      "Lấy danh sách người dùng thành công"
    );
  } catch (error) {
    console.error("Get All Users Error:", error);
    console.error("Error stack:", error.stack);
    errorResponse(res, `Lỗi lấy danh sách người dùng: ${error.message}`, 500);
  }
};

/**
 * @desc    Get director dashboard overview
 * @route   GET /api/director/dashboard
 * @access  Private (director only)
 */
exports.getDashboard = async (req, res) => {
  try {
    // Get statistics
    const [
      totalStudents,
      totalTeachers,
      totalCourses,
      activeStudents,
      newStudentsThisMonth,
      financeStats,
    ] = await Promise.all([
      Student.countDocuments(),
      Staff.countDocuments({
        staffType: "teacher",
        employmentStatus: "active",
      }),
      Course.countDocuments({ status: "active" }),
      Student.countDocuments({ academicStatus: "active" }),
      Student.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      }),
      getFinanceStatistics(),
    ]);

    const data = {
      statistics: {
        totalStudents,
        totalTeachers,
        totalCourses,
        activeStudents,
        newStudentsThisMonth,
        totalRevenue: financeStats.totalRevenue,
        revenueGrowth: financeStats.revenueGrowth,
      },
    };

    successResponse(res, data, "Lấy dashboard thành công");
  } catch (error) {
    console.error("Get Dashboard Error:", error);
    errorResponse(res, "Không thể lấy dữ liệu dashboard", 500);
  }
};

/**
 * @desc    Get revenue chart data
 * @route   GET /api/director/reports/charts/revenue
 * @access  Private (director only)
 */
exports.getRevenueChart = async (req, res) => {
  try {
    // Validate and sanitize period
    const allowedPeriods = ["day", "week", "month", "quarter", "year"];
    let period = req.query.period || "month";
    if (!allowedPeriods.includes(period)) {
      period = "month";
    }

    // Validate and sanitize limit
    let limit = parseInt(req.query.limit, 10);
    const defaultLimits = { week: 8, month: 12, quarter: 8, year: 5 };
    if (isNaN(limit) || limit < 1 || limit > 100) {
      limit = defaultLimits[period] || 12;
    }

    const chartData = await getRevenueChartData(period, limit);

    successResponse(res, chartData, "Lấy biểu đồ doanh thu thành công");
  } catch (error) {
    console.error("Get Revenue Chart Error:", error);
    errorResponse(res, "Không thể lấy dữ liệu biểu đồ doanh thu", 500);
  }
};

/**
 * @desc    Get attendance chart data
 * @route   GET /api/director/reports/charts/attendance
 * @access  Private (director only)
 */
exports.getAttendanceChart = async (req, res) => {
  try {
    const allowedPeriods = ["day", "week", "month"];
    const period = req.query.period || "week";
    if (!allowedPeriods.includes(period)) {
      return errorResponse(res, "Tham số period không hợp lệ", 400);
    }

    const chartData = await getAttendanceChartData(period);

    successResponse(res, chartData, "Lấy biểu đồ chuyên cần thành công");
  } catch (error) {
    console.error("Get Attendance Chart Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get student distribution by course
 * @route   GET /api/director/reports/charts/student-distribution
 * @access  Private (director only)
 */
exports.getStudentDistribution = async (req, res) => {
  try {
    const courses = await Course.find({ status: "active" }).select(
      "name courseCode"
    );

    const distribution = await Promise.all(
      courses.map(async (course, index) => {
        const count = await Student.countDocuments({
          enrolledCourses: course._id,
          academicStatus: "active",
        });

        return {
          name: course.name,
          value: count,
          color: getColorByIndex(index),
        };
      })
    );

    // Filter out courses with no students
    const filteredDistribution = distribution.filter((item) => item.value > 0);

    successResponse(
      res,
      filteredDistribution,
      "Lấy phân bổ học viên thành công"
    );
  } catch (error) {
    console.error("Get Student Distribution Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get recent activities
 * @route   GET /api/director/reports/activities
 * @access  Private (director only)
 */
exports.getRecentActivities = async (req, res) => {
  try {
    let limit = req.query.limit;
    limit = parseInt(limit, 10);
    if (isNaN(limit)) limit = 10;
    if (limit < 1) limit = 1;
    if (limit > 100) limit = 100;

    // Get recent enrollments
    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(limit);

    const activities = recentStudents.map((student) => ({
      type: "enrollment",
      title: "Học viên mới ghi danh",
      description: `${student.fullName || "Unknown"} (${
        student.studentCode || "—"
      }) đã ghi danh`,
      timestamp: student.createdAt,
      status: "success",
      statusText: "Hoàn thành",
    }));

    successResponse(res, activities, "Lấy hoạt động gần đây thành công");
  } catch (error) {
    console.error("Get Recent Activities Error:", error);
    errorResponse(res, error.message, 500);
  }
};

// ============ Helper Functions ============

/**
 * Get finance statistics
 */
async function getFinanceStatistics() {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Total revenue
  const totalRevenue = await Finance.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);

  // This month revenue
  const thisMonthRevenue = await Finance.aggregate([
    {
      $match: {
        status: "paid",
        paidDate: { $gte: firstDayThisMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);

  // Last month revenue
  const lastMonthRevenue = await Finance.aggregate([
    {
      $match: {
        status: "paid",
        paidDate: { $gte: firstDayLastMonth, $lte: lastDayLastMonth },
      },
    },
    { $group: { _id: null, total: { $sum: "$paidAmount" } } },
  ]);

  const total = totalRevenue[0]?.total || 0;
  const thisMonth = thisMonthRevenue[0]?.total || 0;
  const lastMonth = lastMonthRevenue[0]?.total || 0;

  // Calculate growth percentage
  const growth =
    lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

  return {
    totalRevenue: total,
    revenueGrowth: Math.round(growth * 10) / 10,
  };
}

/**
 * Get revenue chart data
 */
async function getRevenueChartData(period, limit) {
  const now = new Date();

  const configs = {
    week: {
      limit: limit || 8,
      startDate: () => {
        const d = new Date(now);
        d.setDate(d.getDate() - 7 * ((limit || 8) - 1));
        d.setHours(0, 0, 0, 0);
        return d;
      },
      group: {
        _id: {
          year: { $isoWeekYear: "$paidDate" },
          week: { $isoWeek: "$paidDate" },
        },
        total: { $sum: "$paidAmount" },
      },
      label: (year, week) => `W${week}/${year}`,
      buildSlots: () => {
        const slots = [];
        const d = new Date(now);
        for (let i = (limit || 8) - 1; i >= 0; i--) {
          const slotDate = new Date(d);
          slotDate.setDate(slotDate.getDate() - i * 7);
          const week = getISOWeek(slotDate);
          const year = getISOWeekYear(slotDate);
          slots.push({ key: `${year}-W${week}`, label: `W${week}/${year}` });
        }
        return slots;
      },
    },
    month: {
      limit: limit || 12,
      startDate: () =>
        new Date(now.getFullYear(), now.getMonth() - ((limit || 12) - 1), 1),
      group: {
        _id: { year: { $year: "$paidDate" }, month: { $month: "$paidDate" } },
        total: { $sum: "$paidAmount" },
      },
      label: (year, month) => `T${month}`,
      buildSlots: () => {
        const slots = [];
        for (let i = (limit || 12) - 1; i >= 0; i--) {
          const m = (now.getMonth() - i + 12) % 12;
          const y =
            m > now.getMonth() ? now.getFullYear() - 1 : now.getFullYear();
          slots.push({ key: `${y}-${m + 1}`, label: `T${m + 1}` });
        }
        return slots;
      },
    },
    quarter: {
      limit: limit || 8,
      startDate: () => {
        const currentQuarter = Math.floor(now.getMonth() / 3);
        return new Date(
          now.getFullYear(),
          currentQuarter * 3 - 3 * ((limit || 8) - 1),
          1
        );
      },
      group: {
        _id: {
          year: { $year: "$paidDate" },
          quarter: { $ceil: { $divide: [{ $month: "$paidDate" }, 3] } },
        },
        total: { $sum: "$paidAmount" },
      },
      label: (year, quarter) => `Q${quarter}/${year}`,
      buildSlots: () => {
        const slots = [];
        const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
        for (let i = (limit || 8) - 1; i >= 0; i--) {
          let q = currentQuarter - i;
          let y = now.getFullYear();
          while (q <= 0) {
            q += 4;
            y -= 1;
          }
          while (q > 4) {
            q -= 4;
            y += 1;
          }
          slots.push({ key: `${y}-Q${q}`, label: `Q${q}/${y}` });
        }
        return slots;
      },
    },
    year: {
      limit: limit || 5,
      startDate: () => new Date(now.getFullYear() - ((limit || 5) - 1), 0, 1),
      group: {
        _id: { year: { $year: "$paidDate" } },
        total: { $sum: "$paidAmount" },
      },
      label: (year) => `${year}`,
      buildSlots: () => {
        const slots = [];
        for (let i = (limit || 5) - 1; i >= 0; i--) {
          const y = now.getFullYear() - i;
          slots.push({ key: `${y}`, label: `${y}` });
        }
        return slots;
      },
    },
  };

  const cfg = configs[period] || configs.month;
  const startDate = cfg.startDate();

  const revenueData = await Finance.aggregate([
    { $match: { status: "paid", paidDate: { $gte: startDate } } },
    { $group: cfg.group },
    {
      $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.quarter": 1 },
    },
  ]);

  const revenueMap = new Map();
  revenueData.forEach((item) => {
    if (item._id.week) {
      revenueMap.set(`${item._id.year}-W${item._id.week}`, item.total);
    } else if (item._id.quarter) {
      revenueMap.set(`${item._id.year}-Q${item._id.quarter}`, item.total);
    } else if (item._id.month) {
      revenueMap.set(`${item._id.year}-${item._id.month}`, item.total);
    } else if (item._id.year) {
      revenueMap.set(`${item._id.year}`, item.total);
    }
  });

  const slots = cfg.buildSlots();
  return slots.map((slot) => {
    const revenueAmount = revenueMap.get(slot.key) || 0;
    const profit = Math.round(revenueAmount * 0.35);
    const expenses = Math.round(revenueAmount * 0.65);
    return {
      name: slot.label,
      month: slot.label,
      revenue: revenueAmount,
      profit,
      expenses,
    };
  });
}

/**
 * Get attendance chart data
 */
async function getAttendanceChartData(period) {
  const now = new Date();
  let startDate, endDate, groupBy, labels;

  switch (period) {
    case "day":
      // Last 7 days
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      groupBy = { $dateToString: { format: "%Y-%m-%d", date: "$date" } };
      labels = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString("vi-VN", { weekday: "short" }));
      }
      break;

    case "week":
      // Last 4 weeks
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 27);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      groupBy = {
        $concat: [
          { $dateToString: { format: "%Y-", date: "$date" } },
          { $toString: { $isoWeek: "$date" } },
        ],
      };
      labels = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - i * 7 - now.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        labels.push(`Tuần ${getWeekNumber(weekStart)}`);
      }
      break;

    case "month":
      // Last 6 months
      startDate = new Date(now);
      startDate.setMonth(now.getMonth() - 5);
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999);
      groupBy = { $dateToString: { format: "%Y-%m", date: "$date" } };
      labels = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now);
        date.setMonth(now.getMonth() - i);
        labels.push(`T${date.getMonth() + 1}`);
      }
      break;

    default:
      throw new Error("Invalid period");
  }

  // Aggregate attendance data
  const attendanceData = await Attendance.aggregate([
    {
      $match: {
        date: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: {
          period: groupBy,
          status: "$status",
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { "_id.period": 1 },
    },
  ]);

  // Create a map for quick lookup
  const dataMap = new Map();
  attendanceData.forEach((item) => {
    const key = item._id.period;
    if (!dataMap.has(key)) {
      dataMap.set(key, { present: 0, absent: 0, late: 0, excused: 0 });
    }
    dataMap.get(key)[item._id.status] = item.count;
  });

  // Build the final data array
  const data = labels.map((label, index) => {
    let periodKey;
    switch (period) {
      case "day":
        const date = new Date(now);
        date.setDate(now.getDate() - (6 - index));
        periodKey = date.toISOString().split("T")[0];
        break;
      case "week":
        const weekDate = new Date(now);
        weekDate.setDate(now.getDate() - (3 - index) * 7 - now.getDay() + 1);
        const year = weekDate.getFullYear();
        const week = getWeekNumber(weekDate);
        periodKey = `${year}-${week}`;
        break;
      case "month":
        const monthDate = new Date(now);
        monthDate.setMonth(now.getMonth() - (5 - index));
        periodKey = `${monthDate.getFullYear()}-${String(
          monthDate.getMonth() + 1
        ).padStart(2, "0")}`;
        break;
    }

    const stats = dataMap.get(periodKey) || {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    };

    return {
      day: label,
      present: stats.present,
      absent: stats.absent,
      late: stats.late,
      excused: stats.excused,
    };
  });

  return data;
}

// Revenue stats per period (current vs previous)
async function getRevenueStatisticsByPeriod(period) {
  const now = new Date();

  const ranges = {
    week: () => {
      const start = new Date(now);
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);

      const prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      const prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23, 59, 59, 999);
      return { start, prevStart, prevEnd };
    },
    month: () => {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      return { start, prevStart, prevEnd };
    },
    quarter: () => {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      const start = new Date(now.getFullYear(), currentQuarter * 3, 1);
      const prevStart = new Date(
        now.getFullYear(),
        (currentQuarter - 1) * 3,
        1
      );
      const prevEnd = new Date(now.getFullYear(), currentQuarter * 3, 0);
      return { start, prevStart, prevEnd };
    },
    year: () => {
      const start = new Date(now.getFullYear(), 0, 1);
      const prevStart = new Date(now.getFullYear() - 1, 0, 1);
      const prevEnd = new Date(now.getFullYear(), 0, 0);
      return { start, prevStart, prevEnd };
    },
  };

  const rangeBuilder = ranges[period] || ranges.month;
  const { start, prevStart, prevEnd } = rangeBuilder();

  const [current, previous] = await Promise.all([
    Finance.aggregate([
      { $match: { status: "paid", paidDate: { $gte: start } } },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
    Finance.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: prevStart, $lte: prevEnd },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]),
  ]);

  const currentRevenue = current[0]?.total || 0;
  const previousRevenue = previous[0]?.total || 0;
  const growth =
    previousRevenue > 0
      ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;
  const margin = 35; // percent
  const profit = Math.round(currentRevenue * (margin / 100));
  const expenses = Math.round(currentRevenue - profit);

  return {
    currentRevenue,
    profit,
    expenses,
    growth: Math.round(growth * 10) / 10,
    margin,
  };
}

// Helpers for ISO week
function getISOWeek(date) {
  const tmp = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  tmp.setDate(tmp.getDate() - dayNr + 3);
  const firstThursday = tmp.valueOf();
  tmp.setMonth(0, 1);
  if (tmp.getDay() !== 4) {
    tmp.setMonth(0, 1 + ((4 - tmp.getDay() + 7) % 7));
  }
  return 1 + Math.ceil((firstThursday - tmp) / 604800000);
}

function getISOWeekYear(date) {
  const tmp = new Date(date.valueOf());
  tmp.setDate(tmp.getDate() - ((date.getDay() + 6) % 7) + 3);
  return tmp.getFullYear();
}

/**
 * Get ISO week number for a date
 */
function getWeekNumber(date) {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Get fixed color based on index (not random)
 */
function getColorByIndex(index) {
  const colors = [
    "#2563eb", // Blue
    "#dc2626", // Red
    "#059669", // Green
    "#7c3aed", // Purple
    "#ea580c", // Orange
    "#06b6d4", // Cyan
    "#ec4899", // Pink
    "#f59e0b", // Amber
    "#14b8a6", // Teal
    "#8b5cf6", // Violet
  ];

  return colors[index % colors.length];
}

// ============ New Report Endpoints ============

/**
 * @desc    Get revenue statistics
 * @route   GET /api/director/reports/revenue-stats
 * @access  Private (director only)
 */
exports.getRevenueStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const stats = await getRevenueStatisticsByPeriod(period);

    successResponse(
      res,
      {
        totalRevenue: stats.currentRevenue,
        totalProfit: stats.profit,
        totalExpenses: stats.expenses,
        growth: stats.growth,
        margin: stats.margin,
      },
      "Lấy thống kê doanh thu thành công"
    );
  } catch (error) {
    console.error("Get Revenue Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get student statistics
 * @route   GET /api/director/reports/student-stats
 * @access  Private (director only)
 */
exports.getStudentStats = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );

    const [
      totalStudents,
      activeStudents,
      newStudents,
      newStudentsLastMonth,
      completedStudents,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ academicStatus: "active" }),
      Student.countDocuments({
        enrollmentDate: { $gte: firstDayThisMonth },
        academicStatus: "active",
      }),
      Student.countDocuments({
        enrollmentDate: { $gte: firstDayLastMonth, $lt: firstDayThisMonth },
        academicStatus: "active",
      }),
      Student.countDocuments({ academicStatus: "completed" }),
    ]);

    const growth =
      newStudentsLastMonth > 0
        ? Math.round(
            ((newStudents - newStudentsLastMonth) / newStudentsLastMonth) * 100
          )
        : 0;

    successResponse(
      res,
      {
        totalStudents,
        activeStudents,
        newStudents,
        graduatedStudents: completedStudents,
        growth,
      },
      "Lấy thống kê học viên thành công"
    );
  } catch (error) {
    console.error("Get Student Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get enrollment trend
 * @route   GET /api/director/reports/enrollment-trend
 * @access  Private (director only)
 */
exports.getEnrollmentTrend = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const data = [];
    for (let i = parseInt(limit) - 1; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = month > currentMonth ? currentYear - 1 : currentYear;
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      const [newStudents, activeStudents] = await Promise.all([
        Student.countDocuments({
          enrollmentDate: { $gte: firstDay, $lte: lastDay },
          academicStatus: "active",
        }),
        Student.countDocuments({
          academicStatus: "active",
          enrollmentDate: { $lte: lastDay },
        }),
      ]);

      data.push({
        month: months[month],
        newStudents,
        activeStudents,
      });
    }

    successResponse(res, data, "Lấy xu hướng ghi danh thành công");
  } catch (error) {
    console.error("Get Enrollment Trend Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get top students
 * @route   GET /api/director/reports/top-students
 * @access  Private (director only)
 */
exports.getTopStudents = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Mock data - In production, calculate from grades and attendance
    const students = await Student.find({ academicStatus: "active" }).limit(
      parseInt(limit)
    );

    const topStudents = students.map((student, index) => ({
      studentCode: student.studentCode || `SV${1000 + index}`,
      fullName: student.fullName || "Unknown",
      course: "General English",
      gpa: (4.0 - index * 0.1).toFixed(1),
      attendance: 95 - index,
    }));

    successResponse(res, topStudents, "Lấy top học viên thành công");
  } catch (error) {
    console.error("Get Top Students Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get class statistics
 * @route   GET /api/director/reports/class-stats
 * @access  Private (director only)
 */
exports.getClassStats = async (req, res) => {
  try {
    const [totalClasses, activeClasses] = await Promise.all([
      Class.countDocuments(),
      Class.countDocuments({ status: "active" }),
    ]);

    // Mock data for open/closed classes
    const openClasses = Math.floor(activeClasses * 0.6);
    const closedClasses = activeClasses - openClasses;
    const avgStudentsPerClass = 18;

    successResponse(
      res,
      {
        totalClasses,
        activeClasses,
        openClasses,
        closedClasses,
        avgStudentsPerClass,
      },
      "Lấy thống kê lớp học thành công"
    );
  } catch (error) {
    console.error("Get Class Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get classes by status
 * @route   GET /api/director/reports/classes-by-status
 * @access  Private (director only)
 */
exports.getClassesByStatus = async (req, res) => {
  try {
    const activeClasses = await Class.countDocuments({ status: "active" });
    const completedClasses = await Class.countDocuments({
      status: "completed",
    });
    const upcomingClasses = await Class.countDocuments({ status: "upcoming" });

    const data = [
      { name: "Hoạt động", value: activeClasses, color: "#16a34a" },
      { name: "Hoàn thành", value: completedClasses, color: "#2563eb" },
      { name: "Sắp khai giảng", value: upcomingClasses, color: "#f59e0b" },
    ];

    successResponse(res, data, "Lấy phân bổ trạng thái lớp học thành công");
  } catch (error) {
    console.error("Get Classes By Status Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get class capacity
 * @route   GET /api/director/reports/class-capacity
 * @access  Private (director only)
 */
exports.getClassCapacity = async (req, res) => {
  try {
    const classes = await Class.find({ status: "active" }).select(
      "name capacity"
    );

    const capacityData = classes.map((cls) => ({
      name: cls.name,
      capacity: Math.floor(Math.random() * 30) + 70, // Mock: 70-100%
    }));

    successResponse(
      res,
      capacityData,
      "Lấy phân tích tỷ lệ lấp đầy thành công"
    );
  } catch (error) {
    console.error("Get Class Capacity Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get all classes
 * @route   GET /api/director/reports/all-classes
 * @access  Private (director only)
 */
exports.getAllClasses = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const classes = await Class.find()
      .populate("course", "name")
      .populate("teacher", "fullName")
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const classList = classes.map((cls) => {
      const currentStudents = Math.floor(Math.random() * 25) + 5;
      const maxStudents = 30;
      const capacityPercent = Math.round((currentStudents / maxStudents) * 100);

      return {
        classCode: cls.classCode || `CLS${Date.now()}`,
        className: cls.name,
        course: cls.course,
        teacher: cls.teacher,
        currentStudents,
        maxStudents,
        capacityPercent,
        status: capacityPercent >= 90 ? "full" : "active",
      };
    });

    successResponse(res, classList, "Lấy danh sách lớp học thành công");
  } catch (error) {
    console.error("Get All Classes Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get teacher statistics
 * @route   GET /api/director/reports/teacher-stats
 * @access  Private (director only)
 */
exports.getTeacherStats = async (req, res) => {
  try {
    const [totalTeachers, activeTeachers] = await Promise.all([
      Staff.countDocuments({ staffType: "teacher" }),
      Staff.countDocuments({
        staffType: "teacher",
        employmentStatus: "active",
      }),
    ]);

    successResponse(
      res,
      {
        totalTeachers,
        activeTeachers,
        avgRating: 4.5,
        avgClassesPerTeacher: 3.2,
      },
      "Lấy thống kê giảng viên thành công"
    );
  } catch (error) {
    console.error("Get Teacher Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get teacher performance
 * @route   GET /api/director/reports/teacher-performance
 * @access  Private (director only)
 */
exports.getTeacherPerformance = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();

    const data = [];
    for (let i = parseInt(limit) - 1; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      data.push({
        month: months[month],
        avgRating: 4.0 + Math.random() * 0.8,
        attendance: 92 + Math.random() * 6,
      });
    }

    successResponse(res, data, "Lấy hiệu suất giảng viên thành công");
  } catch (error) {
    console.error("Get Teacher Performance Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get top teachers
 * @route   GET /api/director/reports/top-teachers
 * @access  Private (director only)
 */
exports.getTopTeachers = async (req, res) => {
  try {
    const { limit = 15 } = req.query;

    const teachers = await Staff.find({
      staffType: "teacher",
      employmentStatus: "active",
    }).limit(parseInt(limit));

    const topTeachers = teachers.map((teacher, index) => ({
      teacherCode: teacher.staffCode || `GV${1000 + index}`,
      fullName: teacher.fullName || "Unknown",
      totalClasses: Math.floor(Math.random() * 5) + 2,
      totalStudents: Math.floor(Math.random() * 80) + 20,
      rating: (5.0 - index * 0.05).toFixed(1),
      attendance: 98 - index,
      performance: 95 - index,
    }));

    successResponse(res, topTeachers, "Lấy top giảng viên thành công");
  } catch (error) {
    console.error("Get Top Teachers Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get teacher rating distribution
 * @route   GET /api/director/reports/teacher-rating-distribution
 * @access  Private (director only)
 */
exports.getTeacherRatingDistribution = async (req, res) => {
  try {
    const data = [
      { name: "5 sao", count: 12 },
      { name: "4 sao", count: 18 },
      { name: "3 sao", count: 8 },
      { name: "2 sao", count: 2 },
      { name: "1 sao", count: 0 },
    ];

    successResponse(res, data, "Lấy phân bổ đánh giá thành công");
  } catch (error) {
    console.error("Get Teacher Rating Distribution Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get retention statistics
 * @route   GET /api/director/reports/retention-stats
 * @access  Private (director only)
 */
exports.getRetentionStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const droppedOut = await Student.countDocuments({
      academicStatus: "dropped",
    });
    const paused = await Student.countDocuments({ academicStatus: "paused" });
    const atRisk = await Student.countDocuments({ academicStatus: "active" }); // Mock: find at-risk students

    successResponse(
      res,
      {
        dropoutRate:
          totalStudents > 0
            ? Math.round((droppedOut / totalStudents) * 100)
            : 0,
        pauseRate:
          totalStudents > 0 ? Math.round((paused / totalStudents) * 100) : 0,
        totalDropouts: droppedOut,
        totalPauses: paused,
        atRiskStudents: Math.floor(atRisk * 0.1), // Mock: 10% at risk
      },
      "Lấy thống kê nghỉ học thành công"
    );
  } catch (error) {
    console.error("Get Retention Stats Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get retention trend
 * @route   GET /api/director/reports/retention-trend
 * @access  Private (director only)
 */
exports.getRetentionTrend = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();

    const data = [];
    for (let i = parseInt(limit) - 1; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      data.push({
        month: months[month],
        dropoutRate: 5 + Math.random() * 5,
        pauseRate: 3 + Math.random() * 3,
      });
    }

    successResponse(res, data, "Lấy xu hướng nghỉ học thành công");
  } catch (error) {
    console.error("Get Retention Trend Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get dropout reasons
 * @route   GET /api/director/reports/dropout-reasons
 * @access  Private (director only)
 */
exports.getDropoutReasons = async (req, res) => {
  try {
    const data = [
      { name: "Học phí cao", value: 30, color: "#dc2626" },
      { name: "Không phù hợp", value: 25, color: "#f59e0b" },
      { name: "Lý do cá nhân", value: 20, color: "#3b82f6" },
      { name: "Chất lượng giảng dạy", value: 15, color: "#8b5cf6" },
      { name: "Khác", value: 10, color: "#6b7280" },
    ];

    successResponse(res, data, "Lấy lý do nghỉ học thành công");
  } catch (error) {
    console.error("Get Dropout Reasons Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get at-risk students
 * @route   GET /api/director/reports/at-risk-students
 * @access  Private (director only)
 */
exports.getAtRiskStudents = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const students = await Student.find({ academicStatus: "active" }).limit(
      parseInt(limit)
    );

    const atRiskList = students.map((student, index) => ({
      studentCode: student.studentCode || `SV${1000 + index}`,
      fullName: student.fullName || "Unknown",
      course: "General English",
      attendanceRate: 40 + Math.floor(Math.random() * 30),
      lastAttendance: "3 ngày trước",
      riskLevel: index < 7 ? "high" : index < 14 ? "medium" : "low",
    }));

    successResponse(
      res,
      atRiskList,
      "Lấy danh sách học viên có rủi ro thành công"
    );
  } catch (error) {
    console.error("Get At Risk Students Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get retention by course
 * @route   GET /api/director/reports/retention-by-course
 * @access  Private (director only)
 */
exports.getRetentionByCourse = async (req, res) => {
  try {
    const courses = await Course.find().select("name");

    const data = courses.map((course) => ({
      name: course.name,
      dropoutRate: 5 + Math.random() * 10,
      pauseRate: 2 + Math.random() * 5,
    }));

    successResponse(res, data, "Lấy phân tích theo khóa học thành công");
  } catch (error) {
    console.error("Get Retention By Course Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get enrollment department data
 * @route   GET /api/director/reports/enrollment-department
 * @access  Private (director only)
 */
exports.getEnrollmentDepartment = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newEnrollments = await Student.countDocuments({
      createdAt: { $gte: firstDayThisMonth },
    });

    successResponse(
      res,
      {
        newEnrollments,
        pendingApplications: Math.floor(Math.random() * 15) + 5,
        completionRate: 85 + Math.floor(Math.random() * 10),
        status: "good",
      },
      "Lấy thông tin phòng ghi danh thành công"
    );
  } catch (error) {
    console.error("Get Enrollment Department Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get academic department data
 * @route   GET /api/director/reports/academic-department
 * @access  Private (director only)
 */
exports.getAcademicDepartment = async (req, res) => {
  try {
    const activeClasses = await Class.countDocuments({ status: "active" });

    successResponse(
      res,
      {
        activeClasses,
        avgAttendance: 88 + Math.floor(Math.random() * 8),
        pendingRequests: Math.floor(Math.random() * 10) + 2,
        status: "good",
      },
      "Lấy thông tin phòng học vụ thành công"
    );
  } catch (error) {
    console.error("Get Academic Department Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get accounting department data
 * @route   GET /api/director/reports/accounting-department
 * @access  Private (director only)
 */
exports.getAccountingDepartment = async (req, res) => {
  try {
    const now = new Date();
    const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyRevenue = await Finance.aggregate([
      {
        $match: {
          status: "paid",
          paidDate: { $gte: firstDayThisMonth },
        },
      },
      { $group: { _id: null, total: { $sum: "$paidAmount" } } },
    ]);

    const pendingPayments = await Finance.countDocuments({ status: "pending" });

    successResponse(
      res,
      {
        collectionRate: 85 + Math.floor(Math.random() * 10),
        pendingPayments,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        status: pendingPayments > 15 ? "warning" : "good",
      },
      "Lấy thông tin phòng kế toán thành công"
    );
  } catch (error) {
    console.error("Get Accounting Department Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Get department performance comparison
 * @route   GET /api/director/reports/department-performance
 * @access  Private (director only)
 */
exports.getDepartmentPerformance = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const months = [
      "T1",
      "T2",
      "T3",
      "T4",
      "T5",
      "T6",
      "T7",
      "T8",
      "T9",
      "T10",
      "T11",
      "T12",
    ];
    const currentMonth = new Date().getMonth();

    const data = [];
    for (let i = parseInt(limit) - 1; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      data.push({
        month: months[month],
        enrollment: 80 + Math.floor(Math.random() * 15),
        academic: 85 + Math.floor(Math.random() * 10),
        accounting: 82 + Math.floor(Math.random() * 12),
      });
    }

    successResponse(res, data, "Lấy hiệu suất bộ phận thành công");
  } catch (error) {
    console.error("Get Department Performance Error:", error);
    errorResponse(res, error.message, 500);
  }
};

/**
 * @desc    Delete user account (Director only)
 * @route   DELETE /api/director/users/:userId
 * @access  Private (director only)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Try to delete from Student collection first
    let user = await Student.findByIdAndDelete(userId);

    // If not found in Student, try Staff collection
    if (!user) {
      user = await Staff.findByIdAndDelete(userId);
    }

    if (!user) {
      return errorResponse(res, "Không tìm thấy người dùng", 404);
    }

    successResponse(res, null, "Xóa người dùng thành công");
  } catch (error) {
    console.error("Delete User Error:", error);
    errorResponse(res, error.message, 500);
  }
};

module.exports = exports;
