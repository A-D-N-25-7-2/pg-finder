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
import { formatCity } from "../utils/formatCity";
import AppIcon from "../components/ui/AppIcon";

/* ── My Reviews Tab ─────────────────────────────────────── */
const MyReviewsTab = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await API.get("/reviews/my-reviews");
        setReviews(data.reviews);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleDelete = async (reviewId) => {
    if (!window.confirm("Delete this review?")) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
    } catch {
      alert("Failed to delete review");
    }
  };

  if (loading) return <Spinner className="py-12" />;
  if (reviews.length === 0)
    return (
      <EmptyState
        icon="rating"
        title="No reviews yet"
        description="Browse listings and share your experience."
        actionLabel="Browse Listings"
        onAction={() => navigate("/search")}
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reviews.map((review) => (
        <Card
          key={review._id}
          className="p-4 flex flex-col h-full hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
        >
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-dark-elevated rounded-full overflow-hidden shrink-0">
              {review.listing?.images?.[0] ? (
                <img
                  src={review.listing.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">
                  <AppIcon name="home" size={24} />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h3
                    className="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
                    onClick={() => navigate(`/listing/${review.listing?._id}`)}
                  >
                    {review.listing?.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                    <AppIcon name="map" size={13} className="inline mr-1" />{" "}
                    {formatCity(review.listing?.city)} · ₹
                    {review.listing?.rent?.toLocaleString()}/mo
                  </p>
                </div>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(review._id)}
                  className="shrink-0 px-2.5 py-1 text-[11px] rounded-md shadow-none"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-50 dark:bg-dark-elevated/60 p-3">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-amber-500 dark:text-amber-400 text-sm tracking-wide">
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)}
              </span>
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                {review.rating}/5
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed line-clamp-4">
              {review.comment}
            </p>
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
      try {
        const { data } = await API.get("/bookings/my-requests");
        setBookings(data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cancelBooking = async (bookingId) => {
    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      setBookings(
        bookings.map((b) =>
          b._id === bookingId ? { ...b, status: "Cancelled" } : b,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    }
  };

  if (loading) return <Spinner className="py-12" />;
  if (bookings.length === 0)
    return (
      <EmptyState
        icon="booking"
        title="No bookings yet"
        description="Browse listings and send booking requests."
        actionLabel="Browse Listings"
        onAction={() => navigate("/search")}
      />
    );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {bookings.map((booking) => (
        <Card key={booking._id} className="p-4 flex flex-col h-full">
          <div className="relative">
            <div className="w-full h-44 bg-gray-100 dark:bg-dark-elevated rounded-lg overflow-hidden">
              {booking.listing?.images?.[0] ? (
                <img
                  src={booking.listing.images[0]}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  <AppIcon name="home" size={24} />
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2">
              <Badge status={booking.status} overlay />
            </div>
          </div>
          <div className="flex flex-col flex-1 pt-4">
            <h3
              className="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm line-clamp-2"
              onClick={() => navigate(`/listing/${booking.listing?._id}`)}
            >
              {booking.listing?.title}
            </h3>
            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              <AppIcon name="map" size={14} className="inline mr-1" />{" "}
              {formatCity(booking.listing?.city)} • ₹
              {booking.listing?.rent?.toLocaleString()}/mo
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              <AppIcon name="booking" size={14} className="inline mr-1" />{" "}
              Move-in: {new Date(booking.moveInDate).toLocaleDateString()} •{" "}
              {booking.duration} month(s)
            </p>
            {booking.ownerResponse && (
              <div className="mt-3 bg-gray-100 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                <AppIcon name="message" size={14} className="inline mr-1" />{" "}
                Owner: {booking.ownerResponse}
              </div>
            )}
            {booking.status === "Pending" && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => cancelBooking(booking._id)}
                className="mt-auto pt-2 self-start"
              >
                Cancel Request
              </Button>
            )}
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
    try {
      const { data } = await API.get("/listings/user/wishlist");
      setWishlist(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setWLoading(false);
    }
  };

  const removeFromWishlist = async (listingId) => {
    try {
      await API.delete(`/listings/${listingId}/wishlist`);
      setWishlist(wishlist.filter((l) => l._id !== listingId));
    } catch (err) {
      console.error(err);
    }
  };

  const tabs = [
    { key: "profile", label: "Profile", icon: "profile" },
    { key: "bookings", label: "Bookings", icon: "booking" },
    { key: "wishlist", label: "Wishlist", icon: "wishlist" },
    { key: "reviews", label: "Reviews", icon: "rating" },
  ];

  return (
    <DashboardLayout
      title="My Dashboard"
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    >
      {/* Profile */}
      {activeTab === "profile" && (
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Profile Information
          </h2>
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {user?.name}
              </p>
              <p className="text-gray-500 dark:text-gray-500">{user?.email}</p>
              <Badge status={user?.role} className="mt-1" />
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-dark-border pt-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 dark:text-gray-500">Full Name</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {user?.name}
                </p>
              </div>
              <div>
                <p className="text-gray-500 dark:text-gray-500">Email</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {user?.email}
                </p>
              </div>
              {user?.phone && (
                <div>
                  <p className="text-gray-500 dark:text-gray-500">Phone</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300">
                    {user.phone}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Bookings */}
      {activeTab === "bookings" && <BookingsTab />}

      {/* Wishlist */}
      {activeTab === "wishlist" && (
        <div>
          {wLoading ? (
            <Spinner className="py-12" />
          ) : wishlist.length === 0 ? (
            <EmptyState
              icon="wishlist"
              title="No saved listings"
              description="Browse listings and save your favorites."
              actionLabel="Browse Listings"
              onAction={() => navigate("/search")}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((listing) => (
                <Card
                  key={listing._id}
                  hover
                  className="wishlist-card group overflow-hidden flex flex-col h-full"
                >
                  <div className="relative h-48 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt=""
                        className="wishlist-image w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">
                        <AppIcon name="home" size={28} />
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-3 pt-8">
                      <Badge status={listing.type} />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                        {listing.title}
                      </h3>
                      {listing.averageRating > 0 && (
                        <span className="text-amber-500 dark:text-amber-400 text-xs font-semibold shrink-0">
                          {listing.averageRating} / 5
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                      {formatCity(listing.city)}
                    </p>
                    <p className="text-blue-600 dark:text-blue-400 font-bold text-lg mt-2 mb-4">
                      ₹{listing.rent?.toLocaleString()}
                      <span className="text-gray-500 dark:text-gray-400 text-xs font-normal">
                        {" "}
                        / month
                      </span>
                    </p>
                    <div className="flex gap-2 mt-auto">
                      <Button
                        size="sm"
                        onClick={() => navigate(`/listing/${listing._id}`)}
                        className="flex-1"
                      >
                        View
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeFromWishlist(listing._id)}
                        className="flex-1"
                      >
                        Remove
                      </Button>
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
