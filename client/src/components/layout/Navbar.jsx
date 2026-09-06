import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useDashboard } from "../../context/DashboardContext";
import AppIcon from "../ui/AppIcon";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { dashboardTabs, activeTab, onTabChange, setPendingTab } =
    useDashboard();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const hoverTimeout = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    setMobileOpen(false);
    setProfileOpen(false);
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    return "/dashboard";
  };

  const isDashboardPage =
    location.pathname === "/dashboard" ||
    location.pathname === "/owner/dashboard" ||
    location.pathname === "/admin/dashboard";

  const handleProfileClick = () => {
    if (
      isDashboardPage &&
      dashboardTabs.some((t) => t.key === "profile") &&
      onTabChange
    ) {
      onTabChange("profile");
    } else {
      navigate(dashboardLink());
    }
    setProfileOpen(false);
  };

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout.current);
    setProfileOpen(true);
  };

  const handleMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => setProfileOpen(false), 250);
  };

  const handleTabClick = (tabKey) => {
    if (!isDashboardPage) {
      setPendingTab(tabKey);
      navigate(dashboardLink());
    } else if (onTabChange) {
      onTabChange(tabKey);
    }
    setMobileOpen(false);
  };

  const isTabActive = (tabKey) => isDashboardPage && activeTab === tabKey;

  // Get the right tabs based on user role
  const getRoleTabs = () => {
    if (!isAuthenticated) return [];
    if (dashboardTabs.length > 0) {
      return dashboardTabs.filter((tab) => tab.key !== "profile");
    }
    if (user?.role === "user") {
      return [
        { key: "bookings", label: "Bookings", icon: "booking" },
        { key: "wishlist", label: "Wishlist", icon: "wishlist" },
        { key: "reviews", label: "Reviews", icon: "rating" },
      ];
    }
    if (user?.role === "owner") {
      return [
        { key: "listings", label: "Listings", icon: "home" },
        { key: "bookings", label: "Bookings", icon: "booking" },
      ];
    }
    if (user?.role === "admin") {
      return [
        { key: "dashboard", label: "Overview", icon: "analytics" },
        { key: "listings", label: "Listings", icon: "home" },
        { key: "users", label: "Users", icon: "users" },
        { key: "bookings", label: "Bookings", icon: "booking" },
      ];
    }
    return [];
  };

  const visibleTabs = getRoleTabs();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-dark-base/80 border-b border-gray-200/50 dark:border-dark-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-[4.75rem]">
          {/* ─── LEFT: Logo ─── */}
          <Link
            to="/"
            className="nav-logo flex items-center gap-2.5 group shrink-0"
          >
            <img
              src="/favicon.svg"
              alt="PG Finder"
              className="nav-logo-icon brand-mark w-8 h-8 inline-block transition-transform duration-300"
            />
            <span className="nav-logo-text text-[1.35rem] font-bold gradient-text transition-all duration-300">
              PG Finder
            </span>
          </Link>

          {/* ─── RIGHT: Everything (desktop) ─── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Explore — always visible */}
            <Link
              to="/search"
              className={`nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl whitespace-nowrap ${
                location.pathname === "/search"
                  ? "nav-tab-active text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
              }`}
            >
              Explore
            </Link>

            {/* Dashboard tabs — always visible when authenticated */}
            {isAuthenticated &&
              visibleTabs.map((tab, i) => (
                <button
                  key={tab.key}
                  onClick={() => handleTabClick(tab.key)}
                  className={`nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl whitespace-nowrap animate-nav-item ${
                    isTabActive(tab.key)
                      ? "nav-tab-active text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {tab.icon && (
                    <AppIcon
                      name={tab.icon}
                      size={17}
                      className="mr-1.5 inline"
                    />
                  )}
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full leading-none animate-pulse">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}

            {/* Divider */}
            <div className="w-px h-7 bg-gray-200 dark:bg-dark-border mx-1.5 transition-colors duration-300" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-toggle p-2.5 rounded-xl text-xl"
              title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            >
              <AppIcon name={isDark ? "sun" : "moon"} size={20} />
            </button>

            {/* Profile avatar */}
            {isAuthenticated ? (
              <div
                ref={profileRef}
                className="relative ml-1"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={handleProfileClick}
                  className="nav-avatar w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-base font-bold cursor-pointer"
                  title="View Profile"
                >
                  {user?.name?.charAt(0).toUpperCase()}
                </button>

                {/* Hover dropdown */}
                {profileOpen && (
                  <div className="animate-dropdown absolute right-0 top-full mt-2 w-60 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl shadow-xl dark:shadow-black/40 overflow-hidden">
                    <div className="px-4 py-3.5 border-b border-gray-100 dark:border-dark-border">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {user?.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    <div className="py-1.5">
                      <button
                        onClick={handleProfileClick}
                        className="dropdown-item w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2.5"
                      >
                        <AppIcon name="profile" size={16} /> My Profile
                      </button>
                      {!isDashboardPage && (
                        <button
                          onClick={() => {
                            navigate(dashboardLink());
                            setProfileOpen(false);
                          }}
                          className="dropdown-item w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2.5"
                        >
                          <AppIcon name="analytics" size={16} /> Dashboard
                        </button>
                      )}
                    </div>
                    <div className="border-t border-gray-100 dark:border-dark-border py-1.5">
                      <button
                        onClick={handleLogout}
                        className="dropdown-item w-full text-left px-4 py-2.5 text-sm text-red-500 dark:text-red-400 flex items-center gap-2.5 font-medium"
                      >
                        <AppIcon name="logout" size={16} /> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl ${
                    location.pathname === "/login"
                      ? "nav-tab-active text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                  }`}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="nav-tab px-5 py-2.5 text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.03] active:scale-[0.97]"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ─── MOBILE ─── */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="theme-toggle p-2.5 rounded-xl text-xl"
            >
              <AppIcon name={isDark ? "sun" : "moon"} size={20} />
            </button>

            {isAuthenticated && (
              <button
                onClick={handleProfileClick}
                className="nav-avatar w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold"
              >
                {user?.name?.charAt(0).toUpperCase()}
              </button>
            )}

            <button
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 hover:rotate-90"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <svg
                className="w-7 h-7 transition-transform duration-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-mobile-drawer">
            <div className="flex flex-col gap-1 pt-2 border-t border-gray-200 dark:border-dark-border">
              <Link
                to="/search"
                onClick={() => setMobileOpen(false)}
                className={`nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl ${
                  location.pathname === "/search"
                    ? "nav-tab-active text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                }`}
              >
                <AppIcon name="search" size={17} className="mr-2 inline" />{" "}
                Explore
              </Link>

              {isAuthenticated &&
                visibleTabs.map((tab, i) => (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    className={`nav-tab text-left px-4 py-2.5 text-[15px] font-medium rounded-xl animate-nav-item ${
                      isTabActive(tab.key)
                        ? "nav-tab-active text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                    }`}
                    style={{ animationDelay: `${(i + 1) * 0.06}s` }}
                  >
                    {tab.icon && (
                      <AppIcon
                        name={tab.icon}
                        size={17}
                        className="mr-2 inline"
                      />
                    )}
                    {tab.label}
                    {tab.count > 0 && (
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full">
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}

              <div className="border-t border-gray-100 dark:border-dark-border my-1" />

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/5 text-left animate-nav-item"
                  style={{
                    animationDelay: `${(visibleTabs.length + 1) * 0.06}s`,
                  }}
                >
                  <AppIcon name="logout" size={17} className="mr-2 inline" />{" "}
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="nav-tab px-4 py-2.5 text-[15px] font-medium rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/70 dark:hover:bg-white/5"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="px-5 py-2.5 text-[15px] font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl text-center hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
