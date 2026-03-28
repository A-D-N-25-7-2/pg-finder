import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Star Rating Component ─────────────────────────────────────
const StarRating = ({
  rating,
  onRate,
  readonly = false,
  size = "text-2xl",
}) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`${size} cursor-pointer transition ${
            readonly ? "cursor-default" : ""
          }`}
          style={{ color: (hovered || rating) >= star ? "#f59e0b" : "#d1d5db" }}
          onClick={() => !readonly && onRate && onRate(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
        >
          ★
        </span>
      ))}
    </div>
  );
};

// ── Main Reviews Section ──────────────────────────────────────
const ReviewsSection = ({ listingId }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [total, setTotal] = useState(0);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Fetch reviews
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/reviews/listing/${listingId}`);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotal(data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  // Submit new review
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (rating === 0) {
      setFormError("Please select a star rating");
      return;
    }
    if (!comment.trim()) {
      setFormError("Please write a comment");
      return;
    }

    setSubmitting(true);
    try {
      await API.post("/reviews", {
        listingId,
        rating,
        comment,
      });
      setFormSuccess("Review submitted successfully!");
      setRating(0);
      setComment("");
      setShowForm(false);
      fetchReviews(); // refresh reviews
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  // Start editing a review
  const startEdit = (review) => {
    setEditingId(review._id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  // Submit edit
  const handleEditSubmit = async (reviewId) => {
    setEditSubmitting(true);
    try {
      await API.put(`/reviews/${reviewId}`, {
        rating: editRating,
        comment: editComment,
      });
      setEditingId(null);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update review");
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete review
  const handleDelete = async (reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      fetchReviews();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete review");
    }
  };

  // Format date
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 pb-1 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Reviews & Ratings</h2>
          {total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating
                rating={Math.round(averageRating)}
                readonly
                size="text-lg"
              />
              <span className="text-gray-600 text-sm">
                {averageRating} out of 5 ({total}{" "}
                {total === 1 ? "review" : "reviews"})
              </span>
            </div>
          )}
        </div>

        {/* Write review button */}
        {isAuthenticated && user?.role === "user" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
          >
            {showForm ? "Cancel" : "✍️ Write a Review"}
          </button>
        )}
        {!isAuthenticated && (
          <button
            onClick={() => navigate("/login")}
            className="border border-blue-700 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
          >
            Login to Review
          </button>
        )}
      </div>

      {/* ── Review Form ─────────────────────────────────────── */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Write Your Review</h3>

          {formError && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg mb-3 text-sm">
              {formError}
            </div>
          )}
          {formSuccess && (
            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg mb-3 text-sm">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Rating
              </label>
              <StarRating rating={rating} onRate={setRating} size="text-3xl" />
              {rating > 0 && (
                <p className="text-sm text-gray-500 mt-1">
                  {
                    ["", "Poor", "Fair", "Good", "Very Good", "Excellent"][
                      rating
                    ]
                  }
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Your Review
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                placeholder="Share your experience about this PG/Hostel..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-800 disabled:opacity-50 transition text-sm"
              >
                {submitting ? "Submitting..." : "Submit Review"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setFormError("");
                }}
                className="border border-gray-300 text-gray-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Reviews List ─────────────────────────────────────── */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-lg font-medium">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this place!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition"
            >
              {editingId === review._id ? (
                // ── Edit mode ──────────────────────────────
                <div className="space-y-3">
                  <StarRating
                    rating={editRating}
                    onRate={setEditRating}
                    size="text-2xl"
                  />
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(review._id)}
                      disabled={editSubmitting}
                      className="bg-blue-700 text-white px-4 py-1 rounded-lg text-sm hover:bg-blue-800 disabled:opacity-50 transition"
                    >
                      {editSubmitting ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="border border-gray-300 text-gray-600 px-4 py-1 rounded-lg text-sm hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ── View mode ──────────────────────────────
                <div>
                  <div className="flex justify-between items-start mb-2">
                    {/* Reviewer info */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                        {review.reviewer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">
                          {review.reviewer?.name}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* Actions (own review) */}
                    {user?.id === review.reviewer?._id ||
                    user?._id === review.reviewer?._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEdit(review)}
                          className="text-blue-600 text-xs hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(review._id)}
                          className="text-red-500 text-xs hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    ) : user?.role === "admin" ? (
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-500 text-xs hover:underline"
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>

                  {/* Stars */}
                  <StarRating rating={review.rating} readonly size="text-lg" />

                  {/* Comment */}
                  <p className="text-gray-600 text-sm mt-2 leading-relaxed">
                    {review.comment}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
