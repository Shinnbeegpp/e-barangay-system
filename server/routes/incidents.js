const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, staffOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/', auth, upload.single('image'), async (req, res) => {
  const { title, description, location } = req.body;
  if (!title || !description || !location)
    return res.status(400).json({ message: 'All fields required' });
  try {
    const [profile] = await db.query(
      'SELECT verification_status FROM resident_profiles WHERE user_id = ?', [req.user.id]
    );
    if (!profile[0] || profile[0].verification_status !== 'verified')
      return res.status(403).json({ message: 'Account must be verified to file reports' });
    const image_url = req.file ? '/uploads/' + req.file.filename : null;
    await db.query(
      'INSERT INTO incident_reports (user_id, title, description, location, image_url) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, title, description, location, image_url]
    );
    res.status(201).json({ message: 'Report filed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/incidents/:id/cancel - resident cancels
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM incident_reports WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Report not found' });
    if (rows[0].status !== 'pending') return res.status(400).json({ message: 'Only pending reports can be cancelled' });
    await db.query('UPDATE incident_reports SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    res.json({ message: 'Report cancelled successfully' });
  } catch (err) {
    console.error('CANCEL ERROR:', err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM incident_reports WHERE user_id = ? ORDER BY reported_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT ir.*, u.first_name, u.last_name, u.email
       FROM incident_reports ir JOIN users u ON ir.user_id = u.id
       ORDER BY ir.reported_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', auth, staffOnly, async (req, res) => {
  const { status, staff_notes } = req.body;
  try {
    await db.query('UPDATE incident_reports SET status = ?, staff_notes = ? WHERE id = ?',
      [status, staff_notes, req.params.id]);
    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Incident Report Update', `Report #${req.params.id} set to ${status}`]);
    res.json({ message: 'Report updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;