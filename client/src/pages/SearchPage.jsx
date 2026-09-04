import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import API from "../api/axios";
import { formatCity } from "../utils/formatCity";
import AppIcon from "../components/ui/AppIcon";

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);

  // FIX: the sidebar is positioned with `position: fixed` (see below) instead
  // of `sticky` or an internal `overflow-y: auto`. `fixed` anchors purely to
  // the viewport and is completely outside any scroll container's hierarchy,
  // so it's physically impossible for it to "scroll a little" when the
  // listings scroll, or vice versa — there's nothing between it and the
  // viewport that can move it. We track the placeholder column's on-screen
  // position so the fixed panel can line up exactly where that column is.
  const sidebarSlotRef = useRef(null);
  const [sidebarRect, setSidebarRect] = useState(null);

  useEffect(() => {
    // Only left/width are tracked — horizontal position never changes from
    // vertical scrolling, so this only needs to re-run on resize (e.g. the
    // page's max-w-7xl centering shifting on window resize), never on scroll.
    const updateSidebarRect = () => {
      if (sidebarSlotRef.current) {
        const rect = sidebarSlotRef.current.getBoundingClientRect();
        setSidebarRect({ left: rect.left, width: rect.width });
      }
    };
    updateSidebarRect();
    window.addEventListener("resize", updateSidebarRect);
    return () => window.removeEventListener("resize", updateSidebarRect);
  }, []);

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
      if (data.listings.length === 0)
        toast("No listings found for your filters", { icon: "⌕" });
    } catch {
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

  const filterPanelContent = (
    <div className="filter-panel bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
        Filters
      </h2>
      <form onSubmit={handleSearch} className="space-y-4">
        <Input
          label="City"
          name="city"
          value={filters.city}
          onChange={handleFilterChange}
          placeholder="e.g. Bangalore"
        />
        <Input
          label="Type"
          type="select"
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="PG">PG</option>
          <option value="Hostel">Hostel</option>
        </Input>
        <Input
          label="Gender"
          type="select"
          name="gender"
          value={filters.gender}
          onChange={handleFilterChange}
        >
          <option value="">All</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Any">Any</option>
        </Input>
        <Input
          label="Min Rent (₹)"
          type="number"
          name="rent_min"
          value={filters.rent_min}
          onChange={handleFilterChange}
          placeholder="0"
        />
        <Input
          label="Max Rent (₹)"
          type="number"
          name="rent_max"
          value={filters.rent_max}
          onChange={handleFilterChange}
          placeholder="50000"
        />
        <Button type="submit" className="w-full">
          Apply Filters
        </Button>
      </form>
    </div>
  );

  return (
    // FIX: removed the fixed-height wrapper (min-h-[calc(100dvh-4.75rem)])
    // that was forcing this page into a boxed viewport height. That box was
    // what caused the sidebar and the listing grid to each spin up their own
    // internal scroll (instead of the page scrolling as a whole), which is
    // why content was getting clipped under the navbar at the top and cut
    // off at the bottom. Now the page just grows naturally and the browser
    // handles one single scrollbar for everything.
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mobile filter toggle */}
        <div className="md:hidden mb-4">
          <Button
            variant="secondary"
            onClick={() => setMobileFilters(!mobileFilters)}
            className="w-full"
          >
            {mobileFilters ? "Hide Filters" : "Show Filters"}
          </Button>
          {mobileFilters && <div className="mt-4">{filterPanelContent}</div>}
        </div>

        <div className="search-layout flex gap-6 items-start">
          {/* Sidebar — desktop */}
          {/*
            FIX: `position: sticky` depends on every ancestor between this
            element and the viewport having no scroll/overflow of its own —
            if the app shell has a scrollable <main> or similar wrapper
            somewhere above this page, sticky silently breaks and you get
            exactly the "scrolls a little on its own" cross-bleed. Switching
            to `position: fixed` sidesteps that entirely: fixed elements
            anchor straight to the viewport and are outside any scroll
            container's hierarchy, so nothing can nudge them.

            This placeholder div keeps the column's width reserved in the
            normal document flow (so the listings grid doesn't shift), while
            `sidebarSlotRef` reports where that column actually sits on
            screen so the real fixed-position panel below can line up with
            it exactly.
          */}
          <div
            ref={sidebarSlotRef}
            className="search-filters hidden md:block w-64 shrink-0"
            aria-hidden="true"
          />
          <div
            className="hidden md:block"
            style={
              sidebarRect
                ? {
                    position: "fixed",
                    top: "6rem",
                    left: `${sidebarRect.left}px`,
                    width: `${sidebarRect.width}px`,
                    maxHeight: "calc(100vh - 7rem)",
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    zIndex: 10,
                  }
                : { display: "none" }
            }
          >
            {filterPanelContent}
          </div>

          {/* Listings */}
          <div className="search-results min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 animate-fade-in">
              {listings.length > 0
                ? `${listings.length} Listings Found`
                : "Search for Accommodations"}
            </h1>

            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} variant="card" />
                ))}
              </div>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl">
                {error}
              </div>
            )}

            {!loading && listings.length === 0 && (
              <EmptyState
                icon="home"
                title="No listings found"
                description="Try different filters or a different city."
                actionLabel="Clear Filters"
                onAction={() =>
                  setFilters({
                    city: "",
                    type: "",
                    gender: "",
                    rent_min: "",
                    rent_max: "",
                    page: 1,
                  })
                }
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {listings.map((listing, index) => (
                <div
                  key={listing._id}
                  onClick={() => navigate(`/listing/${listing._id}`)}
                  className="listing-card bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl overflow-hidden cursor-pointer"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  <div className="h-48 bg-gray-100 dark:bg-dark-elevated overflow-hidden">
                    {listing.images?.[0] ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="listing-card-img w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-gray-400 dark:text-gray-600">
                        <AppIcon name="home" size={36} />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-center gap-3 mb-3">
                      <h3 className="font-bold text-gray-900 dark:text-white text-base leading-tight line-clamp-2">
                        {listing.title}
                      </h3>
                      <Badge
                        status={listing.type}
                        className="listing-card-badge ml-2 shrink-0"
                      />
                    </div>
                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-2">
                      <AppIcon name="map" size={15} className="shrink-0" />
                      {formatCity(listing.city)}
                    </p>
                    <p className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-4">
                      <AppIcon name="profile" size={15} className="shrink-0" />
                      {listing.gender}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="listing-card-price text-blue-600 dark:text-blue-400 font-bold text-lg">
                        ₹{listing.rent?.toLocaleString()}/mo
                      </span>
                      {listing.averageRating > 0 && (
                        <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 text-sm font-medium">
                          <AppIcon name="rating" size={15} />
                          {listing.averageRating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (p) => (
                    <button
                      key={p}
                      onClick={() => setFilters({ ...filters, page: p })}
                      className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                        filters.page === p
                          ? "gradient-primary text-white"
                          : "bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
