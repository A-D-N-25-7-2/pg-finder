const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
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

// ── Validation rules ──────────────────────────────────────────
const updateListingValidation = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("description").optional().notEmpty().withMessage("Description cannot be empty"),
  body("address").optional().notEmpty().withMessage("Address cannot be empty"),
  body("city").optional().notEmpty().withMessage("City cannot be empty"),
  body("rent").optional().isNumeric().withMessage("Rent must be a number"),
  body("type").optional().isIn(["PG", "Hostel"]).withMessage("Type must be PG or Hostel"),
  body("gender").optional().isIn(["Male", "Female", "Any"]).withMessage("Invalid gender value"),
];

// ── Public routes ─────────────────────────────────────────────
router.get("/", getAllListings);

// ── Must be before /:id to avoid conflict ────────────────────
router.get("/owner/my-listings", protect, authorize("owner"), getMyListings);
router.get("/user/wishlist", protect, authorize("user", "owner"), getWishlist);

// ── Single listing ────────────────────────────────────────────
router.get("/:id", getListing);

// ── Owner only ────────────────────────────────────────────────
router.post("/", protect, authorize("owner"), createListing);
router.put("/:id", protect, authorize("owner"), updateListingValidation, updateListing);
router.delete("/:id", protect, deleteListing);
router.put("/:id/status", protect, authorize("owner"), toggleStatus);

// ── Image upload ──────────────────────────────────────────────
router.post("/:id/images", protect, authorize("owner"), upload.array("images", 10), uploadImages);
router.delete("/:id/images", protect, authorize("owner"), deleteImage);

// ── Wishlist ──────────────────────────────────────────────────
router.post("/:id/wishlist", protect, authorize("user", "owner"), addToWishlist);
router.delete("/:id/wishlist", protect, authorize("user", "owner"), removeFromWishlist);

module.exports = router;
