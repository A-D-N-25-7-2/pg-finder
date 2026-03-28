import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

// ── Stat Card Component ───────────────────────────────────────
const StatCard = ({ label, value, color, icon }) => (
  <div className={`bg-white rounded-2xl shadow p-5 border-l-4 ${color}`}>
    <div className="flex justify-between items-center">
      <div>
        <p className="text-gray-500 text-sm">{label}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

// ── Admin Dashboard ───────────────────────────────────────────
const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listings state
  const [listings, setListings] = useState([]);
  const [listFilter, setListFilter] = useState("Pending");
  const [listLoading, setListLoading] = useState(false);

  // Users state
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  // ── Fetch dashboard stats ──────────────────────────────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/dashboard");
        setStats(data.stats);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // ── Fetch listings ─────────────────────────────────────────
  const fetchListings = async (status = "Pending") => {
    setListLoading(true);
    try {
      const { data } = await API.get(
        `/admin/listings?status=${status}&limit=20`,
      );
      setListings(data.listings);
    } catch (err) {
      console.error(err);
    } finally {
      setListLoading(false);
    }
  };

  // ── Fetch users ────────────────────────────────────────────
  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const { data } = await API.get("/admin/users?limit=50");
      setUsers(data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setUserLoading(false);
    }
  };

  // ── Fetch bookings ─────────────────────────────────────────
  const fetchBookings = async () => {
    setBookingLoading(true);
    try {
      const { data } = await API.get("/admin/bookings?limit=20");
      setBookings(data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  // Load data when tab changes
  useEffect(() => {
    if (activeTab === "listings") fetchListings(listFilter);
    if (activeTab === "users") fetchUsers();
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "listings") fetchListings(listFilter);
  }, [listFilter]);

  // ── Approve listing ────────────────────────────────────────
  const approveListing = async (id) => {
    try {
      await API.put(`/admin/listings/${id}/approve`);
      setListings(
        listings.map((l) => (l._id === id ? { ...l, status: "Active" } : l)),
      );
      // Refresh stats
      const { data } = await API.get("/admin/dashboard");
      setStats(data.stats);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to approve");
    }
  };

  // ── Reject listing ─────────────────────────────────────────
  const rejectListing = async (id) => {
    try {
      await API.put(`/admin/listings/${id}/reject`);
      setListings(
        listings.map((l) => (l._id === id ? { ...l, status: "Rejected" } : l)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    }
  };

  // ── Delete listing ─────────────────────────────────────────
  const deleteListing = async (id) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    try {
      await API.delete(`/admin/listings/${id}`);
      setListings(listings.filter((l) => l._id !== id));
    } catch (err) {
      alert("Failed to delete listing");
    }
  };

  // ── Suspend user ───────────────────────────────────────────
  const suspendUser = async (id) => {
    if (!window.confirm("Suspend this user?")) return;
    try {
      await API.put(`/admin/users/${id}/suspend`);
      setUsers(
        users.map((u) => (u._id === id ? { ...u, isActive: false } : u)),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to suspend");
    }
  };

  // ── Activate user ──────────────────────────────────────────
  const activateUser = async (id) => {
    try {
      await API.put(`/admin/users/${id}/activate`);
      setUsers(users.map((u) => (u._id === id ? { ...u, isActive: true } : u)));
    } catch (err) {
      alert("Failed to activate user");
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
      default:
        return "bg-gray-100   text-gray-600";
    }
  };

  const tabs = ["dashboard", "listings", "users", "bookings"];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top bar */}
      <div className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">PG Finder — Admin Panel</h1>
          <p className="text-blue-300 text-sm">Platform Management Dashboard</p>
        </div>
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

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab buttons */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-full font-semibold capitalize transition ${
                activeTab === tab
                  ? "bg-blue-800 text-white"
                  : "bg-white text-blue-800 border border-blue-800 hover:bg-blue-50"
              }`}
            >
              {tab}
              {/* Badge for pending listings */}
              {tab === "listings" && stats?.pendingListings > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {stats.pendingListings}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD TAB ─────────────────────────────────── */}
        {activeTab === "dashboard" && (
          <div>
            {loading ? (
              <div className="text-center py-20 text-gray-400">
                Loading stats...
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  Platform Overview
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <StatCard
                    label="Total Users"
                    value={stats?.totalUsers}
                    color="border-blue-500"
                    icon="👤"
                  />
                  <StatCard
                    label="Total Owners"
                    value={stats?.totalOwners}
                    color="border-purple-500"
                    icon="🏠"
                  />
                  <StatCard
                    label="Total Listings"
                    value={stats?.totalListings}
                    color="border-green-500"
                    icon="📋"
                  />
                  <StatCard
                    label="Total Bookings"
                    value={stats?.totalBookings}
                    color="border-orange-500"
                    icon="📅"
                  />
                  <StatCard
                    label="Active Listings"
                    value={stats?.activeListings}
                    color="border-green-500"
                    icon="✅"
                  />
                  <StatCard
                    label="Pending Listings"
                    value={stats?.pendingListings}
                    color="border-yellow-500"
                    icon="⏳"
                  />
                  <StatCard
                    label="Total Reviews"
                    value={stats?.totalReviews}
                    color="border-pink-500"
                    icon="⭐"
                  />
                  <StatCard
                    label="Approved Bookings"
                    value={stats?.approvedBookings}
                    color="border-teal-500"
                    icon="🎉"
                  />
                </div>

                {/* Quick actions */}
                <div className="bg-white rounded-2xl shadow p-5">
                  <h3 className="font-bold text-gray-800 mb-3">
                    Quick Actions
                  </h3>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      onClick={() => {
                        setActiveTab("listings");
                        setListFilter("Pending");
                      }}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition"
                    >
                      ⏳ Review Pending Listings ({stats?.pendingListings})
                    </button>
                    <button
                      onClick={() => setActiveTab("users")}
                      className="bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition"
                    >
                      👥 Manage Users
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition"
                    >
                      📅 View All Bookings
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── LISTINGS TAB ──────────────────────────────────── */}
        {activeTab === "listings" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Manage Listings
              </h2>
              {/* Filter buttons */}
              <div className="flex gap-2">
                {["Pending", "Active", "Rejected", "Inactive"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setListFilter(s)}
                    className={`px-3 py-1 rounded-full text-sm font-semibold transition ${
                      listFilter === s
                        ? "bg-blue-700 text-white"
                        : "bg-white text-gray-600 border hover:bg-gray-50"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {listLoading ? (
              <div className="text-center py-20 text-gray-400">
                Loading listings...
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📋</p>
                <p>No {listFilter} listings found</p>
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
                            <h3
                              className="font-bold text-gray-800 cursor-pointer hover:text-blue-700"
                              onClick={() =>
                                navigate(`/listing/${listing._id}`)
                              }
                            >
                              {listing.title}
                            </h3>
                            <p className="text-gray-500 text-sm">
                              📍 {listing.address}, {listing.city}
                            </p>
                            <p className="text-gray-500 text-sm">
                              👤 Owner: {listing.owner?.name} (
                              {listing.owner?.email})
                            </p>
                            <p className="text-gray-500 text-sm">
                              💰 ₹{listing.rent?.toLocaleString()}/mo •{" "}
                              {listing.type} • {listing.gender}
                            </p>
                          </div>
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${statusColor(listing.status)}`}
                          >
                            {listing.status}
                          </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2 mt-3">
                          {listing.status === "Pending" && (
                            <>
                              <button
                                onClick={() => approveListing(listing._id)}
                                className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                              >
                                ✅ Approve
                              </button>
                              <button
                                onClick={() => rejectListing(listing._id)}
                                className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-red-600 transition"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {listing.status === "Rejected" && (
                            <button
                              onClick={() => approveListing(listing._id)}
                              className="bg-green-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-green-600 transition"
                            >
                              ✅ Approve
                            </button>
                          )}
                          {listing.status === "Active" && (
                            <button
                              onClick={() => rejectListing(listing._id)}
                              className="bg-yellow-500 text-white px-4 py-1 rounded-lg text-sm font-semibold hover:bg-yellow-600 transition"
                            >
                              🚫 Deactivate
                            </button>
                          )}
                          <button
                            onClick={() => deleteListing(listing._id)}
                            className="border border-red-400 text-red-500 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-red-50 transition"
                          >
                            🗑️ Delete
                          </button>
                          <button
                            onClick={() => navigate(`/listing/${listing._id}`)}
                            className="border border-blue-400 text-blue-600 px-4 py-1 rounded-lg text-sm font-semibold hover:bg-blue-50 transition"
                          >
                            👁️ View
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

        {/* ── USERS TAB ─────────────────────────────────────── */}
        {activeTab === "users" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Manage Users
            </h2>

            {userLoading ? (
              <div className="text-center py-20 text-gray-400">
                Loading users...
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-blue-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Name</th>
                      <th className="px-4 py-3 text-left">Email</th>
                      <th className="px-4 py-3 text-left">Role</th>
                      <th className="px-4 py-3 text-left">Status</th>
                      <th className="px-4 py-3 text-left">Joined</th>
                      <th className="px-4 py-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr
                        key={u._id}
                        className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {u.name}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${
                              u.role === "admin"
                                ? "bg-purple-100 text-purple-700"
                                : u.role === "owner"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-semibold ${
                              u.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {new Date(u.createdAt).toLocaleDateString("en-IN")}
                        </td>
                        <td className="px-4 py-3">
                          {u.role !== "admin" &&
                            (u.isActive ? (
                              <button
                                onClick={() => suspendUser(u._id)}
                                className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-red-600 transition"
                              >
                                Suspend
                              </button>
                            ) : (
                              <button
                                onClick={() => activateUser(u._id)}
                                className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs hover:bg-green-600 transition"
                              >
                                Activate
                              </button>
                            ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── BOOKINGS TAB ──────────────────────────────────── */}
        {activeTab === "bookings" && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              All Bookings
            </h2>

            {bookingLoading ? (
              <div className="text-center py-20 text-gray-400">
                Loading bookings...
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-5xl mb-4">📅</p>
                <p>No bookings found</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking._id}
                    className="bg-white rounded-xl shadow p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-800">
                          {booking.listing?.title}
                        </h3>
                        <p className="text-gray-500 text-sm">
                          📍 {booking.listing?.city} — ₹
                          {booking.listing?.rent?.toLocaleString()}/mo
                        </p>
                        <p className="text-gray-500 text-sm">
                          👤 Tenant: {booking.tenant?.name} (
                          {booking.tenant?.email})
                        </p>
                        <p className="text-gray-500 text-sm">
                          🏠 Owner: {booking.owner?.name} (
                          {booking.owner?.email})
                        </p>
                        <p className="text-gray-500 text-sm">
                          📅 Move-in:{" "}
                          {new Date(booking.moveInDate).toLocaleDateString(
                            "en-IN",
                          )}{" "}
                          • {booking.duration} month(s)
                        </p>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                          booking.status === "Approved"
                            ? "bg-green-100  text-green-700"
                            : booking.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : booking.status === "Rejected"
                                ? "bg-red-100    text-red-700"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
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

export default AdminDashboard;
