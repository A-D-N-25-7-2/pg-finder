const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const connectDB = require("./config/db");


dotenv.config();


connectDB();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());


app.use("/api/v1/auth", require("./routes/auth"));
app.use("/api/v1/listings", require("./routes/listings"));
app.use("/api/v1/bookings", require("./routes/bookings"));
app.use("/api/v1/reviews", require("./routes/reviews"));
app.use("/api/v1/admin", require("./routes/admin"));


app.get("/", (req, res) => {
  res.json({ message: "PG Hostel Finder API is running!" });
});


app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
