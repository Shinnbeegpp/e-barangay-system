const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { auth, staffOnly, adminOnly } = require('../middleware/auth');

// GET /api/staff/verification - pending verifications
router.get('/verification', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, p.*
       FROM resident_profiles p JOIN users u ON p.user_id = u.id
       WHERE p.verification_status = 'pending'
       ORDER BY p.submitted_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/staff/verification/:userId
router.put('/verification/:userId', auth, staffOnly, async (req, res) => {
  const { action, denial_reason } = req.body; // action: 'approved' | 'denied'
  try {
    const updates = {
      verification_status: action === 'approve' ? 'verified' : 'denied',
      denial_reason: action === 'deny' ? denial_reason : null
    };
    if (action === 'approve') updates.verified_at = new Date();

    await db.query('UPDATE resident_profiles SET ? WHERE user_id = ?', [updates, req.params.userId]);
    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Account Verification', `User #${req.params.userId} ${updates.verification_status}`]);

    res.json({ message: `Account ${updates.verification_status}` });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/staff/residents - all verified residents
router.get('/residents', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.created_at, p.*
       FROM users u LEFT JOIN resident_profiles p ON u.id = p.user_id
       WHERE u.role = 'resident' AND p.verification_status = 'verified'
       ORDER BY u.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/staff/accounts - all staff/admin accounts
router.get('/accounts', auth, adminOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT id, email, first_name, last_name, role, is_active, created_at
       FROM users WHERE role IN ('staff','admin') ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/staff/accounts - admin creates staff account
router.post('/accounts', auth, adminOnly, async (req, res) => {
  const { email, first_name, last_name, password, role } = req.body;
  try {
    const [ex] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (ex.length > 0) return res.status(400).json({ message: 'Email already in use' });

    const hashed = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, first_name, last_name, role || 'staff']);

    await db.query('INSERT INTO transaction_logs (staff_id, action, details) VALUES (?, ?, ?)',
      [req.user.id, 'Account Created', `Created ${role || 'staff'} account: ${email}`]);

    res.status(201).json({ message: 'Staff account created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/staff/accounts/:id/toggle - activate/deactivate
router.put('/accounts/:id/toggle', auth, adminOnly, async (req, res) => {
  try {
    await db.query('UPDATE users SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    res.json({ message: 'Account status toggled' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/staff/logs
router.get('/logs', auth, staffOnly, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT tl.*, u.first_name, u.last_name FROM transaction_logs tl
       JOIN users u ON tl.staff_id = u.id ORDER BY tl.performed_at DESC LIMIT 200`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/staff/dashboard-stats
router.get('/dashboard-stats', auth, staffOnly, async (req, res) => {
  try {
    const [[verif]] = await db.query("SELECT COUNT(*) as count FROM resident_profiles WHERE verification_status = 'pending'");
    const [[docs]] = await db.query("SELECT COUNT(*) as count FROM document_requests WHERE status = 'pending'");
    const [[assist]] = await db.query("SELECT COUNT(*) as count FROM assistance_applications WHERE status = 'pending'");
    const [[reports]] = await db.query("SELECT COUNT(*) as count FROM incident_reports WHERE status = 'pending'");
    res.json({
      pendingVerifications: verif.count,
      pendingDocuments: docs.count,
      pendingAssistance: assist.count,
      pendingReports: reports.count
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
