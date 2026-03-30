import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "user", phone: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await registerUser(formData);
      login(data.user, data.token);
      toast.success("Account created successfully!");
      if (data.user.role === "owner") navigate("/owner/dashboard");
      else navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-base flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative bg-dark-card border border-dark-border p-8 rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold gradient-text mt-2">PG Finder</h1>
          <p className="text-gray-500 text-sm mt-1">Find your perfect home away from home</p>
        </div>

        <h2 className="text-xl font-bold text-white mb-1">Create Account</h2>
        <p className="text-gray-500 text-sm mb-6">Join thousands finding their perfect PG</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" required />
          <Input label="Email Address" type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" required />
          <Input label="Phone (optional)" name="phone" value={formData.phone} onChange={handleChange} placeholder="9876543210" />
          <Input label="Password" type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Min 6 characters" required />

          {/* Role selector */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Register As</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "user", label: "Tenant", desc: "Looking for PG", icon: "🔍" },
                { value: "owner", label: "Owner", desc: "Listing a PG", icon: "🏠" },
              ].map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, role: role.value })}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    formData.role === role.value
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-dark-border hover:border-gray-600"
                  }`}
                >
                  <span className="text-xl">{role.icon}</span>
                  <p className="text-sm font-semibold text-white mt-1">{role.label}</p>
                  <p className="text-xs text-gray-500">{role.desc}</p>
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={loading} className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-center text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
