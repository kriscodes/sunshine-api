const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY date, time");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new event
router.post("/", async (req, res) => {
  const { name, date, time, description, picture } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO events (name, date, time, description, picture) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, date, time, description, picture]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete event by ID
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.json({ message: "✅ Event deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
