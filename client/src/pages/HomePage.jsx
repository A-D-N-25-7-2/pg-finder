import { useState } from "react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: "🔍",
    title: "Easy Search",
    desc: "Find PGs by city, budget, and preferences in seconds",
  },
  {
    icon: "✅",
    title: "Verified Listings",
    desc: "All listings are reviewed and approved by our admin team",
  },
  {
    icon: "💬",
    title: "Direct Contact",
    desc: "Connect directly with owners — no middlemen involved",
  },
  {
    icon: "⭐",
    title: "Honest Reviews",
    desc: "Read real reviews from verified tenants before deciding",
  },
];

const stats = [
  { value: "500+", label: "Listed Properties" },
  { value: "1000+", label: "Happy Tenants" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.8⭐", label: "Average Rating" },
];

const HomePage = () => {
  const [city, setCity] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) navigate(`/search?city=${city.trim()}`);
    else navigate("/search");
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero Section ────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
          Find Your Perfect
          <br />
          <span className="text-orange-400">PG or Hostel</span>
        </h1>
        <p className="text-blue-200 text-lg md:text-xl mb-10 max-w-xl mx-auto">
          Thousands of verified accommodations across India — search, compare,
          and book with confidence.
        </p>

        {/* Search bar */}
        <form
          onSubmit={handleSearch}
          className="max-w-xl mx-auto flex gap-2 bg-white rounded-2xl p-2 shadow-2xl"
        >
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city (e.g. Bangalore, Mumbai, Pune...)"
            className="flex-1 px-4 py-2 text-gray-800 focus:outline-none rounded-xl"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-600 transition shrink-0"
          >
            Search
          </button>
        </form>

        {/* Quick filter chips */}
        <div className="flex gap-2 justify-center flex-wrap mt-6">
          {["Bangalore", "Mumbai", "Pune", "Delhi", "Hyderabad"].map((c) => (
            <button
              key={c}
              onClick={() => navigate(`/search?city=${c.toLowerCase()}`)}
              className="bg-white bg-opacity-20 text-white border border-white border-opacity-30 px-4 py-1 rounded-full text-sm hover:bg-opacity-30 transition"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats Section ────────────────────────────────────── */}
      <div className="bg-blue-800 text-white py-8 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-bold text-orange-400">{stat.value}</p>
              <p className="text-blue-200 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Browse by Type ───────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">
          What are you looking for?
        </h2>
        <p className="text-gray-500 text-center mb-8">
          Choose your accommodation type to get started
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              type: "PG",
              icon: "🏠",
              desc: "Paying Guest accommodation with shared facilities",
              color: "from-blue-500 to-blue-700",
            },
            {
              type: "Hostel",
              icon: "🛏️",
              desc: "Dormitory style accommodation for budget travellers",
              color: "from-purple-500 to-purple-700",
            },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => navigate(`/search?type=${item.type}`)}
              className={`bg-gradient-to-br ${item.color} text-white p-8 rounded-2xl text-left hover:scale-105 transition shadow-lg`}
            >
              <p className="text-5xl mb-3">{item.icon}</p>
              <h3 className="text-2xl font-bold mb-2">{item.type}</h3>
              <p className="text-white text-opacity-80 text-sm">{item.desc}</p>
              <p className="mt-4 font-semibold text-orange-300">
                Browse {item.type}s →
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Browse by Gender ─────────────────────────────────── */}
      <div className="bg-blue-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
            Browse by Preference
          </h2>
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              {
                label: "Male PGs",
                gender: "Male",
                icon: "👨",
                color: "border-blue-500   text-blue-700   hover:bg-blue-500",
              },
              {
                label: "Female PGs",
                gender: "Female",
                icon: "👩",
                color: "border-pink-500   text-pink-700   hover:bg-pink-500",
              },
              {
                label: "Any Gender",
                gender: "Any",
                icon: "🤝",
                color: "border-green-500  text-green-700  hover:bg-green-500",
              },
            ].map((item) => (
              <button
                key={item.gender}
                onClick={() => navigate(`/search?gender=${item.gender}`)}
                className={`border-2 ${item.color} px-8 py-4 rounded-2xl font-semibold hover:text-white transition text-lg`}
              >
                <span className="text-2xl mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features Section ─────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-14">
        <h2 className="text-3xl font-bold text-blue-900 mb-2 text-center">
          Why Choose PG Finder?
        </h2>
        <p className="text-gray-500 text-center mb-10">
          We make finding accommodation simple, safe, and stress-free
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition"
            >
              <p className="text-4xl mb-3">{f.icon}</p>
              <h3 className="font-bold text-gray-800 mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA Section ──────────────────────────────────────── */}
      <div className="bg-blue-800 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-3">
          Are you a PG or Hostel Owner?
        </h2>
        <p className="text-blue-200 mb-8 max-w-lg mx-auto">
          List your property for free and reach thousands of verified tenants
          looking for accommodation right now.
        </p>
        <button
          onClick={() => navigate("/register")}
          className="bg-orange-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-orange-600 transition"
        >
          List Your Property Free →
        </button>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="bg-blue-900 text-blue-300 text-center py-6 text-sm">
        <p>© 2024 PG Finder. Built with MERN Stack.</p>
        <p className="mt-1">
          Made with ❤️ for students and working professionals
        </p>
      </footer>
    </div>
  );
};

export default HomePage;
