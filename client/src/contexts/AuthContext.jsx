import React, { createContext, useContext, useState, useEffect } from "react";
import apiClient, { setAuthToken } from "../services/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");

    let parsedUser = null;
    let validSession = false;

    if (storedToken && storedUser && storedRole) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setLoading(false);
        return;
      }

      // Token validation: decode and check expiry (simple client-side check)
      try {
        const payload = JSON.parse(atob(storedToken.split(".")[1]));
        if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
          validSession = true;
        }
      } catch (err) {
        // Invalid token format
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
        setLoading(false);
        return;
      }

      if (validSession) {
        setToken(storedToken);
        setUser(parsedUser);
        setRole(storedRole);
        // Set token globally for API calls
        setAuthToken(storedToken);
        // Do NOT mutate axios.defaults globally; set header per request or on a dedicated instance
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("role");
      }
    }

    setLoading(false);
  }, []);

  const login = async (phone, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        phone,
        password,
      });

      // apiClient interceptor returns response.data
      // Backend returns: { success, message, data: { user, profile, token, refreshToken, isFirstLogin } }
      // After interceptor: response = { success, message, data: {...} }
      console.log("Login response:", response);

      // Extract from data property
      const {
        token: newToken,
        user: userData,
        profile,
        isFirstLogin,
      } = response.data || {};

      if (!newToken || !userData) {
        throw new Error("Invalid response from server");
      }

      // Save to state
      setToken(newToken);
      setUser({ ...userData, profile });
      setRole(userData.role);

      // Set token globally for API calls
      setAuthToken(newToken);

      // Save to localStorage
      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify({ ...userData, profile }));
      localStorage.setItem("role", userData.role);

      console.log("Token saved:", newToken);
      console.log("User saved:", { ...userData, profile });
      console.log("Role saved:", userData.role);

      if (!isFirstLogin) {
        toast.success("Đăng nhập thành công!");
      }
      return { success: true, user: { ...userData, isFirstLogin, profile } };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Đăng nhập thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await apiClient.post("/api/auth/register", userData);
      const { token: newToken, user: newUser, role: userRole } = response;

      // Auto login after register
      setToken(newToken);
      setUser(newUser);
      setRole(userRole);

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(newUser));
      localStorage.setItem("role", userRole);

      toast.success("Đăng ký thành công!");
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || "Đăng ký thất bại";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setRole(null);

    // Clear token globally
    setAuthToken(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    toast.success("Đã đăng xuất");
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const value = {
    user,
    token,
    role,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
