import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/layout/Footer";
import AppIcon from "../components/ui/AppIcon";

const features = [
  {
    icon: "search",
    title: "Easy Search",
    desc: "Find PGs by city, budget, and preferences in seconds",
  },
  {
    icon: "verified",
    title: "Verified Listings",
    desc: "All listings are reviewed and approved by our admin team",
  },
  {
    icon: "message",
    title: "Direct Contact",
    desc: "Connect directly with owners — no middlemen involved",
  },
  {
    icon: "rating",
    title: "Honest Reviews",
    desc: "Read real reviews from verified tenants before deciding",
  },
];

const stats = [
  { value: "500+", label: "Listed Properties" },
  { value: "1000+", label: "Happy Tenants" },
  { value: "50+", label: "Cities Covered" },
  { value: "4.8", label: "Average Rating" },
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
    <div className="min-h-screen bg-white dark:bg-dark-base">
      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-4 py-24 md:py-36 text-center">
          <div className="animate-fade-in">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight text-gray-900 dark:text-white">
              Find Your Perfect
              <br />
              <span className="gradient-text">PG or Hostel</span>
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Thousands of verified accommodations across India — search,
              compare, and book with confidence.
            </p>
          </div>

          {/* Search bar */}
          <form
            onSubmit={handleSearch}
            className="max-w-xl mx-auto flex gap-2 glass rounded-2xl p-2 animate-slide-up"
          >
            <div className="flex-1 flex items-center gap-3 px-4">
              <svg
                className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city (e.g. Bangalore, Mumbai, Pune...)"
                className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none py-3 text-sm"
              />
            </div>
            <button
              type="submit"
              className="gradient-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:opacity-90 transition shrink-0 shadow-lg shadow-blue-500/20"
            >
              Search
            </button>
          </form>

          {/* Quick filter chips */}
          <div
            className="flex gap-2 justify-center flex-wrap mt-8 animate-fade-in"
            style={{ animationDelay: "0.3s" }}
          >
            {["Bangalore", "Mumbai", "Pune", "Delhi", "Hyderabad"].map((c) => (
              <button
                key={c}
                onClick={() => navigate(`/search?city=${c.toLowerCase()}`)}
                className="px-4 py-1.5 rounded-full text-sm font-medium text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-dark-border hover:border-blue-500/40 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ────────────────────────────────────────── */}
      <div className="border-y border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-card/50">
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`animate-fade-in stagger-${i + 1}`}
              style={{ opacity: 0 }}
            >
              <p className="text-3xl md:text-4xl font-black gradient-text">
                {stat.value}
              </p>
              <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Browse by Type ───────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          What are you looking for?
        </h2>
        <p className="text-gray-500 dark:text-gray-500 text-center mb-10">
          Choose your accommodation type to get started
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              type: "PG",
              icon: "home",
              desc: "Paying Guest accommodation with shared facilities",
              gradient:
                "from-blue-600/20 to-blue-800/20 hover:from-blue-600/30 hover:to-blue-800/30 border-blue-500/20",
            },
            {
              type: "Hostel",
              icon: "bed",
              desc: "Dormitory style accommodation for budget travellers",
              gradient:
                "from-purple-600/20 to-purple-800/20 hover:from-purple-600/30 hover:to-purple-800/30 border-purple-500/20",
            },
          ].map((item) => (
            <button
              key={item.type}
              onClick={() => navigate(`/search?type=${item.type}`)}
              className={`bg-gradient-to-br ${item.gradient} border rounded-2xl p-8 text-left transition-all hover:scale-[1.02] group`}
            >
              <AppIcon
                name={item.icon}
                size={48}
                className="text-blue-500 mb-4"
              />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {item.type}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {item.desc}
              </p>
              <p className="mt-4 font-semibold text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">
                Browse {item.type}s →
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* ── Browse by Gender ─────────────────────────────── */}
      <div className="bg-gray-50 dark:bg-dark-card/50 border-y border-gray-200 dark:border-dark-border py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">
            Browse by Preference
          </h2>
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              {
                label: "Male PGs",
                gender: "Male",
                icon: "👨",
                color:
                  "border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10",
              },
              {
                label: "Female PGs",
                gender: "Female",
                icon: "👩",
                color:
                  "border-pink-500/30 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-500/10",
              },
              {
                label: "Any Gender",
                gender: "Any",
                icon: "🤝",
                color:
                  "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
              },
            ].map((item) => (
              <button
                key={item.gender}
                onClick={() => navigate(`/search?gender=${item.gender}`)}
                className={`border-2 ${item.color} px-8 py-4 rounded-2xl font-semibold transition-all text-lg hover:scale-105`}
              >
                <AppIcon
                  name={item.icon}
                  size={24}
                  className="mr-2 text-blue-500 inline"
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 text-center">
          Why Choose PG Finder?
        </h2>
        <p className="text-gray-500 dark:text-gray-500 text-center mb-12">
          We make finding accommodation simple, safe, and stress-free
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6 text-center card-glow animate-fade-in stagger-${i + 1}`}
              style={{ opacity: 0 }}
            >
              <p className="text-4xl mb-4">{f.icon}</p>
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-500 text-sm leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="relative max-w-3xl mx-auto py-20 px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Are you a PG or Hostel Owner?
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-lg mx-auto">
            List your property for free and reach thousands of verified tenants
            looking for accommodation right now.
          </p>
          <button
            onClick={() => navigate("/register")}
            className="gradient-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition shadow-lg shadow-blue-500/25"
          >
            List Your Property Free →
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
