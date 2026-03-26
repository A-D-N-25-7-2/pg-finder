const Listing = require("../models/Listing");
const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");
const { validationResult } = require("express-validator");

// Normalize amenities: accepts array or comma-separated string
const parseAmenities = (amenities) => {
  if (!amenities) return [];
  if (Array.isArray(amenities)) return amenities.map((a) => a.trim());
  if (typeof amenities === "string") return amenities.split(",").map((a) => a.trim()).filter(Boolean);
  return [];
};

// ─── CREATE LISTING ───────────────────────────────────────────
// POST /api/v1/listings
const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      address,
      city,
      rent,
      type,
      gender,
      amenities,
      rules,
    } = req.body;

    console.log("req.body:", req.body);
    console.log("typeof req.body.amenities:", typeof req.body.amenities);

    // Build listing object
    const listingData = {
      owner: req.user.id,
      title,
      description,
      address,
      city: city.toLowerCase(),
      rent,
      type,
      gender,
      rules,
      amenities: parseAmenities(amenities),
    };

    const listing = await Listing.create(listingData);

    res.status(201).json({
      success: true,
      message: "Listing created successfully. Pending admin approval.",
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET ALL LISTINGS (with filters) ─────────────────────────
// GET /api/v1/listings
const getAllListings = async (req, res) => {
  try {
    const {
      city,
      rent_min,
      rent_max,
      gender,
      type,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filter = { status: "Active" };

    if (city) filter.city = city.toLowerCase();
    if (gender) filter.gender = gender;
    if (type) filter.type = type;
    if (rent_min || rent_max) {
      filter.rent = {};
      if (rent_min) filter.rent.$gte = Number(rent_min);
      if (rent_max) filter.rent.$lte = Number(rent_max);
    }

    // Pagination
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

// ─── GET SINGLE LISTING ───────────────────────────────────────
// GET /api/v1/listings/:id
const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate(
      "owner",
      "name email phone profilePicture",
    );

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Increment view count
    listing.totalViews += 1;
    await listing.save();

    res.status(200).json({ success: true, listing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPDATE LISTING ───────────────────────────────────────────
// PUT /api/v1/listings/:id
const updateListing = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to update this listing" });
    }

    // Only allow specific fields to be updated
    const allowed = ["title", "description", "address", "city", "rent", "type", "gender", "amenities", "rules"];
    const updates = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    if (updates.amenities !== undefined) {
      updates.amenities = parseAmenities(updates.amenities);
    }
    if (updates.city) updates.city = updates.city.toLowerCase();

    const updated = await Listing.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Listing updated successfully", listing: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE LISTING ───────────────────────────────────────────
// DELETE /api/v1/listings/:id
const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    // Allow owner or admin to delete
    if (listing.owner.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this listing",
      });
    }

    // Delete images from Cloudinary
    for (const imageUrl of listing.images) {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`pg-hostel-finder/${publicId}`);
    }

    await listing.deleteOne();

    res.status(200).json({
      success: true,
      message: "Listing deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── TOGGLE LISTING STATUS ────────────────────────────────────
// PUT /api/v1/listings/:id/status
const toggleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be 'Active' or 'Inactive'",
      });
    }

    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    listing.status = status;
    await listing.save();

    res.status(200).json({
      success: true,
      message: `Listing status updated to ${listing.status}`,
      listing,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET OWNER'S LISTINGS ─────────────────────────────────────
// GET /api/v1/listings/owner/my-listings
const getMyListings = async (req, res) => {
  try {
    const listings = await Listing.find({ owner: req.user.id }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: listings.length,
      listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── UPLOAD IMAGES ────────────────────────────────────────────
// POST /api/v1/listings/:id/images
const uploadImages = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // req.files comes from multer
    const imageUrls = req.files.map((file) => file.path);

    // Add new images to existing ones
    listing.images = [...listing.images, ...imageUrls];
    await listing.save();

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
      images: listing.images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE IMAGE ─────────────────────────────────────────────
// DELETE /api/v1/listings/:id/images
const deleteImage = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: "Listing not found",
      });
    }

    if (listing.owner.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    const { imageUrl } = req.body;

    // Delete from Cloudinary
    const publicId = imageUrl.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`pg-hostel-finder/${publicId}`);

    // Remove from listing
    listing.images = listing.images.filter((img) => img !== imageUrl);
    await listing.save();

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
      images: listing.images,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── WISHLIST ─────────────────────────────────────────────────
// POST /api/v1/listings/:id/wishlist
const addToWishlist = async (req, res) => {
  try {
    const listingId = req.params.id;

    // Verify listing exists
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ success: false, message: "Listing not found" });
    }

    const user = await User.findById(req.user.id);

    // Prevent duplicates
    if (user.wishlist.some((id) => id.toString() === listingId)) {
      return res.status(400).json({ success: false, message: "Already in wishlist" });
    }

    user.wishlist.push(listingId);
    await user.save();

    res.status(200).json({ success: true, message: "Added to wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/listings/:id/wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter((id) => id.toString() !== req.params.id);
    await user.save();

    res.status(200).json({ success: true, message: "Removed from wishlist" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/listings/user/wishlist
const getWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: "wishlist",
      populate: { path: "owner", select: "name email phone" },
    });

    res.status(200).json({ success: true, count: user.wishlist.length, listings: user.wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
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
};
