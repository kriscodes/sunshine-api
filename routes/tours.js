const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all tour requests
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tour ORDER BY tour_date, tour_time");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new tour request
router.post("/", async (req, res) => {
  const { parent_name, email, child_name, program, phone, tour_date, tour_time, school, notes } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO tour (parent_name , email, child_name, program, phone, tour_date, tour_time, school, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [parent_name, email, child_name, program, phone, tour_date, tour_time, school, notes]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
