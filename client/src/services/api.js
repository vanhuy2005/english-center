import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

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
      const refreshToken = localStorage.getItem("refreshToken");

      if (refreshToken && !error.config._retry) {
        error.config._retry = true;

        try {
          const response = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken }
          );

          const { token, refreshToken: newRefreshToken } = response.data.data;
          setAuthToken(token);
          localStorage.setItem("refreshToken", newRefreshToken);

          error.config.headers.Authorization = `Bearer ${token}`;
          return api(error.config);
        } catch (refreshError) {
          setAuthToken(null);
          window.location.href = "/login";
        }
      } else {
        setAuthToken(null);
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
