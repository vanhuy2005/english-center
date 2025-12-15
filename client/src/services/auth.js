import api from "./api";

export const authAPI = {
  login: (phone, password) => {
    console.log("🔐 Logging in with phone:", phone);
    return api.post("/auth/login", { phone, password });
  },

  register: (data) => {
    console.log("📝 Registering user");
    return api.post("/auth/register", data);
  },

  logout: () => {
    console.log("🚪 Logging out");
    return api.post("/auth/logout");
  },

  getMe: () => {
    return api.get("/auth/me");
  },

  changePassword: (data) => {
    return api.put("/auth/change-password", data);
  },

  refreshToken: (refreshToken) => {
    return api.post("/auth/refresh-token", { refreshToken });
  },
};
