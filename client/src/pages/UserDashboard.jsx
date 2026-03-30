import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

/* ── My Reviews Tab ─────────────────────────────────────── */
const MyReviewsTab = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await API.get("/reviews/my-reviews"); setReviews(data.reviews); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try { await API.delete(`/reviews/${reviewId}`); setReviews(reviews.filter(r => r._id !== reviewId)); }
    catch { alert("Failed to delete review"); }
  };

  if (loading) return <Spinner className="py-12" />;
  if (reviews.length === 0) return <EmptyState icon="⭐" title="No reviews yet" description="Browse listings and share your experience." actionLabel="Browse Listings" onAction={() => navigate("/search")} />;

  return (
    <div className="space-y-3">
      {reviews.map(review => (
        <Card key={review._id} className="p-4 hover:border-gray-300 dark:hover:border-gray-700 transition-colors">
          <div className="flex gap-4">
            <div className="w-20 h-16 bg-gray-100 dark:bg-dark-elevated rounded-lg overflow-hidden shrink-0">
              {review.listing?.images?.[0] ? (
                <img src={review.listing.images[0]} alt="" className="w-full h-full object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center text-xl">🏠</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate" onClick={() => navigate(`/listing/${review.listing?._id}`)}>
                  {review.listing?.title}
                </h3>
                <button onClick={() => handleDelete(review._id)} className="text-red-500 dark:text-red-400 text-xs hover:underline ml-2 shrink-0">Delete</button>
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-xs mb-1">📍 {review.listing?.city} — ₹{review.listing?.rent?.toLocaleString()}/mo</p>
              <p className="text-amber-500 dark:text-amber-400 text-sm">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} <span className="text-gray-500 dark:text-gray-500 text-xs ml-1">{review.rating}/5</span></p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">{review.comment}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── Bookings Tab ──────────────────────────────────────────── */
const BookingsTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try { const { data } = await API.get("/bookings/my-requests"); setBookings(data.bookings); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const cancelBooking = async (bookingId) => {
    try { await API.put(`/bookings/${bookingId}/cancel`); setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "Cancelled" } : b)); }
    catch (err) { alert(err.response?.data?.message || "Failed to cancel"); }
  };

  if (loading) return <Spinner className="py-12" />;
  if (bookings.length === 0) return <EmptyState icon="📋" title="No bookings yet" description="Browse listings and send booking requests." actionLabel="Browse Listings" onAction={() => navigate("/search")} />;

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <Card key={booking._id} className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-20 bg-gray-100 dark:bg-dark-elevated rounded-lg overflow-hidden shrink-0">
              {booking.listing?.images?.[0] ? (
                <img src={booking.listing.images[0]} alt="" className="w-full h-full object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm truncate" onClick={() => navigate(`/listing/${booking.listing?._id}`)}>
                  {booking.listing?.title}
                </h3>
                <Badge status={booking.status} />
              </div>
              <p className="text-gray-500 dark:text-gray-500 text-sm">📍 {booking.listing?.city} • ₹{booking.listing?.rent?.toLocaleString()}/mo</p>
              <p className="text-gray-500 dark:text-gray-500 text-sm">📅 Move-in: {new Date(booking.moveInDate).toLocaleDateString()} • {booking.duration} month(s)</p>
              {booking.ownerResponse && (
                <div className="mt-2 bg-gray-100 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400">
                  💬 Owner: {booking.ownerResponse}
                </div>
              )}
              {booking.status === "Pending" && (
                <Button variant="danger" size="sm" onClick={() => cancelBooking(booking._id)} className="mt-2">Cancel Request</Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ── Main Dashboard ────────────────────────────────────────── */
const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [wishlist, setWishlist] = useState([]);
  const [wLoading, setWLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "wishlist") fetchWishlist();
  }, [activeTab]);

  const fetchWishlist = async () => {
    setWLoading(true);
    try { const { data } = await API.get("/listings/user/wishlist"); setWishlist(data.listings); }
    catch (err) { console.error(err); }
    finally { setWLoading(false); }
  };

  const removeFromWishlist = async (listingId) => {
    try { await API.delete(`/listings/${listingId}/wishlist`); setWishlist(wishlist.filter(l => l._id !== listingId)); }
    catch (err) { console.error(err); }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "bookings", label: "Bookings", icon: "📋" },
    { key: "wishlist", label: "Wishlist", icon: "❤️" },
    { key: "reviews", label: "Reviews", icon: "⭐" },
  ];

  return (
    <DashboardLayout title="My Dashboard" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Profile */}
      {activeTab === "profile" && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-gray-500 dark:text-gray-500">{user?.email}</p>
              <Badge status={user?.role} className="mt-1" />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-dark-border pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-gray-500 dark:text-gray-500">Full Name</p><p className="font-medium text-gray-700 dark:text-gray-300">{user?.name}</p></div>
              <div><p className="text-gray-500 dark:text-gray-500">Email</p><p className="font-medium text-gray-700 dark:text-gray-300">{user?.email}</p></div>
              {user?.phone && <div><p className="text-gray-500 dark:text-gray-500">Phone</p><p className="font-medium text-gray-700 dark:text-gray-300">{user.phone}</p></div>}
            </div>
          </div>
        </Card>
      )}

      {/* Bookings */}
      {activeTab === "bookings" && <BookingsTab />}

      {/* Wishlist */}
      {activeTab === "wishlist" && (
        <div>
          {wLoading ? <Spinner className="py-12" /> : wishlist.length === 0 ? (
            <EmptyState icon="🤍" title="No saved listings" description="Browse listings and save your favorites." actionLabel="Browse Listings" onAction={() => navigate("/search")} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wishlist.map(listing => (
                <Card key={listing._id} hover className="overflow-hidden">
                  <div className="h-36 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                    {listing.images?.[0] ? (
                      <img src={listing.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : <div className="w-full h-full flex items-center justify-center text-3xl">🏠</div>}
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-1">{listing.title}</h3>
                    <p className="text-gray-500 dark:text-gray-500 text-sm mb-2">📍 {listing.city} — ₹{listing.rent?.toLocaleString()}/mo</p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => navigate(`/listing/${listing._id}`)} className="flex-1">View</Button>
                      <Button variant="danger" size="sm" onClick={() => removeFromWishlist(listing._id)} className="flex-1">Remove</Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Reviews */}
      {activeTab === "reviews" && <MyReviewsTab />}
    </DashboardLayout>
  );
};

export default UserDashboard;