import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    moveInDate: "",
    duration: 1,
    message: "",
  });

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await API.get(`/listings/${id}`);
        setListing(data.listing);
      } catch (err) {
        setError("Listing not found");
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

   try {
     await API.post("/bookings", {
       listingId: id,
       ...formData,
     });
     toast.success("Booking request sent successfully!");
     setSuccess(true);
   } catch (err) {
     const msg =
       err.response?.data?.message || "Failed to send booking request";
     setError(msg);
     toast.error(msg);
   } finally {
     setSubmitting(false);
   }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  // Success screen
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">
            Request Sent!
          </h2>
          <p className="text-gray-500 mb-6">
            Your booking request has been sent to the owner. You will be
            notified once they respond.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="flex-1 bg-blue-700 text-white py-3 rounded-lg font-semibold hover:bg-blue-800 transition"
            >
              View My Requests
            </button>
            <button
              onClick={() => navigate("/search")}
              className="flex-1 border border-blue-700 text-blue-700 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Browse More
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-700 hover:underline font-medium"
        >
          ← Back to listing
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Listing summary card */}
          {listing && (
            <div className="bg-blue-800 text-white p-6">
              <p className="text-blue-200 text-sm mb-1">Booking request for</p>
              <h2 className="text-xl font-bold mb-1">{listing.title}</h2>
              <p className="text-blue-200 text-sm">
                📍 {listing.address}, {listing.city}
              </p>
              <p className="text-2xl font-bold mt-2">
                ₹{listing.rent.toLocaleString()}
                <span className="text-blue-200 text-sm font-normal">
                  {" "}
                  /month
                </span>
              </p>
            </div>
          )}

          {/* Booking form */}
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-6">
              Fill in your details
            </h3>

            {/* Error */}
            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Move-in date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Move-in Date
                </label>
                <input
                  type="date"
                  name="moveInDate"
                  value={formData.moveInDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Stay Duration (months)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                    <option key={m} value={m}>
                      {m} {m === 1 ? "month" : "months"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message to Owner{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Hi, I am interested in your PG. I am a working professional looking for a safe and clean accommodation..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Summary box */}
              {listing && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm space-y-2">
                  <h4 className="font-semibold text-gray-800 mb-2">
                    Booking Summary
                  </h4>
                  <div className="flex justify-between text-gray-600">
                    <span>Monthly Rent</span>
                    <span className="font-medium">
                      ₹{listing.rent.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Duration</span>
                    <span className="font-medium">
                      {formData.duration} month(s)
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 border-t border-blue-200 pt-2 mt-2">
                    <span className="font-semibold text-gray-800">
                      Estimated Total
                    </span>
                    <span className="font-bold text-blue-800">
                      ₹{(listing.rent * formData.duration).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {submitting ? "Sending Request..." : "📩 Send Booking Request"}
              </button>

              <p className="text-center text-gray-400 text-xs">
                Sending a request does not guarantee a booking. The owner will
                review and respond to your request.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
