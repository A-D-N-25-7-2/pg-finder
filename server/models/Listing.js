const mongoose = require("mongoose");

const ListingSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: [true, "Title is required"], trim: true },
    description: { type: String, required: [true, "Description is required"] },
    address: { type: String, required: [true, "Address is required"] },
    city: {
      type: String,
      required: [true, "City is required"],
      lowercase: true,
    },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    rent: { type: Number, required: [true, "Rent is required"] },
    type: { type: String, enum: ["PG", "Hostel"], required: true },
    gender: { type: String, enum: ["Male", "Female", "Any"], required: true },
    amenities: [{ type: String }],
    images: [{ type: String }],
    rules: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },
    totalViews: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

// Geospatial index for location-based queries
ListingSchema.index({ location: "2dsphere" });
ListingSchema.index({ city: 1, rent: 1, status: 1 });

module.exports = mongoose.model("Listing", ListingSchema);
