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

// --- minimal fix: define normalizePayload used by PUT ---
function normalizePayload(body = {}) {
  // Accept both `name` (current Admin UI) and `title` (older code), prefer `name`
  const name = body.name ?? body.title ?? '';

  // If the UI sends an ISO datetime, trim to DATE-only (YYYY-MM-DD)
  let date = body.date ?? '';
  if (typeof date === 'string' && date.length > 10) {
    date = date.slice(0, 10);
  }

  return {
    name,
    date,
    location: body.location ?? '',
    description: body.description ?? '',
  };
}

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, date, location, description } = normalizePayload(req.body);

    if (!name || !date || !location || !description) {
      return res.status(400).json({ error: 'Missing required fields: name, date, location, description' });
    }

    // If the UI sends an ISO string, trim to YYYY-MM-DD for DATE columns
    const dateStr = typeof date === 'string' && date.length > 10 ? date.slice(0, 10) : date;

    // Update row
    const result = await pool.query(
  "UPDATE events SET name = $1, date = $2, location = $3, description = $4 WHERE id = $5",
  [name, dateStr, location, description, id]
);

    // mysql2 returns an object with affectedRows on UPDATE
    if (!result || result.affectedRows === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Return the updated record (optional but nice for the UI)
    //const [rows] = await pool.query("SELECT id, name, date, location, description FROM events WHERE id = ?", [id]);

    return res.status(200).json({id, name, date: dateStr, location, description });
  } catch (err) {
    console.error('PUT /events/:id error', err);
    return res.status(500).json({ error: 'Internal server error' });
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
