import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    return "/dashboard";
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-blue-700 font-semibold"
      : "text-gray-600 hover:text-blue-700";

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-blue-800 flex items-center gap-2"
      >
        🏠 PG Finder
      </Link>

      {/* Links */}
      <div className="flex gap-5 items-center">
        <Link to="/search" className={isActive("/search")}>
          Search
        </Link>

        {isAuthenticated ? (
          <>
            {/* User greeting */}
            <span className="text-gray-700 font-medium hidden md:block">
              👋 {user?.name?.split(" ")[0]}
            </span>

            <Link to={dashboardLink()} className={isActive(dashboardLink())}>
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition font-medium text-sm"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className={isActive("/login")}>
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-700 text-white px-4 py-2 rounded-xl hover:bg-blue-800 transition font-medium text-sm"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
