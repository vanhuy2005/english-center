/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate phone number (Vietnamese format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone);
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} { isValid, message, strength }
 */
export const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: "Mật khẩu không được để trống",
      strength: 0,
    };
  }

  if (password.length < 6) {
    return {
      isValid: false,
      message: "Mật khẩu phải có ít nhất 6 ký tự",
      strength: 1,
    };
  }

  let strength = 1;
  const checks = {
    hasLower: /[a-z]/.test(password),
    hasUpper: /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasLength: password.length >= 8,
  };

  strength += Object.values(checks).filter(Boolean).length;

  const messages = {
    1: "Mật khẩu quá yếu",
    2: "Mật khẩu yếu",
    3: "Mật khẩu trung bình",
    4: "Mật khẩu mạnh",
    5: "Mật khẩu rất mạnh",
    6: "Mật khẩu xuất sắc",
  };

  return {
    isValid: strength >= 2,
    message: messages[strength],
    strength,
  };
};

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @param {string} fieldName - Field name for error message
 * @returns {object} { isValid, message }
 */
export const validateRequired = (value, fieldName = "Trường này") => {
  const isValid = value !== null && value !== undefined && value !== "";
  return {
    isValid,
    message: isValid ? "" : `${fieldName} không được để trống`,
  };
};

/**
 * Validate number range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {string} fieldName - Field name for error message
 * @returns {object} { isValid, message }
 */
export const validateRange = (value, min, max, fieldName = "Giá trị") => {
  const num = Number(value);

  if (isNaN(num)) {
    return { isValid: false, message: `${fieldName} phải là số` };
  }

  if (num < min || num > max) {
    return {
      isValid: false,
      message: `${fieldName} phải từ ${min} đến ${max}`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate date range
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {object} { isValid, message }
 */
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) {
    return {
      isValid: false,
      message: "Vui lòng chọn ngày bắt đầu và kết thúc",
    };
  }

  if (new Date(startDate) > new Date(endDate)) {
    return { isValid: false, message: "Ngày bắt đầu phải trước ngày kết thúc" };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate file size
 * @param {File} file - File to validate
 * @param {number} maxSizeMB - Maximum size in MB
 * @returns {object} { isValid, message }
 */
export const validateFileSize = (file, maxSizeMB = 5) => {
  if (!file) {
    return { isValid: false, message: "Vui lòng chọn file" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      message: `Kích thước file không được vượt quá ${maxSizeMB}MB`,
    };
  }

  return { isValid: true, message: "" };
};

/**
 * Validate file type
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @returns {object} { isValid, message }
 */
export const validateFileType = (file, allowedTypes = []) => {
  if (!file) {
    return { isValid: false, message: "Vui lòng chọn file" };
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { isValid: false, message: "Định dạng file không được hỗ trợ" };
  }

  return { isValid: true, message: "" };
};

/**
 * Sanitize string (remove HTML tags)
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (!str) return "";
  return str.replace(/<[^>]*>/g, "").trim();
};

export default {
  isValidEmail,
  isValidPhone,
  validatePassword,
  validateRequired,
  validateRange,
  validateDateRange,
  validateFileSize,
  validateFileType,
  sanitizeString,
};
