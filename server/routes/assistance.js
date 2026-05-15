const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth, staffOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/assistance/programs - get program lock status
router.get('/programs', auth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM assistance_programs');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/assistance/programs/:type - staff toggles lock
router.put('/programs/:type', auth, staffOnly, async (req, res) => {
  const { is_locked } = req.body;
  try {
    await db.query('UPDATE assistance_programs SET is_locked = ? WHERE program_type = ?',
      [is_locked, req.params.type]);
    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Assistance Program Toggle', `${req.params.type} set to ${is_locked ? 'locked' : 'unlocked'}`]);
    res.json({ message: 'Program status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/assistance - resident applies
router.post('/', auth, upload.fields([
  { name: 'medical_abstract' }, { name: 'medical_bill' },
  { name: 'enrollment_certificate' }, { name: 'grades_file' }, { name: 'school_id' }
]), async (req, res) => {
  const { program_type } = req.body;

  try {
    // Check verified
    const [profile] = await db.query(
      'SELECT verification_status FROM resident_profiles WHERE user_id = ?', [req.user.id]
    );
    if (!profile[0] || profile[0].verification_status !== 'verified')
      return res.status(403).json({ message: 'Account must be verified' });

    // Check program is unlocked
    const [prog] = await db.query('SELECT is_locked FROM assistance_programs WHERE program_type = ?', [program_type]);
    if (!prog[0] || prog[0].is_locked)
      return res.status(403).json({ message: 'This assistance program is currently unavailable' });

    const data = { user_id: req.user.id, program_type };
    if (req.files) {
      for (const [key, files] of Object.entries(req.files)) {
        data[key] = '/uploads/' + files[0].filename;
      }
    }

    await db.query('INSERT INTO assistance_applications SET ?', [data]);
    res.status(201).json({ message: 'Application submitted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/assistance/my - resident's own applications
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM assistance_applications WHERE user_id = ? ORDER BY applied_at DESC',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/assistance - staff gets all (filter by type)
router.get('/', auth, staffOnly, async (req, res) => {
  const { type } = req.query;
  try {
    let query = `SELECT aa.*, u.first_name, u.last_name, u.email
                 FROM assistance_applications aa JOIN users u ON aa.user_id = u.id`;
    const params = [];
    if (type) { query += ' WHERE aa.program_type = ?'; params.push(type); }
    query += ' ORDER BY aa.applied_at DESC';
    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/assistance/:id - staff processes application
router.put('/:id', auth, staffOnly, async (req, res) => {
  const { status, denial_reason } = req.body;
  try {
    await db.query('UPDATE assistance_applications SET status = ?, denial_reason = ? WHERE id = ?',
      [status, denial_reason || null, req.params.id]);
    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Assistance Application Update', `Application #${req.params.id} set to ${status}`]);
    res.json({ message: 'Application updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
