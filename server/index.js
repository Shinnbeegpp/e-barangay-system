const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowed = [
      /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/,
    ];
    const vercelUrl = process.env.CLIENT_URL;
    if (vercelUrl && origin === vercelUrl) return callback(null, true);
    if (allowed.some(r => r.test(origin))) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
// Files served from Cloudinary

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/assistance', require('./routes/assistance'));
app.use('/api/incidents', require('./routes/incidents'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/staff', require('./routes/staff'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date() }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🏛️  E-Barangay Server running on port ${PORT}`);
  console.log(`📡  API: http://localhost:${PORT}/api`);
  console.log(`📱  Mobile: Use your local IP (e.g. http://192.168.x.x:${PORT})\n`);
});
