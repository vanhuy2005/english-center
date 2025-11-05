const Student = require("../models/Student");
const Staff = require("../models/Staff");
const Teacher = require("../models/Teacher");
const jwt = require("jsonwebtoken");

// Tạo JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Đăng ký học viên
exports.register = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    // Kiểm tra dữ liệu
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền tất cả các trường bắt buộc" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu không trùng khớp" });
    }

    // Kiểm tra email đã tồn tại
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo học viên mới
    const student = new Student({
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
    });

    await student.save();
    const token = generateToken(student._id);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      role: "student",
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng ký giám đốc
exports.registerDirector = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      confirmPassword,
      dateOfBirth,
      gender,
      address,
    } = req.body;

    // Kiểm tra dữ liệu
    if (!fullName || !email || !phone || !password || !confirmPassword) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền tất cả các trường bắt buộc" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Mật khẩu không trùng khớp" });
    }

    // Kiểm tra email đã tồn tại
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    // Tạo nhân viên mới (giám đốc)
    const staff = new Staff({
      fullName,
      email,
      phone,
      password,
      dateOfBirth,
      gender,
      address,
      department: "Quản lý",
      position: "Giám Đốc",
    });

    await staff.save();
    const token = generateToken(staff._id);

    res.status(201).json({
      success: true,
      message: "Đăng ký thành công",
      token,
      role: "director",
      user: {
        id: staff._id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập (default)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm học viên
    const student = await Student.findOne({ email }).select("+password");
    if (!student) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await student.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      role: "student",
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập học viên
exports.loginStudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm học viên
    const student = await Student.findOne({ email }).select("+password");
    if (!student) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await student.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(student._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      role: "student",
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
        phone: student.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập nhân viên
exports.loginStaff = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm nhân viên
    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await staff.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(staff._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      role: "staff",
      department: staff.department,
      user: {
        id: staff._id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
        department: staff.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập giáo viên
exports.loginTeacher = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm giáo viên
    const teacher = await Teacher.findOne({ email }).select("+password");
    if (!teacher) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await teacher.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(teacher._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      role: "teacher",
      user: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        fullName: teacher.fullName,
        email: teacher.email,
        phone: teacher.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Đăng nhập giám đốc
exports.loginDirector = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kiểm tra dữ liệu
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập email và mật khẩu" });
    }

    // Tìm nhân viên
    const staff = await Staff.findOne({ email }).select("+password");
    if (!staff) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Kiểm tra xem có phải director không
    if (staff.position !== "Giám Đốc") {
      return res
        .status(401)
        .json({ message: "Tài khoản này không phải Giám Đốc" });
    }

    // Kiểm tra mật khẩu
    const isPasswordMatch = await staff.matchPassword(password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email hoặc mật khẩu không chính xác" });
    }

    // Tạo token
    const token = generateToken(staff._id);

    res.status(200).json({
      success: true,
      message: "Đăng nhập thành công",
      token,
      role: "director",
      user: {
        id: staff._id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
        position: staff.position,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lấy thông tin user hiện tại
exports.getMe = async (req, res) => {
  try {
    let user = null;
    let role = null;

    const student = await Student.findById(req.user.id);
    if (student) {
      user = student;
      role = "student";
    }

    if (!user) {
      const staff = await Staff.findById(req.user.id);
      if (staff) {
        user = staff;
        role = staff.position === "Giám Đốc" ? "director" : "staff";
      }
    }

    if (!user) {
      const teacher = await Teacher.findById(req.user.id);
      if (teacher) {
        user = teacher;
        role = "teacher";
      }
    }

    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    res.status(200).json({
      success: true,
      role,
      user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giám đốc tạo account nhân viên
exports.createStaffByDirector = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      department,
      position,
    } = req.body;

    if (!fullName || !email || !phone || !password || !department) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền tất cả các trường bắt buộc" });
    }

    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const staff = new Staff({
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      department,
      position: position || department,
    });

    await staff.save();

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản nhân viên thành công",
      user: {
        id: staff._id,
        staffId: staff.staffId,
        fullName: staff.fullName,
        email: staff.email,
        department: staff.department,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giám đốc tạo account giáo viên
exports.createTeacherByDirector = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      qualifications,
      specialization,
    } = req.body;

    if (!fullName || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền tất cả các trường bắt buộc" });
    }

    const existingTeacher = await Teacher.findOne({ email });
    if (existingTeacher) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const teacher = new Teacher({
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
      qualifications: qualifications || [],
      specialization: specialization || [],
    });

    await teacher.save();

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản giáo viên thành công",
      user: {
        id: teacher._id,
        teacherId: teacher.teacherId,
        fullName: teacher.fullName,
        email: teacher.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Giám đốc tạo account học viên
exports.createStudentByDirector = async (req, res) => {
  try {
    const { fullName, email, phone, password, gender, dateOfBirth, address } =
      req.body;

    if (!fullName || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng điền tất cả các trường bắt buộc" });
    }

    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const student = new Student({
      fullName,
      email,
      phone,
      password,
      gender,
      dateOfBirth,
      address,
    });

    await student.save();

    res.status(201).json({
      success: true,
      message: "Tạo tài khoản học viên thành công",
      user: {
        id: student._id,
        studentId: student.studentId,
        fullName: student.fullName,
        email: student.email,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
