const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, first_name, last_name, password, confirm_password } = req.body;

  if (!email || !first_name || !last_name || !password || !confirm_password)
    return res.status(400).json({ message: 'All fields are required' });

  if (password !== confirm_password)
    return res.status(400).json({ message: 'Passwords do not match' });

  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });

  try {
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0)
      return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)',
      [email, hashed, first_name, last_name, 'resident']
    );

    // Create empty profile
    await db.query('INSERT INTO resident_profiles (user_id) VALUES (?)', [result.insertId]);

    res.status(201).json({ message: 'Account created successfully. Please login.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0)
      return res.status(401).json({ message: 'Invalid email or password' });

    const user = users[0];
    if (!user.is_active)
      return res.status(401).json({ message: 'Account is deactivated' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res.status(401).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role, first_name: user.first_name, last_name: user.last_name }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
