import axios from "axios";

const API_BASE_URL = "http://localhost:5000";

console.log("🌐 API Base URL:", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Set auth token function
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
    console.log("✅ Token set");
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    console.log("❌ Token cleared");
  }
};

// Initialize token from localStorage
const savedToken = localStorage.getItem("token");
if (savedToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Tự động thêm /api prefix nếu chưa có
    if (
      config.url &&
      !config.url.startsWith("/api/") &&
      !config.url.startsWith("/reports/")
    ) {
      config.url = `/api${config.url}`;
    }

    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  async (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error("❌ Network Error - Backend server not running?");
      console.error("Expected: http://localhost:5000");
    }

    if (error.response?.status === 401) {
      console.warn("⚠️ Unauthorized (401) - Attempting token refresh...");
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken && !error.config._retry) {
        error.config._retry = true;

        try {
          console.log("🔄 Refreshing token...");
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh-token`,
            { refreshToken }
          );

          const { token, refreshToken: newRefreshToken } = response.data.data;
          console.log("✅ Token refreshed successfully");
          setAuthToken(token);
          localStorage.setItem("refreshToken", newRefreshToken);

          error.config.headers.Authorization = `Bearer ${token}`;
          return api(error.config);
        } catch (refreshError) {
          console.error("❌ Token refresh failed:", refreshError.message);
          setAuthToken(null);
          // Dispatch custom event for AuthContext to listen
          window.dispatchEvent(new CustomEvent("auth:logout"));
        }
      } else {
        console.warn("❌ No valid refresh token - logging out");
        setAuthToken(null);
        // Dispatch custom event for AuthContext to listen
        window.dispatchEvent(new CustomEvent("auth:logout"));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
