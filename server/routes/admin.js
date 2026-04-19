const express = require("express");
const router = express.Router();
const {
  getDashboard,
  getAllListings,
  approveListing,
  rejectListing,
  deleteListing,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteUser,
  deleteReview,
  getAllBookings,
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/auth");

// All admin routes require auth + admin role
router.use(protect, authorize("admin"));

// ── Dashboard ─────────────────────────────────────────────────
router.get("/dashboard", getDashboard);

// ── Listings ──────────────────────────────────────────────────
router.get("/listings", getAllListings);
router.put("/listings/:id/approve", approveListing);
router.put("/listings/:id/reject", rejectListing);
router.delete("/listings/:id", deleteListing);

// ── Users ─────────────────────────────────────────────────────
router.get("/users", getAllUsers);
router.put("/users/:id/suspend", suspendUser);
router.put("/users/:id/activate", activateUser);
router.delete("/users/:id", deleteUser);

// ── Reviews ───────────────────────────────────────────────────
router.delete("/reviews/:id", deleteReview);

// ── Bookings ──────────────────────────────────────────────────
router.get("/bookings", getAllBookings);

module.exports = router;
