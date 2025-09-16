const express = require('express');
const router = express.Router();
const db = require('../db'); // must expose .query(sql, params, cb)

// ---- helpers --------------------------------------------------------------

function normalizePayload(body = {}) {
  return {
    // Admin UI may send `name` (preferred) or `title` (older code). Use either.
    nameOrTitle: body.name ?? body.title ?? '',
    date: body.date ?? '',
    location: body.location ?? '',
    description: body.description ?? '',
  };
}

function toDateOnly(d) {
  if (!d) return '';
  if (typeof d === 'string') return d.length > 10 ? d.slice(0, 10) : d;
  try { return new Date(d).toISOString().slice(0, 10); } catch { return ''; }
}

// ---- GET /events/:id (for quick curl tests) -------------------------------

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  db.query('SELECT * FROM `events` WHERE id = ?', [id], (err, rows) => {
    if (err) {
      console.error('GET /events/:id error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(rows[0]);
  });
});

// ---- PUT /events/:id ------------------------------------------------------

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ error: 'Invalid event id' });
  }

  const payload = normalizePayload(req.body);
  const dateOnly = toDateOnly(payload.date);

  // Discover columns so we can safely update either `name` or `title`
  db.query('SHOW COLUMNS FROM `events`', [], (cErr, cols) => {
    if (cErr) {
      console.error('SHOW COLUMNS error:', cErr);
      return res.status(500).json({ error: 'Database error (columns)' });
    }

    const has = (col) => Array.isArray(cols) && cols.some((c) => c.Field === col);

    const sets = [];
    const params = [];

    // Update whichever naming your table uses
    if (has('name'))  { sets.push('`name` = ?');  params.push(payload.nameOrTitle); }
    if (has('title')) { sets.push('`title` = ?'); params.push(payload.nameOrTitle); }

    if (has('date'))        { sets.push('`date` = ?');        params.push(dateOnly); }
    if (has('location'))    { sets.push('`location` = ?');    params.push(payload.location); }
    if (has('description')) { sets.push('`description` = ?'); params.push(payload.description); }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No updatable fields found on events table' });
    }

    const sql = `UPDATE \`events\` SET ${sets.join(', ')} WHERE id = ?`;
    params.push(id);

    db.query(sql, params, (uErr, result) => {
      if (uErr) {
        console.error('PUT /events/:id UPDATE error:', uErr, '\nSQL:', sql, '\nParams:', params);
        return res.status(500).json({ error: 'Database error (update)' });
      }

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ error: 'Event not found' });
      }

      db.query('SELECT * FROM `events` WHERE id = ?', [id], (sErr, rows) => {
        if (sErr) {
          console.error('SELECT after update error:', sErr);
          return res.status(500).json({ error: 'Database error (select)' });
        }
        return res.status(200).json(rows && rows[0] ? rows[0] : { id });
      });
    });
  });
});

module.exports = router;
