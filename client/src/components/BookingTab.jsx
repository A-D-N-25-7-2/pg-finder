import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";
import Spinner from "./ui/Spinner";

const BookingTab = () => {
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
    try {
      await API.put(`/bookings/${bookingId}/cancel`);
      setBookings(bookings.map(b => b._id === bookingId ? { ...b, status: "Cancelled" } : b));
    } catch (err) { alert(err.response?.data?.message || "Failed to cancel"); }
  };

  if (loading) return <Spinner className="py-12" />;
  if (bookings.length === 0) return <EmptyState icon="📋" title="No bookings yet" description="Browse listings and send booking requests." actionLabel="Browse Listings" onAction={() => navigate("/search")} />;

  return (
    <div className="space-y-3">
      {bookings.map(booking => (
        <Card key={booking._id} className="p-4">
          <div className="flex gap-4">
            <div className="w-24 h-20 bg-dark-elevated rounded-lg overflow-hidden shrink-0">
              {booking.listing?.images?.[0] ? (
                <img src={booking.listing.images[0]} alt="" className="w-full h-full object-cover" />
              ) : <div className="w-full h-full flex items-center justify-center text-2xl">🏠</div>}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white text-sm cursor-pointer hover:text-blue-400 transition-colors truncate" onClick={() => navigate(`/listing/${booking.listing?._id}`)}>
                  {booking.listing?.title}
                </h3>
                <Badge status={booking.status} />
              </div>
              <p className="text-gray-500 text-sm">📍 {booking.listing?.city} • ₹{booking.listing?.rent?.toLocaleString()}/mo</p>
              <p className="text-gray-500 text-sm">📅 Move-in: {new Date(booking.moveInDate).toLocaleDateString()} • {booking.duration} month(s)</p>
              {booking.ownerResponse && (
                <div className="mt-2 bg-dark-elevated border border-dark-border rounded-lg px-3 py-2 text-sm text-gray-400">
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

export default BookingTab;
