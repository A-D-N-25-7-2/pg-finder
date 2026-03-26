const express = require("express");
const router = express.Router();
const {
  createListing,
  getAllListings,
  getListing,
  updateListing,
  deleteListing,
  toggleStatus,
  getMyListings,
  uploadImages,
  deleteImage,
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/listingController");
const { protect, authorize } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

// ── Public routes ─────────────────────────────────────────────
router.get("/", getAllListings);

// ── Must be before /:id to avoid conflict ────────────────────
router.get("/owner/my-listings", protect, authorize("owner"), getMyListings);
router.get("/user/wishlist", protect, authorize("user"), getWishlist);

// ── Single listing ────────────────────────────────────────────
router.get("/:id", getListing);

// ── Owner only ────────────────────────────────────────────────
router.post("/", protect, authorize("owner"), createListing);
router.put("/:id", protect, authorize("owner"), updateListing);
router.delete("/:id", protect, deleteListing);
router.put("/:id/status", protect, authorize("owner"), toggleStatus);

// ── Image upload ──────────────────────────────────────────────
router.post(
  "/:id/images",
  protect,
  authorize("owner"),
  upload.array("images", 10),
  uploadImages,
);
router.delete("/:id/images", protect, authorize("owner"), deleteImage);

// ── Wishlist ──────────────────────────────────────────────────
router.post("/:id/wishlist", protect, authorize("user"), addToWishlist);
router.delete("/:id/wishlist", protect, authorize("user"), removeFromWishlist);

module.exports = router;
