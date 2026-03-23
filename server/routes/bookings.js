const express = require("express");
const router = express.Router();

// Placeholder — routes will be added from Day 2
router.get("/test", (req, res) => {
  res.json({ success: true, message: "Route working" });
});

module.exports = router;
