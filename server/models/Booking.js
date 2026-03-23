const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    moveInDate: { type: Date, required: [true, "Move-in date is required"] },
    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: 1,
    },
    message: { type: String, default: "" },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Cancelled"],
      default: "Pending",
    },
    ownerResponse: { type: String, default: "" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", BookingSchema);
