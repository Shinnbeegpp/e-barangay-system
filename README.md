# 🏛️ E-Barangay Management System
**Barangay Tinurik, Tanauan City, Batangas**

A full-stack MERN (MySQL + Express + React + Node.js) barangay management system.

---

## 📋 Prerequisites
- Node.js v16+
- MySQL Server (local)
- MySQL Workbench (recommended)

---

## 🛠️ Setup Instructions

### Step 1: Database Setup
1. Open **MySQL Workbench**
2. Connect to your local MySQL server
3. Open and run the file: `server/config/schema.sql`
4. This creates the `ebarangay` database with all tables and a default admin account

**Default Admin Login:**
- Email: `admin@ebarangay.com`
- Password: `password`
> ⚠️ Change this password immediately after first login!

### Step 2: Configure Backend
1. Edit `server/.env`:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD_HERE
DB_NAME=ebarangay
JWT_SECRET=ebarangay_super_secret_jwt_key_2024
CLIENT_URL=http://localhost:5173
```

### Step 3: Install & Start Backend
```bash
cd server
npm install
node index.js
```
Server runs at: http://localhost:5000

### Step 4: Install & Start Frontend
```bash
cd client
npm install
npm run dev
```
App runs at: http://localhost:5173

---

## 📱 Mobile Access (Phone Browser)
1. Make sure your phone is on the **same WiFi** as your computer
2. Find your computer's local IP:
   - Windows: Run `ipconfig` → look for IPv4 Address (e.g. 192.168.1.5)
   - Mac/Linux: Run `ifconfig` or `ip addr`
3. On your phone browser, open: `http://192.168.1.5:5173`

> The Vite server is already configured with `host: '0.0.0.0'` for network access.

---

## 👥 User Roles

| Role | How to Create | Access |
|------|--------------|--------|
| Resident | Self-register via /register | Resident Portal |
| Staff | Admin creates via Admin Accounts page | Staff Portal |
| Admin | Created directly in DB (schema.sql) | Full Staff + Admin Portal |

---

## 📁 Project Structure
```
ebarangay/
├── server/
│   ├── config/
│   │   ├── db.js          # MySQL connection pool
│   │   └── schema.sql     # Database schema (run this first!)
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   └── upload.js      # Multer file upload
│   ├── routes/
│   │   ├── auth.js        # Login & Register
│   │   ├── profile.js     # Resident profile
│   │   ├── documents.js   # Document requests
│   │   ├── assistance.js  # Assistance programs
│   │   ├── incidents.js   # Incident reports
│   │   ├── announcements.js
│   │   └── staff.js       # Staff management
│   ├── uploads/           # Uploaded files (auto-created)
│   ├── index.js           # Express server entry
│   └── .env               # Environment variables
│
└── client/
    └── src/
        ├── api/axios.js       # API configuration
        ├── context/AuthContext.jsx
        ├── components/
        │   ├── ResidentLayout.jsx
        │   ├── StaffLayout.jsx
        │   └── Badge.jsx
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── resident/      # All resident pages
            └── staff/         # All staff pages
```

---

## 🔧 Troubleshooting

**"Can't connect to MySQL"**
→ Check DB_PASSWORD in server/.env matches your MySQL root password

**"Port 5000 already in use"**
→ Change PORT in server/.env

**Mobile can't connect**
→ Check Windows Firewall allows port 5173 and 5000 for private networks

**File uploads not working**
→ The `server/uploads/` folder is auto-created on first run

