import API from "../api/axios";

export const createBooking = (data) => API.post("/bookings", data);
export const getMyRequests = () => API.get("/bookings/my-requests");
export const getOwnerRequests = () => API.get("/bookings/owner-requests");
export const approveBooking = (id, data) => API.put(`/bookings/${id}/approve`, data);
export const rejectBooking = (id, data) => API.put(`/bookings/${id}/reject`, data);
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
