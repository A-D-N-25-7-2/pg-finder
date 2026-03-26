const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyRequests,
  getOwnerRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBooking,
  createBookingValidation,
} = require("../controllers/bookingController");
const { protect, authorize } = require("../middleware/auth");

// ── Must be before /:id ───────────────────────────────────────
router.get("/my-requests", protect, authorize("user"), getMyRequests);
router.get("/owner-requests", protect, authorize("owner"), getOwnerRequests);

// ── Single booking ────────────────────────────────────────────
router.get("/:id", protect, getBooking);

// ── Create ────────────────────────────────────────────────────
router.post("/", protect, authorize("user"), createBookingValidation, createBooking);

// ── Status updates ────────────────────────────────────────────
router.put("/:id/approve", protect, authorize("owner"), approveBooking);
router.put("/:id/reject", protect, authorize("owner"), rejectBooking);
router.put("/:id/cancel", protect, authorize("user"), cancelBooking);

module.exports = router;
