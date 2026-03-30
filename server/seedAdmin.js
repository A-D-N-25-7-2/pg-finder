/**
 * Admin Seed Script
 * Creates a single admin user if none exists.
 *
 * Usage: node seedAdmin.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const ADMIN = {
  name: "Admin",
  email: "admin@pgfinder.com",
  password: "Admin@123",
  role: "admin",
  phone: "0000000000",
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({ role: "admin" });
    if (existingAdmin) {
      console.log(`Admin already exists: ${existingAdmin.email}`);
      process.exit(0);
    }

    const admin = await User.create(ADMIN);
    console.log("✅ Admin created successfully!");
    console.log(`   Email:    ${admin.email}`);
    console.log(`   Password: ${ADMIN.password}`);
    console.log(`   Role:     ${admin.role}`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err.message);
    process.exit(1);
  }
};

seedAdmin();
