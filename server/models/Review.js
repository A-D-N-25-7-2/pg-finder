const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    listing: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: [true, "Review comment is required"] },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// One review per user per listing
ReviewSchema.index({ listing: 1, reviewer: 1 }, { unique: true });

// Recalculate average rating after a review is saved
ReviewSchema.post("save", async function () {
  const Listing = mongoose.model("Listing");
  const stats = await mongoose
    .model("Review")
    .aggregate([
      { $match: { listing: this.listing } },
      {
        $group: {
          _id: "$listing",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(this.listing, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", ReviewSchema);
