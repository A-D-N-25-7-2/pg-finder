import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HomePage = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) navigate(`/search?city=${city.trim()}`);
    else navigate("/search");
  };

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <div className="bg-blue-800 text-white py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Find Your Perfect PG or Hostel
        </h1>
        <p className="text-blue-200 text-lg mb-8">
          Thousands of verified accommodations across India
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-xl mx-auto flex gap-2">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. Bangalore, Mumbai...)"
            className="flex-1 px-4 py-3 rounded-lg text-white focus:outline-none"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
          >
            Search
          </button>
        </form>
      </div>

      {/* Quick Filters */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Browse by Type
        </h2>
        <div className="flex gap-4 flex-wrap">
          {["PG", "Hostel"].map((t) => (
            <button
              key={t}
              onClick={() => navigate(`/search?type=${t}`)}
              className="bg-white border-2 border-blue-700 text-blue-700 px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 hover:text-white transition"
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Browse by Gender */}
      <div className="max-w-4xl mx-auto px-4 pb-8">
        <h2 className="text-2xl font-bold text-blue-800 mb-4">
          Browse by Gender
        </h2>
        <div className="flex gap-4 flex-wrap">
          {["Male", "Female", "Any"].map((g) => (
            <button
              key={g}
              onClick={() => navigate(`/search?gender=${g}`)}
              className="bg-white border-2 border-orange-500 text-orange-500 px-6 py-3 rounded-lg font-semibold hover:bg-orange-500 hover:text-white transition"
            >
              {g}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
