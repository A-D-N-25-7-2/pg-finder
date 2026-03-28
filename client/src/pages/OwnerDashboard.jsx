import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

const OwnerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("listings");

  // Listings state
  const [listings, setListings] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);

  // ── Fetch owner listings ───────────────────────────────────
  const fetchListings = async () => {
    setListLoading(true);
    try {
      const { data } = await API.get("/listings/owner/my-listings");
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  // ── Fetch owner bookings ───────────────────────────────────
  const fetchBookings = async () => {
    setBookLoading(true);
    try {
      const { data } = await API.get("/bookings/owner-requests");
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setBookLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "listings") fetchListings();
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab]);

  // ── Delete listing ─────────────────────────────────────────
  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try {
      await API.delete(`/listings/${id}`);
      setListings(listings.filter((l) => l._id !== id));
    } catch (err) {
      alert("Failed to delete listing");
    }
  };

  // ── Toggle listing status ──────────────────────────────────
  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try {
      await API.put(`/listings/${id}/status`, { status: newStatus });
      setListings(
        listings.map((l) => (l._id === id ? { ...l, status: newStatus } : l)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status");
    }
  };

  // ── Approve booking ────────────────────────────────────────
  const approveBooking = async (id) => {
    try {
      await API.put(`/bookings/${id}/approve`, {
        ownerResponse:
          "Your booking has been approved! Please contact me to confirm.",
      });
      setBookings(
        bookings.map((b) => (b._id === id ? { ...b, status: "Approved" } : b)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  // ── Reject booking ─────────────────────────────────────────
  const rejectBooking = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    try {
      await API.put(`/bookings/${id}/reject`, {
        ownerResponse: reason || "Sorry, your request has been rejected.",
      });
      setBookings(
        bookings.map((b) => (b._id === id ? { ...b, status: "Rejected" } : b)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  const statusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100  text-green-700";
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Rejected":
        return "bg-red-100    text-red-700";
      case "Inactive":
        return "bg-gray-100   text-gray-600";
      case "Approved":
        return "bg-green-100  text-green-700";
      case "Cancelled":
        return "bg-gray-100   text-gray-600";
      default:
        return "bg-gray-100   text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-blue-800 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Owner Dashboard</h1>
          <p className="text-blue-300 text-sm">Welcome back, {user?.name}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/search")}
            className="border border-blue-300 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Browse Site
          </button>
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-blue-800">
              {listings.length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Total Listings</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-green-600">
              {listings.filter((l) => l.status === "Active").length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Active Listings</p>
          </div>
          <div className="bg-white rounded-xl shadow p-4 text-center">
            <p className="text-3xl font-bold text-orange-500">
              {bookings.filter((b) => b.status === "Pending").length}
            </p>
            <p className="text-gray-500 text-sm mt-1">Pending Requests</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["listings", "bookings"].map((tab) => (
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
              {tab === "bookings" &&
                bookings.filter((b) => b.status === "Pending").length > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {bookings.filter((b) => b.status === "Pending").length}
                  </span>
                )}
            </button>
          ))}
        </div>

        {/* ── LISTINGS TAB ──────────────────────────────────── */}
        {activeTab === "listings" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">My Listings</h2>
              <button
                onClick={() => alert("Add listing form — coming soon!")}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600 transition text-sm"
              >
                + Add New Listing
              </button>
            </div>

            {listLoading ? (
              <div className="text-center py-20 text-gray-400">
                Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">🏠</p>
                <p className="text-lg">No listings yet.</p>
                <p className="text-sm mt-1">
                  Create your first listing to get started!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {listings.map((listing) => (
                  <div
                    key={listing._id}
                    className="bg-white rounded-xl shadow p-4 hover:shadow-md transition"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-20 bg-blue-100 rounded-lg overflow-hidden shrink-0">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">
                            🏠
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-gray-800">
                              {listing.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              📍 {listing.city} • ₹
                              {listing.rent?.toLocaleString()}/mo •{" "}
                              {listing.type}
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              👁️ {listing.totalViews} views • ⭐{" "}
                              {listing.averageRating || 0} rating
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusColor(listing.status)}`}
                          >
                            {listing.status}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3 flex-wrap">
                          <button
                            onClick={() => navigate(`/listing/${listing._id}`)}
                            className="border border-blue-500 text-blue-600 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-blue-50 transition"
                          >
                            👁️ View
                          </button>
                          {(listing.status === "Active" ||
                            listing.status === "Inactive") && (
                            <button
                              onClick={() =>
                                toggleStatus(listing._id, listing.status)
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                                listing.status === "Active"
                                  ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              }`}
                            >
                              {listing.status === "Active"
                                ? "⏸️ Deactivate"
                                : "▶️ Activate"}
                            </button>
                          )}
                          {listing.status === "Pending" && (
                            <span className="text-yellow-600 text-xs px-3 py-1 bg-yellow-50 rounded-lg">
                              ⏳ Awaiting admin approval
                            </span>
                          )}
                          <button
                            onClick={() => deleteListing(listing._id)}
                            className="border border-red-400 text-red-500 px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-50 transition"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ──────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              Booking Requests
            </h2>

            {bookLoading ? (
              <div className="text-center py-20 text-gray-400">
                Loading requests...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-5xl mb-4">📋</p>
                <p>No booking requests yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl shadow p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {booking.listing?.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          📍 {booking.listing?.city} • ₹
                          {booking.listing?.rent?.toLocaleString()}/mo
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusColor(booking.status)}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    {/* Tenant info */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-3">
                      <p className="font-semibold text-gray-800 text-sm">
                        👤 {booking.tenant?.name}
                      </p>
                      <p className="text-gray-500 text-xs">
                        ✉️ {booking.tenant?.email}
                      </p>
                      {booking.tenant?.phone && (
                        <p className="text-gray-500 text-xs">
                          📞 {booking.tenant.phone}
                        </p>
                      )}
                      <p className="text-gray-500 text-xs mt-1">
                        📅 Move-in:{" "}
                        {new Date(booking.moveInDate).toLocaleDateString(
                          "en-IN",
                        )}{" "}
                        • {booking.duration} month(s)
                      </p>
                    </div>

                    {/* Tenant message */}
                    {booking.message && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-3">
                        <p className="text-gray-600 text-sm italic">
                          "{booking.message}"
                        </p>
                      </div>
                    )}

                    {/* Owner response */}
                    {booking.ownerResponse && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                        <p className="text-green-700 text-sm">
                          Your response: {booking.ownerResponse}
                        </p>
                      </div>
                    )}

                    {/* Action buttons */}
                    {booking.status === "Pending" && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => approveBooking(booking._id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                        >
                          ✅ Approve
                        </button>
                        <button
                          onClick={() => rejectBooking(booking._id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                        >
                          ❌ Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard