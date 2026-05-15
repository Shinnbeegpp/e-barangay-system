const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, process.env.DB_CA_CERT)),
    rejectUnauthorized: true,
  },
});

// Test connection on startup
pool.getConnection()
  .then(conn => {
    console.log('✅ Connected to Aiven MySQL successfully!');
    conn.release();
  })
  .catch(err => {
    console.error('❌ MySQL connection failed:', err.message);
  });

module.exports = pool;