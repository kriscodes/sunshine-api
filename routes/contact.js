const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all contact form submissions
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM contact_us ORDER BY id");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new contact form submission
router.post("/", async (req, res) => {
  const { first_name, last_name, phone, email, reason } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO contact_us (first_name, last_name, phone, email, reason) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [first_name, last_name, phone, email, reason]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
