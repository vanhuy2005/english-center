/**
 * Format date to Vietnamese format
 * @param {Date|string} date - Date to format
 * @param {string} format - Format type ('short' | 'long' | 'time' | 'datetime')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = "short") => {
  if (!date) return "";

  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");

  switch (format) {
    case "short":
      return `${day}/${month}/${year}`;
    case "long":
      return `${day} tháng ${month}, ${year}`;
    case "time":
      return `${hours}:${minutes}`;
    case "datetime":
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

/**
 * Format currency to Vietnamese Dong
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return "0 ₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return "0";
  return new Intl.NumberFormat("vi-VN").format(num);
};

/**
 * Get relative time (e.g., "2 giờ trước", "3 ngày trước")
 * @param {Date|string} date - Date to compare
 * @returns {string} Relative time string
 */
export const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} tuần trước`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} tháng trước`;
  return `${Math.floor(diffDay / 365)} năm trước`;
};

/**
 * Calculate age from date of birth
 * @param {Date|string} dob - Date of birth
 * @returns {number} Age in years
 */
export const calculateAge = (dob) => {
  if (!dob) return 0;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

/**
 * Check if date is today
 * @param {Date|string} date - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return (
    today.getDate() === checkDate.getDate() &&
    today.getMonth() === checkDate.getMonth() &&
    today.getFullYear() === checkDate.getFullYear()
  );
};

/**
 * Get day of week in Vietnamese
 * @param {Date|string} date - Date
 * @returns {string} Day of week
 */
export const getDayOfWeek = (date) => {
  const days = [
    "Chủ nhật",
    "Thứ 2",
    "Thứ 3",
    "Thứ 4",
    "Thứ 5",
    "Thứ 6",
    "Thứ 7",
  ];
  const d = new Date(date);
  return days[d.getDay()];
};

/**
 * Parse date string to Date object
 * @param {string} dateString - Date string (format: DD/MM/YYYY)
 * @returns {Date} Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const [day, month, year] = dateString.split("/");
  return new Date(year, month - 1, day);
};

/**
 * Get date range for period
 * @param {string} period - Period type ('today' | 'week' | 'month' | 'year')
 * @returns {object} { startDate, endDate }
 */
export const getDateRange = (period) => {
  const today = new Date();
  let startDate, endDate;

  switch (period) {
    case "today":
      startDate = new Date(today.setHours(0, 0, 0, 0));
      endDate = new Date(today.setHours(23, 59, 59, 999));
      break;
    case "week":
      const firstDay = today.getDate() - today.getDay();
      startDate = new Date(today.setDate(firstDay));
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(today.setDate(firstDay + 6));
      endDate.setHours(23, 59, 59, 999);
      break;
    case "month":
      startDate = new Date(today.getFullYear(), today.getMonth(), 1);
      endDate = new Date(
        today.getFullYear(),
        today.getMonth() + 1,
        0,
        23,
        59,
        59,
        999
      );
      break;
    case "year":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      startDate = today;
      endDate = today;
  }

  return { startDate, endDate };
};

export default {
  formatDate,
  formatCurrency,
  formatNumber,
  getRelativeTime,
  calculateAge,
  isToday,
  getDayOfWeek,
  parseDate,
  getDateRange,
};
