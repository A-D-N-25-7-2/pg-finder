import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ReviewsSection from "../components/ReviewsSection";
const ListingDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishLoading, setWishLoading] = useState(false);

  // ── Fetch listing ────────────────────────────────────────────
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await API.get(`/listings/${id}`);
        setListing(data.listing);
        if (user?.wishlist?.includes(id)) setWishlisted(true);
      } catch (err) {
        setError("Listing not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // ── Wishlist toggle ──────────────────────────────────────────
  const handleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    setWishLoading(true);
    try {
      if (wishlisted) {
        await API.delete(`/listings/${id}/wishlist`);
        setWishlisted(false);
      } else {
        await API.post(`/listings/${id}/wishlist`);
        setWishlisted(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishLoading(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-bounce">🏠</div>
          <p className="text-gray-500 text-lg">Loading listing...</p>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────
  if (error || !listing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="text-center">
          <p className="text-5xl mb-4">😕</p>
          <p className="text-gray-500 text-xl mb-4">
            {error || "Listing not found"}
          </p>
          <button
            onClick={() => navigate("/search")}
            className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-blue-700 hover:text-blue-900 font-medium transition"
        >
          ← Back to results
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* ── IMAGE GALLERY ───────────────────────────────── */}
          <div className="relative">
            {/* Main image */}
            <div className="h-80 bg-gradient-to-br from-blue-100 to-blue-200 overflow-hidden">
              {listing.images?.length > 0 ? (
                <img
                  src={listing.images[activeImg]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  🏠
                </div>
              )}
            </div>

            {/* Wishlist heart button */}
            <button
              onClick={handleWishlist}
              disabled={wishLoading}
              title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
              className="absolute top-4 right-4 bg-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg text-xl hover:scale-110 transition"
            >
              {wishlisted ? "❤️" : "🤍"}
            </button>

            {/* Image count badge */}
            {listing.images?.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white text-xs px-3 py-1 rounded-full">
                {activeImg + 1} / {listing.images.length}
              </div>
            )}

            {/* Thumbnail strip */}
            {listing.images?.length > 1 && (
              <div className="flex gap-2 p-3 bg-gray-50 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`thumb-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-lg cursor-pointer shrink-0 border-2 transition ${
                      activeImg === i
                        ? "border-blue-700 opacity-100"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── MAIN CONTENT ────────────────────────────────── */}
          <div className="p-6">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">
                  {listing.title}
                </h1>
                <p className="text-gray-500">
                  📍 {listing.address},{" "}
                  {listing.city.charAt(0).toUpperCase() + listing.city.slice(1)}
                </p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <p className="text-3xl font-bold text-blue-800">
                  ₹{listing.rent.toLocaleString()}
                </p>
                <p className="text-gray-400 text-sm">per month</p>
              </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                🏠 {listing.type}
              </span>
              <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-semibold">
                👤 {listing.gender}
              </span>
              {listing.averageRating > 0 && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {listing.averageRating} ({listing.reviewCount} reviews)
                </span>
              )}
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                👁️ {listing.totalViews} views
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  listing.status === "Active"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {listing.status === "Active"
                  ? "✅ Available"
                  : "❌ Not Available"}
              </span>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* ── LEFT — Details ───────────────────────── */}
              <div className="md:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                    About this place
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                {/* Amenities */}
                {listing.amenities?.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-3 pb-1 border-b border-gray-200">
                      Amenities
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity, i) => (
                        <span
                          key={i}
                          className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* House Rules */}
                {listing.rules && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                      House Rules
                    </h2>
                    <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                      <p className="text-gray-700">📋 {listing.rules}</p>
                    </div>
                  </div>
                )}

                {/* Location */}
                <div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2 pb-1 border-b border-gray-200">
                    Location
                  </h2>
                  <div className="bg-gray-100 rounded-xl h-48 flex items-center justify-center">
                    <div className="text-center text-gray-400">
                      <p className="text-4xl mb-2">🗺️</p>
                      <p className="font-medium text-gray-600">
                        {listing.address}
                      </p>
                      <p className="text-sm mt-1">
                        {listing.city.charAt(0).toUpperCase() +
                          listing.city.slice(1)}
                      </p>
                    </div>
                  </div>
                </div>
                <ReviewsSection listingId={id} />
              </div>

              {/* ── RIGHT — Sidebar ──────────────────────── */}
              <div className="space-y-4">
                {/* Owner Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">
                    Owner Details
                  </h2>

                  {isAuthenticated ? (
                    <div className="space-y-3">
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {listing.owner?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">
                            {listing.owner?.name}
                          </p>
                          <p className="text-gray-500 text-xs">
                            Property Owner
                          </p>
                        </div>
                      </div>
                      {/* Contact info */}
                      <div className="space-y-1 pt-1 border-t border-blue-200">
                        <p className="text-gray-600 text-sm">
                          ✉️ {listing.owner?.email}
                        </p>
                        {listing.owner?.phone && (
                          <p className="text-gray-600 text-sm">
                            📞 {listing.owner.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-5xl mb-2">🔒</p>
                      <p className="text-gray-500 text-sm mb-3">
                        Login to view owner contact details
                      </p>
                      <button
                        onClick={() => navigate("/login")}
                        className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-800 transition w-full"
                      >
                        Login to View
                      </button>
                    </div>
                  )}
                </div>

                {/* Booking Button */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center shadow-sm">
                  <p className="text-gray-500 text-sm mb-3 font-medium">
                    Interested in this place?
                  </p>

                  {isAuthenticated && user?.role === "user" ? (
                    <button
                      onClick={() => alert("Booking system coming in Day 5!")}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition text-lg"
                    >
                      📩 Send Booking Request
                    </button>
                  ) : !isAuthenticated ? (
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition"
                    >
                      Login to Book
                    </button>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-gray-400 text-sm">
                        Only tenants can send booking requests
                      </p>
                    </div>
                  )}
                </div>

                {/* Wishlist Button */}
                <button
                  onClick={handleWishlist}
                  disabled={wishLoading}
                  className={`w-full py-3 rounded-xl font-semibold border-2 transition text-sm ${
                    wishlisted
                      ? "border-red-400 text-red-500 bg-red-50 hover:bg-red-100"
                      : "border-blue-700 text-blue-700 bg-white hover:bg-blue-50"
                  }`}
                >
                  {wishLoading
                    ? "Updating..."
                    : wishlisted
                      ? "❤️ Remove from Wishlist"
                      : "🤍 Save to Wishlist"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailPage;