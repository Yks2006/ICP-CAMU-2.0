-- CAMU 2.0 Portal Database (v2)
-- Import this file in phpMyAdmin (Import tab) or run in the SQL tab.
-- This replaces the previous schema. Existing users data will be reset.

CREATE DATABASE IF NOT EXISTS camu_portal
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE camu_portal;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  student_id VARCHAR(32) NOT NULL,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NULL DEFAULT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  student_status ENUM('Active', 'Inactive', 'Suspended', 'Graduated') NOT NULL DEFAULT 'Active',
  degree_level VARCHAR(100) NOT NULL,
  department VARCHAR(255) NOT NULL,
  program_name VARCHAR(500) NOT NULL,
  institution VARCHAR(255) NOT NULL DEFAULT 'University of Wollongong Malaysia',
  password_set_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_student_id (student_id),
  UNIQUE KEY uq_users_email (email),
  INDEX idx_users_email (email),
  INDEX idx_users_student_id (student_id),
  INDEX idx_users_role (role)
);

-- Local seed data (replace with your own accounts before use)
-- Generate a password hash locally with:
--   npm run hash:password -- "your-secure-password"
--
-- Example admin insert (replace <password_hash> with output from the command above):
-- INSERT INTO users (
--   student_id, email, password_hash, full_name, role, student_status,
--   degree_level, department, program_name, institution, password_set_at
-- ) VALUES (
--   'ADMIN001', 'admin@student.uow.edu.my', '<password_hash>', 'System Administrator',
--   'admin', 'Active', 'N/A', 'Administration', 'System Administration',
--   'University of Wollongong Malaysia', CURRENT_TIMESTAMP
-- );
--
-- Example student insert (no password yet; student activates on first login):
-- INSERT INTO users (
--   student_id, email, password_hash, full_name, role, student_status,
--   degree_level, department, program_name, institution
-- ) VALUES (
--   'STUDENT001', 'student001@student.uow.edu.my', NULL, 'Demo Student',
--   'student', 'Active', 'Bachelor', 'School of Computing',
--   'Bachelor of Information Systems (Honours)(Enterprise Information Systems)',
--   'University of Wollongong Malaysia'
-- );
