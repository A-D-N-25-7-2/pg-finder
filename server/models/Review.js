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


ReviewSchema.index({ listing: 1, reviewer: 1 }, { unique: true });


// Shared helper to recalculate listing rating stats
async function recalcRating(listingId) {
  const Listing = mongoose.model("Listing");
  const stats = await mongoose.model("Review").aggregate([
    { $match: { listing: listingId } },
    { $group: { _id: "$listing", avgRating: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Listing.findByIdAndUpdate(listingId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    // No reviews left — reset
    await Listing.findByIdAndUpdate(listingId, { averageRating: 0, reviewCount: 0 });
  }
}

ReviewSchema.post("save", async function () {
  await recalcRating(this.listing);
});

// Fires after findOneAndDelete (used in controller)
ReviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) await recalcRating(doc.listing);
});

module.exports = mongoose.model("Review", ReviewSchema);
