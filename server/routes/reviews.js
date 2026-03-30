const express = require("express");
const router = express.Router();
const {
  createReview,
  getListingReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  createReviewValidation,
  updateReviewValidation,
} = require("../controllers/reviewController");
const { protect } = require("../middleware/auth");

// ── Must be before /:id ───────────────────────────────────────
router.get("/my-reviews", protect, getMyReviews);
router.get("/listing/:listingId", getListingReviews);

// ── CRUD ──────────────────────────────────────────────────────
router.post("/", protect, createReviewValidation, createReview);
router.put("/:id", protect, updateReviewValidation, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
