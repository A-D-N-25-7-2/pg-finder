import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import StarRating from "./ui/StarRating";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import Spinner from "./ui/Spinner";

const ReviewsSection = ({ listingId }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [averageRating, setAverageRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/reviews/listing/${listingId}`);
      setReviews(data.reviews);
      setAverageRating(data.averageRating);
      setTotal(data.reviewCount ?? data.count ?? 0);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchReviews(); }, [listingId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (rating === 0) { setFormError("Please select a star rating"); return; }
    if (!comment.trim()) { setFormError("Please write a comment"); return; }
    setSubmitting(true);
    try {
      await API.post("/reviews", { listingId, rating, comment });
      setRating(0); setComment(""); setShowForm(false);
      fetchReviews();
    } catch (err) { setFormError(err.response?.data?.message || "Failed to submit review"); }
    finally { setSubmitting(false); }
  };

  const startEdit = (review) => { setEditingId(review._id); setEditRating(review.rating); setEditComment(review.comment); };

  const handleEditSubmit = async (reviewId) => {
    setEditSubmitting(true);
    try { await API.put(`/reviews/${reviewId}`, { rating: editRating, comment: editComment }); setEditingId(null); fetchReviews(); }
    catch (err) { alert(err.response?.data?.message || "Failed to update"); }
    finally { setEditSubmitting(false); }
  };

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try { await API.delete(`/reviews/${reviewId}`); fetchReviews(); }
    catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4 pb-1 border-b border-gray-200 dark:border-dark-border">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Reviews & Ratings</h2>
          {total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={Math.round(averageRating)} readonly size="text-base" />
              <span className="text-gray-500 dark:text-gray-500 text-sm">{averageRating} out of 5 ({total} {total === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>
        {isAuthenticated && user?.role === "user" && (
          <Button size="sm" onClick={() => setShowForm(!showForm)}>{showForm ? "Cancel" : "✍️ Write Review"}</Button>
        )}
        {!isAuthenticated && (
          <Button variant="secondary" size="sm" onClick={() => navigate("/login")}>Login to Review</Button>
        )}
      </div>

      {showForm && (
        <Card className="p-5 mb-6 border-blue-300 dark:border-blue-500/20">
          <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write Your Review</h3>
          {formError && <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg mb-3 text-sm">{formError}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Rating</label>
              <StarRating rating={rating} onRate={setRating} size="text-3xl" />
              {rating > 0 && <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</p>}
            </div>
            <Input label="Your Review" type="textarea" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Share your experience..." />
            <div className="flex gap-3">
              <Button type="submit" loading={submitting} size="sm">Submit Review</Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => { setShowForm(false); setFormError(""); }}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? <Spinner className="py-8" /> : reviews.length === 0 ? (
        <div className="text-center py-10 text-gray-500 dark:text-gray-500">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-lg font-medium text-gray-600 dark:text-gray-400">No reviews yet</p>
          <p className="text-sm mt-1">Be the first to review this place!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map(review => (
            <Card key={review._id} className="p-4">
              {editingId === review._id ? (
                <div className="space-y-3">
                  <StarRating rating={editRating} onRate={setEditRating} size="text-xl" />
                  <Input type="textarea" value={editComment} onChange={(e) => setEditComment(e.target.value)} rows={3} />
                  <div className="flex gap-2">
                    <Button size="sm" loading={editSubmitting} onClick={() => handleEditSubmit(review._id)}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {review.reviewer?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.reviewer?.name}</p>
                        <p className="text-gray-400 dark:text-gray-600 text-xs">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    {(user?.id === review.reviewer?._id || user?._id === review.reviewer?._id) ? (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(review)} className="text-blue-600 dark:text-blue-400 text-xs hover:underline">Edit</button>
                        <button onClick={() => handleDelete(review._id)} className="text-red-500 dark:text-red-400 text-xs hover:underline">Delete</button>
                      </div>
                    ) : user?.role === "admin" ? (
                      <button onClick={() => handleDelete(review._id)} className="text-red-500 dark:text-red-400 text-xs hover:underline">Remove</button>
                    ) : null}
                  </div>
                  <StarRating rating={review.rating} readonly size="text-base" />
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2 leading-relaxed">{review.comment}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReviewsSection;
