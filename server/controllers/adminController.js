const User = require("../models/User");
const Listing = require("../models/Listing");
const Booking = require("../models/Booking");
const Review = require("../models/Review");
const { cloudinary } = require("../config/cloudinary");

// ─── DASHBOARD ────────────────────────────────────────────────
// GET /api/v1/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalOwners,
      totalListings,
      activeListings,
      pendingListings,
      totalBookings,
      approvedBookings,
      totalReviews,
    ] = await Promise.all([
      User.countDocuments({ role: "user" }),
      User.countDocuments({ role: "owner" }),
      Listing.countDocuments(),
      Listing.countDocuments({ status: "Active" }),
      Listing.countDocuments({ status: "Pending" }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: "Approved" }),
      Review.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalOwners,
        totalListings,
        activeListings,
        pendingListings,
        totalBookings,
        approvedBookings,
        totalReviews,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── LISTINGS ─────────────────────────────────────────────────
// GET /api/v1/admin/listings
const getAllListings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Listing.countDocuments(filter);

    const listings = await Listing.find(filter)
      .populate("owner", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: listings.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/admin/listings/:id/approve
const approveListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    listing.status = "Active";
    await listing.save();

    res.status(200).json({ success: true, message: "Listing approved", listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/admin/listings/:id/reject
const rejectListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    listing.status = "Rejected";
    await listing.save();

    res.status(200).json({
      success: true,
      message: "Listing rejected",
      reason: req.body?.reason || "",
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/admin/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing)
      return res.status(404).json({ success: false, message: "Listing not found" });

    // Delete images from Cloudinary
    for (const imageUrl of listing.images) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`pg-hostel-finder/${publicId}`);
    }

    await listing.deleteOne();

    res.status(200).json({ success: true, message: "Listing deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── USERS ────────────────────────────────────────────────────
// GET /api/v1/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const filter = role ? { role } : { role: { $ne: "admin" } };
    const skip = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: users.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/admin/users/:id/suspend
const suspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    if (user.role === "admin")
      return res.status(403).json({ success: false, message: "Cannot suspend an admin" });

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User suspended",
      reason: req.body?.reason || "",
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/v1/admin/users/:id/activate
const activateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User activated",
      user: { id: user._id, name: user.name, email: user.email, isActive: user.isActive },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REVIEWS ──────────────────────────────────────────────────
// DELETE /api/v1/admin/reviews/:id
const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review)
      return res.status(404).json({ success: false, message: "Review not found" });

    // findOneAndDelete triggers post('findOneAndDelete') hook → recalcRating
    await Review.findOneAndDelete({ _id: req.params.id });

    res.status(200).json({ success: true, message: "Review deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── BOOKINGS ─────────────────────────────────────────────────
// GET /api/v1/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(filter);

    const bookings = await Booking.find(filter)
      .populate({ path: "listing", select: "title address city rent" })
      .populate({ path: "tenant", select: "name email" })
      .populate({ path: "owner", select: "name email" })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: bookings.length,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboard,
  getAllListings,
  approveListing,
  rejectListing,
  deleteListing,
  getAllUsers,
  suspendUser,
  activateUser,
  deleteReview,
  getAllBookings,
};
