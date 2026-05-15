-- E-Barangay Management System Database Schema
-- Run this file in MySQL Workbench or via mysql CLI

CREATE DATABASE IF NOT EXISTS ebarangay;
USE ebarangay;

-- Users table (residents + staff)
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role ENUM('resident', 'staff', 'admin') DEFAULT 'resident',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Resident profiles table
CREATE TABLE IF NOT EXISTS resident_profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  -- Basic Personal Info
  middle_name VARCHAR(100),
  suffix VARCHAR(20),
  gender ENUM('Male','Female','Other'),
  civil_status ENUM('Single','Married','Widowed','Separated','Divorced'),
  date_of_birth DATE,
  age INT,
  nationality VARCHAR(100) DEFAULT 'Filipino',
  religion VARCHAR(100),
  profile_picture VARCHAR(500),
  valid_id VARCHAR(500),
  -- Contact Info
  mobile_number VARCHAR(20),
  emergency_contact_person VARCHAR(200),
  emergency_contact_number VARCHAR(20),
  -- Address
  house_number VARCHAR(50),
  street_purok_sitio VARCHAR(200),
  barangay VARCHAR(100) DEFAULT 'Tinurik',
  municipality VARCHAR(100) DEFAULT 'Tanauan City',
  zip_code VARCHAR(10) DEFAULT '4232',
  -- Verification
  verification_status ENUM('unverified','pending','verified','denied') DEFAULT 'unverified',
  denial_reason TEXT,
  submitted_at TIMESTAMP NULL,
  verified_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Document requests
CREATE TABLE IF NOT EXISTS document_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  document_type ENUM('Barangay Clearance','Certificate of Residency','Certificate of Indigency','Barangay ID') NOT NULL,
  reason TEXT NOT NULL,
  mode ENUM('soft_copy','pickup') NOT NULL,
  status ENUM('pending','processing','ready','completed','denied') DEFAULT 'pending',
  denial_reason TEXT,
  pickup_date DATETIME NULL,
  soft_copy_url VARCHAR(500) NULL,
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assistance programs config
CREATE TABLE IF NOT EXISTS assistance_programs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  program_type ENUM('medical','educational') UNIQUE NOT NULL,
  is_locked BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO assistance_programs (program_type, is_locked) VALUES ('medical', FALSE), ('educational', FALSE);

-- Assistance applications
CREATE TABLE IF NOT EXISTS assistance_applications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  program_type ENUM('medical','educational') NOT NULL,
  status ENUM('pending','approved','denied') DEFAULT 'pending',
  denial_reason TEXT,
  -- Medical fields
  medical_abstract VARCHAR(500),
  medical_bill VARCHAR(500),
  -- Educational fields
  enrollment_certificate VARCHAR(500),
  grades_file VARCHAR(500),
  school_id VARCHAR(500),
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Incident reports
CREATE TABLE IF NOT EXISTS incident_reports (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(500) NOT NULL,
  status ENUM('pending','reviewed','resolved') DEFAULT 'pending',
  staff_notes TEXT,
  reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Transaction logs
CREATE TABLE IF NOT EXISTS transaction_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id INT NOT NULL,
  action VARCHAR(255) NOT NULL,
  details TEXT,
  performed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Default admin account (password: Admin@123)
INSERT IGNORE INTO users (email, password, first_name, last_name, role)
VALUES ('admin@ebarangay.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Super', 'Admin', 'admin');
-- NOTE: Default password is 'password' - change this immediately after first login!
-- To use Admin@123, run: node -e "const b=require('bcryptjs');b.hash('Admin@123',10).then(h=>console.log(h))"
