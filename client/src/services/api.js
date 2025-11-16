import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance
const apiClient = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000") + "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Global token variable
let currentToken = null;

// Function to set token globally
export const setAuthToken = (token) => {
  currentToken = token;
};

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // SKIP TOKEN for public endpoints (login, register, refresh-token)
    const publicEndpoints = [
      "/auth/login",
      "/auth/register",
      "/auth/refresh-token",
    ];
    const isPublicEndpoint = publicEndpoints.some((endpoint) =>
      config.url?.includes(endpoint)
    );

    if (!isPublicEndpoint) {
      // Use currentToken if available, otherwise fallback to localStorage
      const token = currentToken || localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Handle errors globally
    if (error.response) {
      const { status, data } = error.response;
      const isAuthEndpoint = error.config?.url?.includes("/auth/");

      switch (status) {
        case 401:
          // DON'T show toast for login failures (let the form handle it)
          if (!isAuthEndpoint) {
            // Unauthorized - clear token and redirect to login
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            localStorage.removeItem("role");
            currentToken = null; // Clear global token
            toast.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
            // Dispatch custom navigation event for SPA redirect
            window.dispatchEvent(
              new CustomEvent("navigate", { detail: { to: "/login" } })
            );
          }
          break;
        case 403:
          toast.error(
            data?.message || "Bạn không có quyền thực hiện thao tác này!"
          );
          break;
        case 404:
          if (!isAuthEndpoint) {
            toast.error(data?.message || "Không tìm thấy dữ liệu!");
          }
          break;
        case 500:
          toast.error(data?.message || "Lỗi server. Vui lòng thử lại sau!");
          break;
        default:
          if (!isAuthEndpoint) {
            toast.error(data?.message || "Có lỗi xảy ra!");
          }
      }
    } else if (error.request) {
      toast.error("Không thể kết nối đến server!");
    } else {
      toast.error("Có lỗi xảy ra!");
    }

    return Promise.reject(error);
  }
);

// Navigation utility for SPA redirects
export const setNavigate = (navigateFn) => {
  window.__appNavigate = navigateFn;
};

window.addEventListener("navigate", (e) => {
  if (window.__appNavigate && e.detail?.to) {
    window.__appNavigate(e.detail.to);
  }
});

export default apiClient;
