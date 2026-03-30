import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import ReviewsSection from "../components/ReviewsSection";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";

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

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await API.get(`/listings/${id}`);
        setListing(data.listing);
        if (user?.wishlist?.includes(id)) setWishlisted(true);
      } catch {
        setError("Listing not found or no longer available.");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleWishlist = async () => {
    if (!isAuthenticated) { navigate("/login"); return; }
    setWishLoading(true);
    try {
      if (wishlisted) {
        await API.delete(`/listings/${id}/wishlist`);
        setWishlisted(false);
      } else {
        await API.post(`/listings/${id}/wishlist`);
        setWishlisted(true);
      }
    } catch (err) { console.error(err); }
    finally { setWishLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-base">
      <div className="text-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-500 dark:text-gray-500">Loading listing...</p>
      </div>
    </div>
  );

  if (error || !listing) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-dark-base">
      <div className="text-center">
        <p className="text-5xl mb-4">😕</p>
        <p className="text-gray-500 dark:text-gray-400 text-xl mb-4">{error || "Listing not found"}</p>
        <Button onClick={() => navigate("/search")}>Back to Search</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors">
          ← Back to results
        </button>

        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden animate-fade-in">
          {/* Image Gallery */}
          <div className="relative">
            <div className="h-72 md:h-96 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
              {listing.images?.length > 0 ? (
                <img src={listing.images[activeImg]} alt={listing.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl text-gray-300 dark:text-gray-700">🏠</div>
              )}
            </div>

            <button
              onClick={handleWishlist}
              disabled={wishLoading}
              className="absolute top-4 right-4 glass rounded-full w-10 h-10 flex items-center justify-center text-xl hover:scale-110 transition-transform"
            >
              {wishlisted ? "❤️" : "🤍"}
            </button>

            {listing.images?.length > 0 && (
              <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                {activeImg + 1} / {listing.images.length}
              </div>
            )}

            {listing.images?.length > 1 && (
              <div className="flex gap-2 p-3 bg-gray-100/80 dark:bg-dark-elevated/80 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <img
                    key={i} src={img} alt={`thumb-${i}`}
                    onClick={() => setActiveImg(i)}
                    className={`h-16 w-24 object-cover rounded-lg cursor-pointer shrink-0 border-2 transition ${
                      activeImg === i ? "border-blue-500 opacity-100" : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4 gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1">{listing.title}</h1>
                <p className="text-gray-500 dark:text-gray-500">📍 {listing.address}, {listing.city.charAt(0).toUpperCase() + listing.city.slice(1)}</p>
              </div>
              <div className="text-left md:text-right shrink-0">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{listing.rent?.toLocaleString()}</p>
                <p className="text-gray-500 dark:text-gray-500 text-sm">per month</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge status={listing.type} />
              <Badge status={listing.gender} className="bg-purple-100 dark:bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20" />
              {listing.averageRating > 0 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                  ⭐ {listing.averageRating} ({listing.reviewCount} reviews)
                </span>
              )}
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-500/20">
                👁️ {listing.totalViews} views
              </span>
              <Badge status={listing.status === "Active" ? "Active" : "Inactive"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="detail-section" style={{ animationDelay: '0.1s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-dark-border">About this place</h2>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{listing.description}</p>
                </div>

                {listing.amenities?.length > 0 && (
                  <div className="detail-section" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3 pb-1 border-b border-gray-200 dark:border-dark-border">Amenities</h2>
                    <div className="flex flex-wrap gap-2">
                      {listing.amenities.map((amenity, i) => (
                        <span key={i} className="amenity-tag bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium cursor-default" style={{ animationDelay: `${0.25 + i * 0.05}s` }}>
                          ✓ {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {listing.rules && (
                  <div className="detail-section" style={{ animationDelay: '0.3s' }}>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-dark-border">House Rules</h2>
                    <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 rounded-xl p-4">
                      <p className="text-gray-700 dark:text-gray-300">📋 {listing.rules}</p>
                    </div>
                  </div>
                )}

                <div className="detail-section" style={{ animationDelay: '0.4s' }}>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 pb-1 border-b border-gray-200 dark:border-dark-border">Location</h2>
                  <div className="bg-gray-100 dark:bg-dark-elevated rounded-xl h-48 flex items-center justify-center border border-gray-200 dark:border-dark-border">
                    <div className="text-center text-gray-500 dark:text-gray-500">
                      <p className="text-4xl mb-2">🗺️</p>
                      <p className="font-medium text-gray-600 dark:text-gray-400">{listing.address}</p>
                      <p className="text-sm mt-1">{listing.city.charAt(0).toUpperCase() + listing.city.slice(1)}</p>
                    </div>
                  </div>
                </div>

                <ReviewsSection listingId={id} />
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-xl p-4">
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-3">Owner Details</h2>
                  {isAuthenticated ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {listing.owner?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white text-sm">{listing.owner?.name}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">Property Owner</p>
                        </div>
                      </div>
                      <div className="space-y-1 pt-2 border-t border-gray-200 dark:border-dark-border">
                        <p className="text-gray-600 dark:text-gray-400 text-sm">✉️ {listing.owner?.email}</p>
                        {listing.owner?.phone && <p className="text-gray-600 dark:text-gray-400 text-sm">📞 {listing.owner.phone}</p>}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-4xl mb-2">🔒</p>
                      <p className="text-gray-500 dark:text-gray-500 text-sm mb-3">Login to view owner details</p>
                      <Button variant="secondary" onClick={() => navigate("/login")} className="w-full" size="sm">Login to View</Button>
                    </div>
                  )}
                </div>

                <div className="bg-gray-50 dark:bg-dark-elevated border border-gray-200 dark:border-dark-border rounded-xl p-4 text-center">
                  <p className="text-gray-500 dark:text-gray-500 text-sm mb-3 font-medium">Interested in this place?</p>
                  {isAuthenticated && user?.role === "user" ? (
                    <Button onClick={() => navigate(`/listing/${id}/book`)} className="w-full">📩 Send Booking Request</Button>
                  ) : !isAuthenticated ? (
                    <Button onClick={() => navigate("/login")} className="w-full">Login to Book</Button>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-600 text-sm bg-gray-100 dark:bg-dark-card rounded-lg p-3">Only tenants can send booking requests</p>
                  )}
                </div>

                <button
                  onClick={handleWishlist}
                  disabled={wishLoading}
                  className={`w-full py-3 rounded-xl font-semibold border-2 transition text-sm ${
                    wishlisted
                      ? "border-red-300 dark:border-red-500/30 text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20"
                      : "border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/5 hover:bg-blue-100 dark:hover:bg-blue-500/10"
                  }`}
                >
                  {wishLoading ? "Updating..." : wishlisted ? "❤️ Remove from Wishlist" : "🤍 Save to Wishlist"}
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