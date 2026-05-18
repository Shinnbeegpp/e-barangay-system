const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, staffOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/documents - resident creates request
router.post('/', auth, async (req, res) => {
  const { document_type, reason, mode } = req.body;

  try {
    // Check if resident is verified
    const [profile] = await db.query(
      'SELECT verification_status FROM resident_profiles WHERE user_id = ?', [req.user.id]
    );
    if (!profile[0] || profile[0].verification_status !== 'verified')
      return res.status(403).json({ message: 'Your account must be verified to request documents' });

    await db.query(
      'INSERT INTO document_requests (user_id, document_type, reason, mode) VALUES (?, ?, ?, ?)',
      [req.user.id, document_type, reason, mode]
    );

    res.status(201).json({ message: 'Document request submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/documents/my - resident gets their requests
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM document_requests WHERE user_id = ? ORDER BY requested_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/documents - staff gets all requests
router.get('/', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT dr.*, u.first_name, u.last_name, u.email, rp.profile_picture
       FROM document_requests dr 
       JOIN users u ON dr.user_id = u.id
       LEFT JOIN resident_profiles rp ON rp.user_id = u.id
       ORDER BY dr.requested_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/documents/:id/cancel - resident cancels
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM document_requests WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (!rows[0]) return res.status(404).json({ message: 'Request not found' });
    if (rows[0].status !== 'pending') return res.status(400).json({ message: 'Only pending requests can be cancelled' });
    await db.query('UPDATE document_requests SET status = ? WHERE id = ?', ['cancelled', req.params.id]);
    res.json({ message: 'Request cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/documents/:id - staff processes request
router.put('/:id', auth, staffOnly, upload.single('soft_copy'), async (req, res) => {
  const { status, denial_reason, pickup_date } = req.body;

  try {
    const updates = { status };
    if (denial_reason) updates.denial_reason = denial_reason;
    if (pickup_date) updates.pickup_date = pickup_date;
    if (req.file) updates.soft_copy_url = req.file.path;

    await db.query('UPDATE document_requests SET ? WHERE id = ?', [updates, req.params.id]);

    // Log transaction
    await db.query(
      'INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Document Request Update', `Request #${req.params.id} set to ${status}`]
    );

    res.json({ message: 'Document request updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
