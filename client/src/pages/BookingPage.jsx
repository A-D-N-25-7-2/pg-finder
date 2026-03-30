import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import toast from "react-hot-toast";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Spinner from "../components/ui/Spinner";

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ moveInDate: "", duration: 1, message: "" });

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data } = await API.get(`/listings/${id}`);
        setListing(data.listing);
      } catch { setError("Listing not found"); }
      finally { setLoading(false); }
    };
    fetchListing();
  }, [id]);

  const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await API.post("/bookings", { listingId: id, ...formData });
      toast.success("Booking request sent successfully!");
      setSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to send booking request";
      setError(msg);
      toast.error(msg);
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-dark-base"><Spinner size="lg" /></div>;

  if (success) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-base px-4">
      <div className="bg-dark-card border border-dark-border rounded-2xl p-8 max-w-md w-full text-center animate-slide-up">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-emerald-400 mb-2">Request Sent!</h2>
        <p className="text-gray-400 mb-6">Your booking request has been sent to the owner. You will be notified once they respond.</p>
        <div className="flex gap-3">
          <Button onClick={() => navigate("/dashboard")} className="flex-1">View My Requests</Button>
          <Button variant="secondary" onClick={() => navigate("/search")} className="flex-1">Browse More</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-base py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-6 text-gray-400 hover:text-white font-medium transition-colors">← Back to listing</button>

        <div className="bg-dark-card border border-dark-border rounded-2xl overflow-hidden animate-fade-in">
          {listing && (
            <div className="gradient-primary p-6">
              <p className="text-blue-200 text-sm mb-1">Booking request for</p>
              <h2 className="text-xl font-bold text-white mb-1">{listing.title}</h2>
              <p className="text-blue-200 text-sm">📍 {listing.address}, {listing.city}</p>
              <p className="text-2xl font-bold text-white mt-2">
                ₹{listing.rent?.toLocaleString()} <span className="text-blue-200 text-sm font-normal">/month</span>
              </p>
            </div>
          )}

          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Fill in your details</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input label="Preferred Move-in Date" type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} />

              <Input label="Expected Stay Duration (months)" type="select" name="duration" value={formData.duration} onChange={handleChange}>
                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <option key={m} value={m}>{m} {m === 1 ? "month" : "months"}</option>)}
              </Input>

              <Input label="Message to Owner (optional)" type="textarea" name="message" value={formData.message} onChange={handleChange} rows={4} placeholder="Hi, I am interested in your PG..." />

              {listing && (
                <div className="bg-dark-elevated border border-dark-border rounded-xl p-4 text-sm space-y-2">
                  <h4 className="font-semibold text-white mb-2">Booking Summary</h4>
                  <div className="flex justify-between text-gray-400"><span>Monthly Rent</span><span className="font-medium text-gray-300">₹{listing.rent?.toLocaleString()}</span></div>
                  <div className="flex justify-between text-gray-400"><span>Duration</span><span className="font-medium text-gray-300">{formData.duration} month(s)</span></div>
                  <div className="flex justify-between text-gray-300 border-t border-dark-border pt-2 mt-2">
                    <span className="font-semibold">Estimated Total</span>
                    <span className="font-bold text-blue-400">₹{(listing.rent * formData.duration).toLocaleString()}</span>
                  </div>
                </div>
              )}

              <Button type="submit" loading={submitting} className="w-full" size="lg">📩 Send Booking Request</Button>
              <p className="text-center text-gray-600 text-xs">Sending a request does not guarantee a booking.</p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
