const Review = require("../models/Review");
const Listing = require("../models/Listing");
const { body, validationResult } = require("express-validator");

const populate = [
  { path: "reviewer", select: "name email" },
  { path: "listing", select: "title" },
];

// ─── A. CREATE REVIEW ─────────────────────────────────────────
// POST /api/v1/reviews
const createReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { listingId, rating, comment } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    // One review per user per listing (enforced by unique index too)
    const existing = await Review.findOne({ listing: listingId, reviewer: req.user.id });
    if (existing)
      return res.status(400).json({ success: false, message: "You have already reviewed this listing" });

    const review = await Review.create({
      listing: listingId,
      reviewer: req.user.id,
      rating,
      comment,
    });

    await review.populate(populate);

    res.status(201).json({ success: true, message: "Review submitted", review });
  } catch (error) {
    // Catch duplicate key error from unique index
    if (error.code === 11000)
      return res.status(400).json({ success: false, message: "You have already reviewed this listing" });
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── B. GET REVIEWS FOR LISTING ───────────────────────────────
// GET /api/v1/reviews/listing/:listingId
const getListingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const filter = { listing: req.params.listingId, isVisible: true };
    const total = await Review.countDocuments(filter);

    const reviews = await Review.find(filter)
      .populate(populate)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const listing = await Listing.findById(req.params.listingId).select("averageRating reviewCount");

    res.status(200).json({
      success: true,
      count: reviews.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      averageRating: listing?.averageRating ?? 0,
      reviewCount: listing?.reviewCount ?? 0,
      reviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── C. UPDATE REVIEW ─────────────────────────────────────────
// PUT /api/v1/reviews/:id
const updateReview = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    if (review.reviewer.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized to edit this review" });

    if (req.body.rating !== undefined) review.rating = req.body.rating;
    if (req.body.comment !== undefined) review.comment = req.body.comment;

    await review.save(); // triggers post('save') → recalcRating
    await review.populate(populate);

    res.status(200).json({ success: true, message: "Review updated", review });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── E. GET MY REVIEWS (logged-in user) ──────────────────────
// GET /api/v1/reviews/my-reviews
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewer: req.user.id })
      .populate({ path: "listing", select: "title city rent images" })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── D. DELETE REVIEW ─────────────────────────────────────────
// DELETE /api/v1/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    const isReviewer = review.reviewer.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";

    if (!isReviewer && !isAdmin)
      return res.status(403).json({ success: false, message: "Not authorized to delete this review" });

    // findOneAndDelete triggers post('findOneAndDelete') hook → recalcRating
    await Review.findOneAndDelete({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VALIDATION RULES ─────────────────────────────────────────
const createReviewValidation = [
  body("listingId").notEmpty().withMessage("listingId is required").isMongoId().withMessage("Invalid listingId"),
  body("rating").notEmpty().withMessage("rating is required").isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").notEmpty().withMessage("comment is required"),
];

const updateReviewValidation = [
  body("rating").optional().isInt({ min: 1, max: 5 }).withMessage("Rating must be between 1 and 5"),
  body("comment").optional().notEmpty().withMessage("comment cannot be empty"),
];

module.exports = {
  createReview,
  getListingReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  createReviewValidation,
  updateReviewValidation,
};
