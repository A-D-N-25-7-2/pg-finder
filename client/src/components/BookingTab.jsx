import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
const BookingTab = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const { data } = await API.get("/bookings/my-requests");
        setBookings(data.bookings);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
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

  const statusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Approved":
        return "bg-green-100  text-green-700";
      case "Rejected":
        return "bg-red-100    text-red-700";
      case "Cancelled":
        return "bg-gray-100   text-gray-600";
      default:
        return "bg-gray-100   text-gray-600";
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-gray-400">Loading bookings...</div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-5xl mb-4">📋</p>
        <p className="text-lg">No booking requests yet.</p>
        <button
          onClick={() => navigate("/search")}
          className="mt-4 bg-blue-700 text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
        >
          Browse Listings
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div
          key={booking._id}
          className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition"
        >
          <div className="flex gap-4">
            {/* Listing image */}
            <div className="w-24 h-20 bg-blue-100 rounded-lg overflow-hidden shrink-0">
              {booking.listing?.images?.[0] ? (
                <img
                  src={booking.listing.images[0]}
                  alt={booking.listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🏠
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h3
                  className="font-bold text-gray-800 cursor-pointer hover:text-blue-700"
                  onClick={() => navigate(`/listing/${booking.listing?._id}`)}
                >
                  {booking.listing?.title}
                </h3>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${statusColor(booking.status)}`}
                >
                  {booking.status}
                </span>
              </div>
              <p className="text-gray-500 text-sm">
                📍 {booking.listing?.city} • ₹
                {booking.listing?.rent?.toLocaleString()}/mo
              </p>
              <p className="text-gray-500 text-sm">
                📅 Move-in: {new Date(booking.moveInDate).toLocaleDateString()}{" "}
                • {booking.duration} month(s)
              </p>

              {/* Owner response */}
              {booking.ownerResponse && (
                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600">
                  💬 Owner: {booking.ownerResponse}
                </div>
              )}

              {/* Cancel button */}
              {booking.status === "Pending" && (
                <button
                  onClick={() => cancelBooking(booking._id)}
                  className="mt-2 text-sm text-red-500 border border-red-400 px-3 py-1 rounded-lg hover:bg-red-50 transition"
                >
                  Cancel Request
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BookingTab;
