const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// GET /api/profile - get my profile
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, p.*
       FROM users u LEFT JOIN resident_profiles p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );
    res.json(rows[0] || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile - update and submit profile for verification
router.put('/', auth, (req, res, next) => {
  upload.fields([{ name: 'profile_picture' }, { name: 'valid_id' }])(req, res, (err) => {
    if (err) {
      console.error('Upload middleware error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('Profile update hit. Body keys:', Object.keys(req.body));
    console.log('Files:', req.files);
    const {
      middle_name, suffix, gender, civil_status, date_of_birth, nationality, religion,
      mobile_number, emergency_contact_person, emergency_contact_number,
      house_number, street_purok_sitio
    } = req.body;

    const dob = new Date(date_of_birth);
    const age = new Date().getFullYear() - dob.getFullYear();

    const updates = {
      middle_name, suffix, gender, civil_status, date_of_birth, age, nationality, religion,
      mobile_number, emergency_contact_person, emergency_contact_number,
      house_number, street_purok_sitio,
      verification_status: 'pending',
      submitted_at: new Date()
    };

    if (req.files?.profile_picture) updates.profile_picture = req.files.profile_picture[0].path;
    if (req.files?.valid_id) updates.valid_id = req.files.valid_id[0].path;

    console.log('User ID:', req.user.id);
    console.log('Updates object:', updates);
    const [result] = await db.query('UPDATE resident_profiles SET ? WHERE user_id = ?', [updates, req.user.id]);
    console.log('Update result:', result);
    
    await db.query('UPDATE users SET first_name = ?, last_name = ? WHERE id = ?',
      [req.body.first_name || req.user.first_name, req.body.last_name || req.user.last_name, req.user.id]);

    res.json({ message: 'Profile submitted for verification' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/profile/settings - update email/password
router.put('/settings', auth, async (req, res) => {
  const { email, current_password, new_password } = req.body;
  const bcrypt = require('bcryptjs');

  try {
    const [users] = await db.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (current_password) {
      const match = await bcrypt.compare(current_password, user.password);
      if (!match) return res.status(400).json({ message: 'Current password is incorrect' });
      if (new_password) {
        const hashed = await bcrypt.hash(new_password, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);
      }
    }

    if (email && email !== user.email) {
      const [ex] = await db.query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.user.id]);
      if (ex.length > 0) return res.status(400).json({ message: 'Email already in use' });
      await db.query('UPDATE users SET email = ? WHERE id = ?', [email, req.user.id]);
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
