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

## 👥 User Roles

| Role | How to Create | Access |
|------|--------------|--------|
| Resident | Self-register via /register | Resident Portal |
| Staff | Admin creates via Admin Accounts page | Staff Portal |
| Admin | Created directly in DB (schema.sql) | Full Staff + Admin Portal |


