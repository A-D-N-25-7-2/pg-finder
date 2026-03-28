import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SkeletonCard from "../components/SkeletonCard";
import API from "../api/axios";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    city: searchParams.get("city") || "",
    type: searchParams.get("type") || "",
    gender: searchParams.get("gender") || "",
    rent_min: "",
    rent_max: "",
    page: 1,
  });

 const fetchListings = async () => {
  setLoading(true);
  setError("");
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, val]) => {
      if (val) params.append(key, val);
    });
    const { data } = await API.get(`/listings?${params.toString()}`);
    setListings(data.listings);
    setTotalPages(data.totalPages);
    if (data.listings.length === 0) {
      toast("No listings found for your filters", { icon: "🔍" });
    }
  } catch (err) {
    setError("Failed to fetch listings");
    toast.error("Failed to load listings");
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchListings();
  }, [filters.page]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchListings();
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar Filters */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Filters</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={filters.city}
                  onChange={handleFilterChange}
                  placeholder="e.g. Bangalore"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  name="type"
                  value={filters.type}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="PG">PG</option>
                  <option value="Hostel">Hostel</option>
                </select>
              </div>

              {/* Gender */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={filters.gender}
                  onChange={handleFilterChange}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Any">Any</option>
                </select>
              </div>

              {/* Rent Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Rent (₹)
                </label>
                <input
                  type="number"
                  name="rent_min"
                  value={filters.rent_min}
                  onChange={handleFilterChange}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Rent (₹)
                </label>
                <input
                  type="number"
                  name="rent_max"
                  value={filters.rent_max}
                  onChange={handleFilterChange}
                  placeholder="50000"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 transition"
              >
                Apply Filters
              </button>
            </form>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-blue-800 mb-4">
            {listings.length > 0
              ? `${listings.length} Listings Found`
              : "Search for Accommodations"}
          </h1>

          {/* Loading */}
          {/* Loading — skeleton cards */}
{loading && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)}

          {/* Error */}
          {error && (
            <div className="bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          {/* Empty */}
          {!loading && listings.length === 0 && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-5xl mb-4">🏠</p>
              <p className="text-xl">
                No listings found. Try different filters.
              </p>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing._id}
                onClick={() => navigate(`/listing/${listing._id}`)}
                className="bg-white rounded-2xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
              >
                {/* Image */}
                <div className="h-48 bg-blue-100 overflow-hidden">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🏠
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-gray-800 text-lg leading-tight">
                      {listing.title}
                    </h3>
                    <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded-full ml-2 shrink-0">
                      {listing.type}
                    </span>
                  </div>
                  <p className="text-gray-500 text-sm mb-2">
                    📍 {listing.city}
                  </p>
                  <p className="text-gray-500 text-sm mb-3">
                    👤 {listing.gender}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-800 font-bold text-lg">
                      ₹{listing.rent.toLocaleString()}/mo
                    </span>
                    {listing.averageRating > 0 && (
                      <span className="text-yellow-500 text-sm font-medium">
                        ⭐ {listing.averageRating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilters({ ...filters, page: p })}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filters.page === p
                      ? "bg-blue-700 text-white"
                      : "bg-white text-blue-700 border border-blue-700 hover:bg-blue-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
