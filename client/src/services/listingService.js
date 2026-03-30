import API from "../api/axios";

export const getListings = (params) => API.get("/listings", { params });
export const getListing = (id) => API.get(`/listings/${id}`);
export const createListing = (data) => API.post("/listings", data);
export const updateListing = (id, data) => API.put(`/listings/${id}`, data);
export const deleteListing = (id) => API.delete(`/listings/${id}`);
export const toggleStatus = (id, data) => API.put(`/listings/${id}/status`, data);
export const getMyListings = () => API.get("/listings/owner/my-listings");
export const uploadImages = (id, formData) =>
  API.post(`/listings/${id}/images`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const deleteImage = (id, data) => API.delete(`/listings/${id}/images`, { data });
export const addToWishlist = (id) => API.post(`/listings/${id}/wishlist`);
export const removeFromWishlist = (id) => API.delete(`/listings/${id}/wishlist`);
export const getWishlist = () => API.get("/listings/user/wishlist");
