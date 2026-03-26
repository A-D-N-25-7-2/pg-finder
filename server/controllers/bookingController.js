const Booking = require("../models/Booking");
const Listing = require("../models/Listing");
const { body, validationResult } = require("express-validator");

const populate = [
  { path: "listing", select: "title address city rent type gender images" },
  { path: "tenant", select: "name email phone" },
  { path: "owner", select: "name email phone" },
];

// ─── A. CREATE BOOKING ────────────────────────────────────────
// POST /api/v1/bookings
const createBooking = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });

  try {
    const { listingId, moveInDate, duration, message } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    if (listing.status !== "Active")
      return res.status(400).json({ success: false, message: "Listing is not available for booking" });

    // Prevent duplicate pending booking by same tenant
    const existing = await Booking.findOne({
      listing: listingId,
      tenant: req.user.id,
      status: "Pending",
    });
    if (existing)
      return res.status(400).json({ success: false, message: "You already have a pending booking for this listing" });

    const booking = await Booking.create({
      listing: listingId,
      tenant: req.user.id,
      owner: listing.owner,
      moveInDate,
      duration,
      message,
      status: "Pending",
    });

    await booking.populate(populate);

    res.status(201).json({ success: true, message: "Booking request sent", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── B. GET MY REQUESTS (TENANT) ─────────────────────────────
// GET /api/v1/bookings/my-requests
const getMyRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ tenant: req.user.id })
      .populate(populate)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── C. GET OWNER REQUESTS ────────────────────────────────────
// GET /api/v1/bookings/owner-requests
const getOwnerRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ owner: req.user.id })
      .populate(populate)
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: bookings.length, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── D. APPROVE BOOKING ───────────────────────────────────────
// PUT /api/v1/bookings/:id/approve
const approveBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (booking.status !== "Pending")
      return res.status(400).json({ success: false, message: `Cannot approve a booking with status '${booking.status}'` });

    booking.status = "Approved";
    if (req.body.ownerResponse) booking.ownerResponse = req.body.ownerResponse;
    await booking.save();
    await booking.populate(populate);

    res.status(200).json({ success: true, message: "Booking approved", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── E. REJECT BOOKING ────────────────────────────────────────
// PUT /api/v1/bookings/:id/reject
const rejectBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.owner.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (booking.status !== "Pending")
      return res.status(400).json({ success: false, message: `Cannot reject a booking with status '${booking.status}'` });

    booking.status = "Rejected";
    if (req.body.ownerResponse) booking.ownerResponse = req.body.ownerResponse;
    await booking.save();
    await booking.populate(populate);

    res.status(200).json({ success: true, message: "Booking rejected", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── F. CANCEL BOOKING ────────────────────────────────────────
// PUT /api/v1/bookings/:id/cancel
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    if (booking.tenant.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Not authorized" });

    if (booking.status !== "Pending")
      return res.status(400).json({ success: false, message: "Only pending bookings can be cancelled" });

    booking.status = "Cancelled";
    await booking.save();
    await booking.populate(populate);

    res.status(200).json({ success: true, message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── G. GET SINGLE BOOKING ────────────────────────────────────
// GET /api/v1/bookings/:id
const getBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate(populate);
    if (!booking)
      return res.status(404).json({ success: false, message: "Booking not found" });

    const userId = req.user.id;
    const isTenant = booking.tenant._id.toString() === userId;
    const isOwner = booking.owner._id.toString() === userId;

    if (!isTenant && !isOwner)
      return res.status(403).json({ success: false, message: "Not authorized to view this booking" });

    res.status(200).json({ success: true, booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── VALIDATION RULES ─────────────────────────────────────────
const createBookingValidation = [
  body("listingId").notEmpty().withMessage("listingId is required").isMongoId().withMessage("Invalid listingId"),
  body("moveInDate").notEmpty().withMessage("moveInDate is required").isISO8601().withMessage("moveInDate must be a valid date"),
  body("duration").notEmpty().withMessage("duration is required").isInt({ min: 1 }).withMessage("duration must be at least 1 month"),
];

module.exports = {
  createBooking,
  getMyRequests,
  getOwnerRequests,
  approveBooking,
  rejectBooking,
  cancelBooking,
  getBooking,
  createBookingValidation,
};
