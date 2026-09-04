import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AppIcon from "../components/ui/AppIcon";
import { registerUser, sendOtp } from "../services/authService";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // ── Step: "form" → fill details, "otp" → enter OTP
  const [step, setStep] = useState("form");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
  });

  const [otp, setOtp] = useState(["", "", "", ""]);
  const otpRefs = [useRef(), useRef(), useRef(), useRef()];

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      return toast.error("Please fill in all required fields");
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters");
    }

    setOtpLoading(true);
    try {
      await sendOtp({ email: formData.email });
      toast.success("OTP sent to your email!");
      setStep("otp");
      setResendCooldown(30);
      // Focus first OTP input after a brief delay
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── OTP input handling
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 4);
    if (pasted.length === 4) {
      const digits = pasted.split("");
      setOtp(digits);
      otpRefs[3].current?.focus();
    }
  };

  // ── Resend OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setOtpLoading(true);
    try {
      await sendOtp({ email: formData.email });
      toast.success("New OTP sent!");
      setResendCooldown(30);
      setOtp(["", "", "", ""]);
      otpRefs[0].current?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Step 2: Verify OTP + Register
  const handleVerifyAndRegister = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    if (enteredOtp.length !== 4) {
      return toast.error("Please enter the complete 4-digit OTP");
    }

    setLoading(true);
    try {
      const { data } = await registerUser({ ...formData, otp: enteredOtp });
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
    <div className="min-h-screen bg-gray-50 dark:bg-dark-base flex items-center justify-center px-4 py-8 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl" />

      <div className="relative bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border p-8 rounded-2xl shadow-2xl dark:shadow-gray-900 w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <span className="text-4xl">🏠</span>
          <h1 className="text-2xl font-bold gradient-text mt-2">PG Finder</h1>
          <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">
            Find your perfect home away from home
          </p>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === "form" ? "gradient-primary" : "bg-emerald-500"}`}
          />
          <div
            className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === "otp" ? "gradient-primary" : "bg-gray-200 dark:bg-dark-border"}`}
          />
        </div>

        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 1: Registration Form                              */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "form" && (
          <>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
              Create Account
            </h2>
            <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
              Join thousands finding their perfect PG
            </p>

            <form onSubmit={handleSendOtp} className="space-y-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
              />
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
                label="Phone (optional)"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="9876543210"
              />
              <Input
                label="Password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 6 characters"
                required
              />

              {/* Role selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Register As
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      value: "user",
                      label: "Tenant",
                      desc: "Looking for PG",
                      icon: "search",
                    },
                    {
                      value: "owner",
                      label: "Owner",
                      desc: "Listing a PG",
                      icon: "home",
                    },
                  ].map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: role.value })
                      }
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        formData.role === role.value
                          ? "border-blue-500/50 bg-blue-50 dark:bg-blue-500/10"
                          : "border-gray-200 dark:border-dark-border hover:border-gray-400 dark:hover:border-gray-600"
                      }`}
                    >
                      <AppIcon
                        name={role.icon}
                        size={24}
                        className="text-blue-600"
                      />
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                        {role.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {role.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" loading={otpLoading} className="w-full">
                Send Verification Code
              </Button>
            </form>
          </>
        )}

        {/* ════════════════════════════════════════════════════════ */}
        {/* STEP 2: OTP Verification                               */}
        {/* ════════════════════════════════════════════════════════ */}
        {step === "otp" && (
          <>
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 mb-4">
                <span className="text-3xl">🔐</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                Verify Your Email
              </h2>
              <p className="text-gray-500 dark:text-gray-500 text-sm">
                We sent a 4-digit code to
                <br />
                <span className="text-blue-600 dark:text-blue-400 font-semibold">
                  {formData.email}
                </span>
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="space-y-6">
              {/* OTP input boxes */}
              <div
                className="flex justify-center gap-3"
                onPaste={handleOtpPaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className={`w-14 h-14 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all duration-200 bg-white dark:bg-dark-elevated ${
                      digit
                        ? "border-blue-500 dark:border-blue-400 text-gray-900 dark:text-white shadow-[0_0_0_3px_rgba(59,130,246,0.15)]"
                        : "border-gray-200 dark:border-dark-border text-gray-900 dark:text-white"
                    } focus:border-blue-500 dark:focus:border-blue-400 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.15)]`}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              <Button type="submit" loading={loading} className="w-full">
                Verify & Create Account
              </Button>

              {/* Resend / Back controls */}
              <div className="flex flex-col items-center gap-3">
                <p className="text-gray-500 dark:text-gray-500 text-sm">
                  Didn't receive it?{" "}
                  {resendCooldown > 0 ? (
                    <span className="text-gray-400 dark:text-gray-600">
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={otpLoading}
                      className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setOtp(["", "", "", ""]);
                  }}
                  className="text-gray-400 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-400 text-sm transition-colors"
                >
                  ← Change email or details
                </button>
              </div>
            </form>
          </>
        )}

        <p className="text-center text-gray-500 dark:text-gray-500 mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
