import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Spinner from "./components/ui/Spinner";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SearchPage = lazy(() => import("./pages/SearchPage"));
const ListingDetailPage = lazy(() => import("./pages/ListingDetailPage"));
const BookingPage = lazy(() => import("./pages/BookingPage"));
const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const OwnerDashboard = lazy(() => import("./pages/OwnerDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const PageLoader = () => (
  <div className="min-h-screen bg-white dark:bg-dark-base flex items-center justify-center">
    <div className="text-center">
      <Spinner size="lg" className="mb-4" />
      <p className="text-gray-500 dark:text-gray-500 text-sm">Loading...</p>
    </div>
  </div>
);

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/listing/:id" element={<ListingDetailPage />} />

              {/* User-only routes */}
              <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["user"]}><UserDashboard /></ProtectedRoute>} />
              <Route path="/listing/:id/book" element={<ProtectedRoute allowedRoles={["user"]}><BookingPage /></ProtectedRoute>} />

              {/* Owner-only routes */}
              <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>} />

              {/* Admin-only routes */}
              <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
