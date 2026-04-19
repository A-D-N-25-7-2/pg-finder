const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// ─── In-memory OTP store ──────────────────────────────────────
// Map<email, { otp: string, expiresAt: number }>
const otpStore = new Map();
const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

// Cleanup expired OTPs every 2 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of otpStore) {
    if (now > data.expiresAt) otpStore.delete(email);
  }
}, 2 * 60 * 1000);

const otpEmailHtml = (otp) => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#3b82f6,#8b5cf6);padding:32px 28px 24px;text-align:center;">
      <h1 style="color:#ffffff;font-size:22px;margin:0 0 4px;font-weight:700;">🔐 Email Verification</h1>
      <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Your OTP for PG Finder registration</p>
    </div>
    <div style="padding:28px;text-align:center;">
      <p style="color:#475569;font-size:14px;margin:0 0 20px;">Use the following 4-digit code to verify your email address. This code expires in <strong>5 minutes</strong>.</p>
      <div style="display:inline-block;letter-spacing:12px;font-size:36px;font-weight:800;color:#1e293b;background:#f1f5f9;border:2px dashed #3b82f6;border-radius:12px;padding:16px 32px;margin:8px 0 20px;">${otp}</div>
      <p style="color:#94a3b8;font-size:12px;margin:16px 0 0;">If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div style="padding:16px 28px;text-align:center;border-top:1px solid #f1f5f9;">
      <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} PG Finder</p>
    </div>
  </div>
</body>
</html>`;

// ─── SEND OTP ────────────────────────────────────────────────
// POST /api/v1/auth/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    // Rate-limit: prevent spamming OTPs for same email (30s cooldown)
    const existing = otpStore.get(email.toLowerCase());
    if (existing && Date.now() - existing.createdAt < 30 * 1000) {
      return res.status(429).json({ success: false, message: "OTP already sent. Please wait 30 seconds before requesting again." });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Store OTP
    otpStore.set(email.toLowerCase(), {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      createdAt: Date.now(),
    });

    // Send OTP email
    await sendEmail({
      to: email,
      subject: "🔐 PG Finder — Your Verification Code",
      html: otpEmailHtml(otp),
    });

    res.status(200).json({ success: true, message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── REGISTER (with OTP verification) ────────────────────────
// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone, otp } = req.body;

    if (!otp) {
      return res.status(400).json({ success: false, message: "OTP is required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Verify OTP
    const storedOtp = otpStore.get(email.toLowerCase());
    if (!storedOtp) {
      return res.status(400).json({ success: false, message: "OTP expired or not found. Please request a new one." });
    }
    if (Date.now() > storedOtp.expiresAt) {
      otpStore.delete(email.toLowerCase());
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }
    if (storedOtp.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP. Please check and try again." });
    }

    // OTP verified — remove from store
    otpStore.delete(email.toLowerCase());

    // Create new user (password is hashed automatically in User model)
    const user = await User.create({ name, email, password, role, phone });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── LOGIN ────────────────────────────────────────────────────
// POST /api/v1/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if email and password provided
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    // Find user and include password field (select:false by default)
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Your account has been suspended. Contact admin.",
      });
    }

    // Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── GET CURRENT USER ─────────────────────────────────────────
// GET /api/v1/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── UPDATE PROFILE ───────────────────────────────────────────
// PUT /api/v1/auth/update-profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── CHANGE PASSWORD ──────────────────────────────────────────
// PUT /api/v1/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select("+password");

    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Set new password (will be hashed by pre-save hook)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── FORGOT PASSWORD ──────────────────────────────────────────
// POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      // Don't reveal whether email exists
      return res.status(200).json({
        success: true,
        message: "If that email is registered, a reset link has been sent.",
      });
    }

    // Generate raw token and hash it for storage
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "PG Finder — Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>You requested a password reset. Click the link below (valid for 10 minutes):</p>
        <a href="${resetUrl}" style="padding:10px 20px;background:#4f46e5;color:#fff;border-radius:5px;text-decoration:none;">Reset Password</a>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── RESET PASSWORD ───────────────────────────────────────────
// POST /api/v1/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token",
      });
    }

    if (!req.body.password || req.body.password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { sendOtp, register, login, getMe, updateProfile, changePassword, forgotPassword, resetPassword };
