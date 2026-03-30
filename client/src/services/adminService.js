import API from "../api/axios";

export const getDashboard = () => API.get("/admin/dashboard");
export const getAdminListings = (params) => API.get("/admin/listings", { params });
export const approveListing = (id) => API.put(`/admin/listings/${id}/approve`);
export const rejectListing = (id) => API.put(`/admin/listings/${id}/reject`);
export const deleteAdminListing = (id) => API.delete(`/admin/listings/${id}`);
export const getAllUsers = (params) => API.get("/admin/users", { params });
export const suspendUser = (id) => API.put(`/admin/users/${id}/suspend`);
export const activateUser = (id) => API.put(`/admin/users/${id}/activate`);
export const deleteAdminReview = (id) => API.delete(`/admin/reviews/${id}`);
export const getAllBookings = (params) => API.get("/admin/bookings", { params });
