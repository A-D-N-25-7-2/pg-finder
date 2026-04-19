import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Modal from "../components/ui/Modal";
import StatCard from "../components/ui/StatCard";
import EmptyState from "../components/ui/EmptyState";
import Spinner from "../components/ui/Spinner";
import ImageUploader from "../components/ImageUploader";

const OwnerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  const [listings, setListings] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [bookLoading, setBookLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newListing, setNewListing] = useState({
    title: "", description: "", address: "", city: "", rent: "",
    type: "PG", gender: "Any", amenities: "", rules: "",
  });

  // Images to upload with new listing (optional)
  const [newListingImages, setNewListingImages] = useState([]);
  const newListingFileRef = useRef(null);

  // Image modal state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  const fetchListings = async () => {
    setListLoading(true);
    try { const { data } = await API.get("/listings/owner/my-listings"); setListings(data.listings); }
    catch (err) { console.error(err); }
    finally { setListLoading(false); }
  };

  const fetchBookings = async () => {
    setBookLoading(true);
    try { const { data } = await API.get("/bookings/owner-requests"); setBookings(data.bookings); }
    catch (err) { console.error(err); }
    finally { setBookLoading(false); }
  };

  useEffect(() => {
    if (activeTab === "listings") fetchListings();
    if (activeTab === "bookings") fetchBookings();
  }, [activeTab]);

  const deleteListing = async (id) => {
    if (!window.confirm("Delete this listing permanently?")) return;
    try { await API.delete(`/listings/${id}`); setListings(listings.filter(l => l._id !== id)); toast.success("Listing deleted"); }
    catch { toast.error("Failed to delete listing"); }
  };

  const toggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Inactive" : "Active";
    try { await API.put(`/listings/${id}/status`, { status: newStatus }); setListings(listings.map(l => l._id === id ? { ...l, status: newStatus } : l)); toast.success(`Listing ${newStatus === "Active" ? "activated" : "deactivated"}`); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to update status"); }
  };

  const approveBooking = async (id) => {
    try { await API.put(`/bookings/${id}/approve`, { ownerResponse: "Your booking has been approved! Please contact me to confirm." }); setBookings(bookings.map(b => b._id === id ? { ...b, status: "Approved" } : b)); toast.success("Booking approved"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to approve"); }
  };

  const rejectBooking = async (id) => {
    const reason = window.prompt("Enter rejection reason (optional):");
    try { await API.put(`/bookings/${id}/reject`, { ownerResponse: reason || "Sorry, your request has been rejected." }); setBookings(bookings.map(b => b._id === id ? { ...b, status: "Rejected" } : b)); toast.success("Booking rejected"); }
    catch (err) { toast.error(err.response?.data?.message || "Failed to reject"); }
  };

  // ── Handle new listing image selection (before creation) ──
  const handleNewListingImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const invalidFiles = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (invalidFiles.length > 0) {
      toast.error(`${invalidFiles.length} file(s) exceed 5MB limit.`);
      return;
    }

    if (newListingImages.length + files.length > 10) {
      toast.error(`Maximum 10 images allowed. Currently ${newListingImages.length} selected.`);
      return;
    }

    setNewListingImages((prev) => [...prev, ...files]);
    if (newListingFileRef.current) newListingFileRef.current.value = "";
  };

  const removeNewListingImage = (index) => {
    setNewListingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ── Create listing (optionally with images) ──
  const handleAddListing = async (e) => {
    e.preventDefault();
    setAddLoading(true);
    try {
      const payload = {
        ...newListing,
        rent: Number(newListing.rent),
        amenities: newListing.amenities.split(",").map(a => a.trim()).filter(Boolean),
      };
      const { data } = await API.post("/listings", payload);
      const createdListing = data.listing;

      // If images were selected, upload them to the newly created listing
      if (newListingImages.length > 0) {
        const formData = new FormData();
        newListingImages.forEach((file) => formData.append("images", file));
        try {
          await API.post(`/listings/${createdListing._id}/images`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } catch (imgErr) {
          console.error("Image upload failed:", imgErr);
          toast.error("Listing created but image upload failed. You can add images later.");
        }
      }

      toast.success("Listing created! Pending admin approval.");
      setShowAddModal(false);
      setNewListing({ title: "", description: "", address: "", city: "", rent: "", type: "PG", gender: "Any", amenities: "", rules: "" });
      setNewListingImages([]);
      fetchListings();
    } catch (err) { toast.error(err.response?.data?.message || "Failed to create listing"); }
    finally { setAddLoading(false); }
  };

  const handleImagesUpdate = (newImages) => {
    setListings(listings.map(l =>
      l._id === selectedListing._id ? { ...l, images: newImages } : l
    ));
    setSelectedListing(prev => ({ ...prev, images: newImages }));
  };

  const openImageModal = (listing) => {
    setSelectedListing(listing);
    setImageModalOpen(true);
  };

  const pendingCount = bookings.filter(b => b.status === "Pending").length;
  const tabs = [
    { key: "profile", label: "Profile", icon: "👤" },
    { key: "listings", label: "Listings", icon: "🏠" },
    { key: "bookings", label: "Bookings", icon: "📋", count: pendingCount },
  ];

  return (
    <DashboardLayout title="Owner Dashboard" tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab}>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard label="Total Listings" value={listings.length} icon="🏠" color="blue" />
        <StatCard label="Active" value={listings.filter(l => l.status === "Active").length} icon="✅" color="green" />
        <StatCard label="Pending Requests" value={pendingCount} icon="⏳" color="orange" />
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Profile Tab                                           */}
      {/* ═══════════════════════════════════════════════════════ */}
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
              <div><p className="text-gray-500 dark:text-gray-500">Role</p><p className="font-medium text-gray-700 dark:text-gray-300 capitalize">{user?.role}</p></div>
            </div>
          </div>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Listings Tab                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "listings" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Listings</h2>
            <Button onClick={() => setShowAddModal(true)}>+ Add New Listing</Button>
          </div>

          {listLoading ? <Spinner className="py-12" /> : listings.length === 0 ? (
            <EmptyState icon="🏠" title="No listings yet" description="Create your first listing to get started!" actionLabel="Add Listing" onAction={() => setShowAddModal(true)} />
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
                          <h3 className="font-bold text-gray-900 dark:text-white text-sm truncate">{listing.title}</h3>
                          <p className="text-gray-500 dark:text-gray-500 text-xs">📍 {listing.city} • ₹{listing.rent?.toLocaleString()}/mo • {listing.type}</p>
                          <p className="text-gray-400 dark:text-gray-600 text-xs mt-1">👁️ {listing.totalViews} views • ⭐ {listing.averageRating || 0}</p>
                        </div>
                        <Badge status={listing.status} />
                      </div>
                      <div className="flex gap-2 mt-3 flex-wrap">
                        <Button size="sm" variant="secondary" onClick={() => navigate(`/listing/${listing._id}`)}>👁️ View</Button>
                        <button
                          onClick={() => openImageModal(listing)}
                          className="border border-purple-300 dark:border-purple-400 text-purple-600 dark:text-purple-400 px-3 py-1 rounded-lg text-xs font-medium hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors"
                        >
                          📷 Manage Images
                        </button>
                        {(listing.status === "Active" || listing.status === "Inactive") && (
                          <Button size="sm" variant={listing.status === "Active" ? "warning" : "success"} onClick={() => toggleStatus(listing._id, listing.status)}>
                            {listing.status === "Active" ? "⏸️ Deactivate" : "▶️ Activate"}
                          </Button>
                        )}
                        {listing.status === "Pending" && <Badge status="Pending" className="self-center" />}
                        <Button size="sm" variant="danger" onClick={() => deleteListing(listing._id)}>🗑️ Delete</Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Bookings Tab                                          */}
      {/* ═══════════════════════════════════════════════════════ */}
      {activeTab === "bookings" && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Booking Requests</h2>
          {bookLoading ? <Spinner className="py-12" /> : bookings.length === 0 ? (
            <EmptyState icon="📋" title="No booking requests" description="Requests from tenants will appear here." />
          ) : (
            <div className="space-y-3">
              {bookings.map(booking => (
                <Card key={booking._id} className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm">{booking.listing?.title}</h3>
                      <p className="text-gray-500 dark:text-gray-500 text-xs">📍 {booking.listing?.city} • ₹{booking.listing?.rent?.toLocaleString()}/mo</p>
                    </div>
                    <Badge status={booking.status} />
                  </div>
                  <div className="bg-gray-50 dark:bg-dark-elevated rounded-lg p-3 mb-3 border border-gray-200 dark:border-dark-border">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">👤 {booking.tenant?.name}</p>
                    <p className="text-gray-500 dark:text-gray-500 text-xs">✉️ {booking.tenant?.email}</p>
                    {booking.tenant?.phone && <p className="text-gray-500 dark:text-gray-500 text-xs">📞 {booking.tenant.phone}</p>}
                    <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">📅 Move-in: {new Date(booking.moveInDate).toLocaleDateString("en-IN")} • {booking.duration} month(s)</p>
                  </div>
                  {booking.message && (
                    <div className="bg-gray-100 dark:bg-dark-base rounded-lg p-3 mb-3 border border-gray-200 dark:border-dark-border">
                      <p className="text-gray-500 dark:text-gray-400 text-sm italic">"{booking.message}"</p>
                    </div>
                  )}
                  {booking.ownerResponse && (
                    <div className="bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/10 rounded-lg p-3 mb-3">
                      <p className="text-emerald-600 dark:text-emerald-400 text-sm">Your response: {booking.ownerResponse}</p>
                    </div>
                  )}
                  {booking.status === "Pending" && (
                    <div className="flex gap-3">
                      <Button variant="success" size="sm" className="flex-1" onClick={() => approveBooking(booking._id)}>✅ Approve</Button>
                      <Button variant="danger" size="sm" className="flex-1" onClick={() => rejectBooking(booking._id)}>❌ Reject</Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Add Listing Modal                                     */}
      {/* ═══════════════════════════════════════════════════════ */}
      <Modal isOpen={showAddModal} onClose={() => { setShowAddModal(false); setNewListingImages([]); }} title="Add New Listing" size="lg">
        <form onSubmit={handleAddListing} className="space-y-4">
          <Input label="Title" value={newListing.title} onChange={e => setNewListing({ ...newListing, title: e.target.value })} placeholder="e.g. Sunny PG near Metro Station" required />
          <Input label="Description" type="textarea" rows={3} value={newListing.description} onChange={e => setNewListing({ ...newListing, description: e.target.value })} placeholder="Describe your PG/Hostel..." required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Address" value={newListing.address} onChange={e => setNewListing({ ...newListing, address: e.target.value })} placeholder="Street address" required />
            <Input label="City" value={newListing.city} onChange={e => setNewListing({ ...newListing, city: e.target.value })} placeholder="e.g. Bangalore" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Rent (₹/month)" type="number" value={newListing.rent} onChange={e => setNewListing({ ...newListing, rent: e.target.value })} placeholder="5000" required />
            <Input label="Type" type="select" value={newListing.type} onChange={e => setNewListing({ ...newListing, type: e.target.value })}>
              <option value="PG">PG</option>
              <option value="Hostel">Hostel</option>
            </Input>
            <Input label="Gender" type="select" value={newListing.gender} onChange={e => setNewListing({ ...newListing, gender: e.target.value })}>
              <option value="Any">Any</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </Input>
          </div>
          <Input label="Amenities (comma separated)" value={newListing.amenities} onChange={e => setNewListing({ ...newListing, amenities: e.target.value })} placeholder="WiFi, AC, Laundry, Parking" />
          <Input label="House Rules" type="textarea" rows={2} value={newListing.rules} onChange={e => setNewListing({ ...newListing, rules: e.target.value })} placeholder="No smoking, no pets..." />

          {/* ── Image upload section (optional) ── */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Images <span className="text-gray-400 dark:text-gray-600 font-normal">(optional — you can add later too)</span>
            </label>

            <div className="flex flex-wrap gap-2 mb-2">
              {newListingImages.map((file, idx) => (
                <div key={idx} className="relative group w-20 h-16 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-elevated">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewListingImage(idx)}
                    className="absolute top-0.5 right-0.5 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ✕
                  </button>
                </div>
              ))}
              {newListingImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => newListingFileRef.current?.click()}
                  className="w-20 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 bg-gray-50 dark:bg-dark-elevated/50 flex flex-col items-center justify-center gap-0.5 transition-all hover:bg-blue-50 dark:hover:bg-blue-500/5"
                >
                  <span className="text-lg text-gray-400 dark:text-gray-500">+</span>
                  <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">Add</span>
                </button>
              )}
            </div>

            <input
              ref={newListingFileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleNewListingImageSelect}
              className="hidden"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500">JPG, PNG, WebP • Max 5MB each • Up to 10 images</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={addLoading} className="flex-1">Create Listing</Button>
            <Button type="button" variant="secondary" onClick={() => { setShowAddModal(false); setNewListingImages([]); }} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* Image Manager Modal                                   */}
      {/* ═══════════════════════════════════════════════════════ */}
      {imageModalOpen && selectedListing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setImageModalOpen(false)}>
          <div
            className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Manage Images</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{selectedListing.title}</p>
              </div>
              <button
                onClick={() => setImageModalOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-dark-elevated text-gray-500 dark:text-gray-400 transition-colors text-lg"
              >
                ✕
              </button>
            </div>

            {/* Image Uploader */}
            <ImageUploader
              listingId={selectedListing._id}
              existingImages={selectedListing.images}
              onUpdate={handleImagesUpdate}
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default OwnerDashboard;