import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import Badge from "../ui/Badge";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
    setMobileOpen(false);
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    return "/dashboard";
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-lg ${
      isActive(path)
        ? "text-blue-400 bg-blue-500/10"
        : "text-gray-400 hover:text-white hover:bg-white/5"
    }`;

  const NavLinks = ({ mobile = false }) => (
    <>
      <Link
        to="/search"
        className={navLinkClass("/search")}
        onClick={() => mobile && setMobileOpen(false)}
      >
        Search
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            to={dashboardLink()}
            className={navLinkClass(dashboardLink())}
            onClick={() => mobile && setMobileOpen(false)}
          >
            Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              {!mobile && (
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-200 leading-none">
                    {user?.name?.split(" ")[0]}
                  </p>
                  <Badge status={user?.role} className="mt-0.5 scale-90 origin-left" />
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
            >
              Logout
            </button>
          </div>
        </>
      ) : (
        <>
          <Link
            to="/login"
            className={navLinkClass("/login")}
            onClick={() => mobile && setMobileOpen(false)}
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20"
            onClick={() => mobile && setMobileOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="sticky top-0 z-50 glass-strong">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🏠</span>
            <span className="text-xl font-bold gradient-text">PG Finder</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileOpen && (
          <div className="md:hidden pb-4 animate-slide-down">
            <div className="flex flex-col gap-2 pt-2 border-t border-dark-border">
              <NavLinks mobile />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
