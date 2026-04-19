import API from "../api/axios";

export const loginUser = (data) => API.post("/auth/login", data);
export const sendOtp = (data) => API.post("/auth/send-otp", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const getMe = () => API.get("/auth/me");
export const updateProfile = (data) => API.put("/auth/update-profile", data);
export const changePassword = (data) => API.put("/auth/change-password", data);
