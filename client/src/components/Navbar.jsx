import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const dashboardLink = () => {
    if (!user) return "/login";
    if (user.role === "admin") return "/admin/dashboard";
    if (user.role === "owner") return "/owner/dashboard";
    return "/dashboard";
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-800">
        PG Finder
      </Link>

      {/* Links */}
      <div className="flex gap-4 items-center">
        <Link to="/search" className="text-gray-600 hover:text-blue-700">
          Search
        </Link>

        {isAuthenticated ? (
          <>
            {/* Show user name */}
            <span className="text-gray-700 font-medium">
              Hi, {user?.name?.split(" ")[0]}
            </span>

            <Link
              to={dashboardLink()}
              className="text-gray-600 hover:text-blue-700"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-600 hover:text-blue-700">
              Login
            </Link>
            <Link
              to="/register"
              className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition"
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
