import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const [listings, setListings] = useState([]);
  const [listFilter, setListFilter] = useState("Pending");
  const [listLoading, setListLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);

  const [bookings, setBookings] = useState([]);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try { const { data } = await API.get("/admin/dashboard"); setStats(data.stats); }
      catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
  }, []);

  const fetchListings = async (status = "Pending") => {
    setListLoading(true);
    try { const { data } = await API.get(`/admin/listings?status=${status}&limit=50`); setListings(data.listings); }
    catch (err) { console.error(err); }
    finally { setListLoading(false); }
  };

  const fetchUsers = async () => {
    setUserLoading(true);
    try { const { data } = await API.get("/admin/users?limit=100"); setUsers(data.users); }
    catch (err) { console.error(err); }
    finally { setUserLoading(false); }
  };

  const fetchBookings = async () => {
    setBookingLoading(true);
    try { const { data } = await API.get("/admin/bookings?limit=50"); setBookings(data.bookings); }
    catch (err) { console.error(err); }
    finally { setBookingLoading(false); }
  };

  const fetchReviews = async () => {
    setReviewLoading(true);
    try {
      const { data } = await API.get("/admin/dashboard");
      setReviews([]);
    } catch (err) { console.error(err); }
    finally { setReviewLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "listings") fetchListings(listFilter);
    if (activeTab === "users") fetchUsers();
    if (activeTab === "bookings") fetchBookings();
    if (activeTab === "reviews") fetchReviews();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "listings") fetchListings(listFilter);
  }, [listFilter]);

  const approveListing = async (id) => {
    try {
      await API.put(`/admin/listings/${id}/approve`);
      setListings(listings.map(l => l._id === id ? { ...l, status: "Active" } : l));
      toast.success("Listing approved");
      const { data } = await API.get("/admin/dashboard");
      setStats(data.stats);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to approve"); }
  };

  const rejectListing = async (id) => {
    try {
      await API.put(`/admin/listings/${id}/reject`);
      setListings(listings.map(l => l._id === id ? { ...l, status: "Rejected" } : l));
      toast.success("Listing rejected");
    } catch (err) { toast.error(err.response?.data?.message || "Failed to reject"); }
  };

  const deleteListing = async (id) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    try { await API.delete(`/admin/listings/${id}`); setListings(listings.filter(l => l._id !== id)); toast.success("Listing deleted"); }
    catch { toast.error("Failed to delete"); }
  };

  const suspendUser = async (id) => {
    if (!window.confirm("Suspend this user?")) return;
    try { await API.put(`/admin/users/${id}/suspend`); setUsers(users.map(u => u._id === id ? { ...u, isActive: false } : u)); toast.success("User suspended"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to suspend"); }
  };

  const activateUser = async (id) => {
    try { await API.put(`/admin/users/${id}/activate`); setUsers(users.map(u => u._id === id ? { ...u, isActive: true } : u)); toast.success("User activated"); }
    catch { toast.error("Failed to activate"); }
  };

  const deleteUser = async (id, name) => {
    if (!window.confirm(`⚠️ Permanently delete "${name}" and ALL their data (listings, bookings, reviews)?\n\nThis action cannot be undone.`)) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      toast.success("User deleted permanently");
      // Refresh stats
      const { data } = await API.get("/admin/dashboard");
      setStats(data.stats);
    } catch (err) { toast.error(err.response?.data?.message || "Failed to delete user"); }
  };

  const tabs = [
    { key: "dashboard", label: "Overview", icon: "📊" },
    { key: "listings", label: "Listings", icon: "🏠", count: stats?.pendingListings },
    { key: "users", label: "Users", icon: "👥" },
    { key: "bookings", label: "Bookings", icon: "📅" },
  ];

  return (
    <DashboardLayout title="Admin Panel" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>

      {/* ── Overview ──────────────────────────────────────── */}
      {activeTab === "dashboard" && (
        <div>
          {loading ? <Spinner className="py-20" /> : (
            <>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Platform Overview</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Users" value={stats?.totalUsers} icon="👤" color="blue" />
                <StatCard label="Total Owners" value={stats?.totalOwners} icon="🏠" color="purple" />
                <StatCard label="Total Listings" value={stats?.totalListings} icon="📋" color="green" />
                <StatCard label="Total Bookings" value={stats?.totalBookings} icon="📅" color="orange" />
                <StatCard label="Active Listings" value={stats?.activeListings} icon="✅" color="green" />
                <StatCard label="Pending Listings" value={stats?.pendingListings} icon="⏳" color="orange" />
                <StatCard label="Total Reviews" value={stats?.totalReviews} icon="⭐" color="pink" />
                <StatCard label="Approved Bookings" value={stats?.approvedBookings} icon="🎉" color="cyan" />
              </div>
              <Card className="p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                <div className="flex gap-3 flex-wrap">
                  <Button variant="warning" size="sm" onClick={() => { setActiveTab("listings"); setListFilter("Pending"); }}>
                    ⏳ Review Pending ({stats?.pendingListings})
                  </Button>
                  <Button size="sm" onClick={() => setActiveTab("users")}>👥 Manage Users</Button>
                  <Button variant="success" size="sm" onClick={() => setActiveTab("bookings")}>📅 View Bookings</Button>
                </div>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Listings ─────────────────────────────────────── */}
      {activeTab === "listings" && (
        <div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Listings</h2>
            <div className="flex gap-2 flex-wrap">
              {["Pending", "Active", "Rejected", "Inactive"].map(s => (
                <button key={s} onClick={() => setListFilter(s)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                    listFilter === s ? "gradient-primary text-white" : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}>{s}</button>
              ))}
            </div>
          </div>

          {listLoading ? <Spinner className="py-12" /> : listings.length === 0 ? (
            <EmptyState icon="📋" title={`No ${listFilter} listings`} />
          ) : (
            <div className="space-y-3">
              {listings.map(listing => (
                <Card key={listing._id} className="p-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-20 bg-gray-100 dark:bg-dark-elevated rounded-lg overflow-hidden shrink-0">
                      {listing.images?.[0] ? <img src={listing.images[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate" onClick={() => navigate(`/listing/${listing._id}`)}>{listing.title}</h3>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">📍 {listing.address}, {listing.city}</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">👤 Owner: {listing.owner?.name} ({listing.owner?.email})</p>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">💰 ₹{listing.rent?.toLocaleString()}/mo • {listing.type} • {listing.gender}</p>
                        </div>
                        <Badge status={listing.status} />
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        {listing.status === "Pending" && (
                          <>
                            <Button size="sm" variant="success" onClick={() => approveListing(listing._id)}>✅ Approve</Button>
                            <Button size="sm" variant="danger" onClick={() => rejectListing(listing._id)}>❌ Reject</Button>
                          </>
                        )}
                        {listing.status === "Rejected" && <Button size="sm" variant="success" onClick={() => approveListing(listing._id)}>✅ Approve</Button>}
                        {listing.status === "Active" && <Button size="sm" variant="warning" onClick={() => rejectListing(listing._id)}>🚫 Deactivate</Button>}
                        <Button size="sm" variant="danger" onClick={() => deleteListing(listing._id)}>🗑️ Delete</Button>
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/listing/${listing._id}`)}>👁️ View</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Users ────────────────────────────────────────── */}
      {activeTab === "users" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Manage Users</h2>
          {userLoading ? <Spinner className="py-12" /> : (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-dark-border">
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Name</th>
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Email</th>
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Role</th>
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Joined</th>
                      <th className="px-4 py-3 text-left text-gray-500 dark:text-gray-400 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, i) => (
                      <tr key={u._id} className={`border-b border-gray-100 dark:border-dark-border/50 ${i % 2 === 0 ? "bg-white dark:bg-dark-card" : "bg-gray-50 dark:bg-dark-base/30"}`}>
                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{u.name}</td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-500">{u.email}</td>
                        <td className="px-4 py-3"><Badge status={u.role} /></td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${u.isActive ? "bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-400"}`}>
                            {u.isActive ? "Active" : "Suspended"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 dark:text-gray-500">{new Date(u.createdAt).toLocaleDateString("en-IN")}</td>
                        <td className="px-4 py-3">
                          {u.role !== "admin" && (
                            <div className="flex gap-2 flex-wrap">
                              {u.isActive
                                ? <Button size="sm" variant="warning" onClick={() => suspendUser(u._id)}>Suspend</Button>
                                : <Button size="sm" variant="success" onClick={() => activateUser(u._id)}>Activate</Button>
                              }
                              <Button size="sm" variant="danger" onClick={() => deleteUser(u._id, u.name)}>🗑️ Delete</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ── Bookings ─────────────────────────────────────── */}
      {activeTab === "bookings" && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">All Bookings</h2>
          {bookingLoading ? <Spinner className="py-12" /> : bookings.length === 0 ? (
            <EmptyState icon="📅" title="No bookings found" />
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <Card key={booking._id} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{booking.listing?.title}</h3>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">📍 {booking.listing?.city} — ₹{booking.listing?.rent?.toLocaleString()}/mo</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">👤 Tenant: {booking.tenant?.name} ({booking.tenant?.email})</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">🏠 Owner: {booking.owner?.name} ({booking.owner?.email})</p>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">📅 Move-in: {new Date(booking.moveInDate).toLocaleDateString("en-IN")} • {booking.duration} month(s)</p>
                    </div>
                    <Badge status={booking.status} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default AdminDashboard;
