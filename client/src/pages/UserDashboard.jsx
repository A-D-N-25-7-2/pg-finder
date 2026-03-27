import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import BookingsTab from "../components/BookingTab";

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("profile");
  const [wishlist, setWishlist] = useState([]);
  const [wLoading, setWLoading] = useState(false);

  // Fetch wishlist
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

  const tabs = ["profile", "bookings", "wishlist", "reviews"];

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-800 mb-6">My Dashboard</h1>

        {/* Tab buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-blue-700 text-white"
                  : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ── PROFILE TAB ─────────────────────────────────── */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Profile Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-2xl">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-800">
                    {user?.name}
                  </p>
                  <p className="text-gray-500">{user?.email}</p>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full capitalize">
                    {user?.role}
                  </span>
                </div>
              </div>
              <hr />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Full Name</p>
                  <p className="font-medium text-gray-800">{user?.name}</p>
                </div>
                <div>
                  <p className="text-gray-400">Email</p>
                  <p className="font-medium text-gray-800">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>
          </div>
        )}
        {/* ── BOOKINGS TAB ─────────────────────────────────── */}
        {activeTab === "bookings" && <BookingsTab />}

        {/* ── WISHLIST TAB ─────────────────────────────────── */}
        {activeTab === "wishlist" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              My Wishlist
            </h2>

            {wLoading ? (
              <div className="text-center py-12 text-gray-400">
                Loading wishlist...
              </div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p className="text-5xl mb-4">🤍</p>
                <p>No saved listings yet.</p>
                <button
                  onClick={() => navigate("/search")}
                  className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
                >
                  Browse Listings
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {wishlist.map((listing) => (
                  <div
                    key={listing._id}
                    className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition"
                  >
                    {/* Image */}
                    <div className="h-36 bg-blue-100 overflow-hidden">
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          🏠
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div className="p-3">
                      <h3 className="font-bold text-gray-800 mb-1">
                        {listing.title}
                      </h3>
                      <p className="text-gray-500 text-sm mb-2">
                        📍 {listing.city} — ₹{listing.rent.toLocaleString()}/mo
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate(`/listing/${listing._id}`)}
                          className="flex-1 bg-blue-700 text-white py-1 rounded-lg text-sm hover:bg-blue-800 transition"
                        >
                          View
                        </button>
                        <button
                          onClick={() => removeFromWishlist(listing._id)}
                          className="flex-1 border border-red-400 text-red-500 py-1 rounded-lg text-sm hover:bg-red-50 transition"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── REVIEWS TAB ──────────────────────────────────── */}
        {activeTab === "reviews" && (
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">My Reviews</h2>
            <div className="text-center py-12 text-gray-400">
              <p className="text-5xl mb-4">⭐</p>
              <p>Reviews system coming in Day 6!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;