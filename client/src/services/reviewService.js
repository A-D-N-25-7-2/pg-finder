import API from "../api/axios";

export const createReview = (data) => API.post("/reviews", data);
export const getListingReviews = (listingId) => API.get(`/reviews/listing/${listingId}`);
export const getMyReviews = () => API.get("/reviews/my-reviews");
export const updateReview = (id, data) => API.put(`/reviews/${id}`, data);
export const deleteReview = (id) => API.delete(`/reviews/${id}`);
