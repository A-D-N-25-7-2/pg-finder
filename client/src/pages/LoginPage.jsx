import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(formData);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "owner") navigate("/owner/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />

      <div className="relative bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 rounded-2xl shadow-2xl dark:shadow-gray-900 w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold gradient-text mt-2">PG Finder</h1>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Find your perfect home away from home</p>
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Welcome Back</h2>
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">Login to your account</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Your password"
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-500 mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
