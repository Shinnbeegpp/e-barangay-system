const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, staffOnly } = require('../middleware/auth');

// GET /api/announcements - all active (residents see this too)
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.first_name, u.last_name FROM announcements a
       JOIN users u ON a.staff_id = u.id
       WHERE a.is_active = TRUE ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/announcements/all - staff sees all including inactive
router.get('/all', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT a.*, u.first_name, u.last_name FROM announcements a
       JOIN users u ON a.staff_id = u.id ORDER BY a.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/announcements - staff creates
router.post('/', auth, staffOnly, async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: 'Title and content required' });

  try {
    await db.query(
      'INSERT INTO announcements (staff_id, title, content) VALUES (?, ?, ?)',
      [req.user.id, title, content]
    );
    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Announcement Created', title]);
    res.status(201).json({ message: 'Announcement published' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/announcements/:id
router.put('/:id', auth, staffOnly, async (req, res) => {
  const { title, content, is_active } = req.body;
  try {
    await db.query('UPDATE announcements SET title = ?, content = ?, is_active = ? WHERE id = ?',
      [title, content, is_active, req.params.id]);
    res.json({ message: 'Announcement updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/announcements/:id
router.delete('/:id', auth, staffOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM announcements WHERE id = ?', [req.params.id]);
    res.json({ message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
