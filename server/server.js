const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

dotenv.config();
connectDB();

const app = express();

// ── Security headers ──────────────────────────────────────────
app.use(helmet());

// ── CORS — allow only frontend origin ────────────────────────
app.use(
  cors({
    origin:
      process.env.CLIENT_URL ||
      "http://localhost:5173" ||
      "https://pg-finder-bay.vercel.app",
    credentials: true,
  }),
);

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────
app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/listings", require("./routes/listings"));
app.use("/api/v1/bookings", require("./routes/bookings"));
app.use("/api/v1/reviews", require("./routes/reviews"));
app.use("/api/v1/admin", require("./routes/admin"));

// ── Health check ──────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "PG Hostel Finder API is running!" });
});

// ── Central error handler (must be last) ─────────────────────
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
