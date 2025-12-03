-- Database initialization script for ankieta_db
-- Run this on mariadb-cloud (10.10.9.191) as root or admin user

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS ankieta_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user if not exists
CREATE USER IF NOT EXISTS 'ankieta_user'@'%' IDENTIFIED BY 'zaq1@WSXDupa';

-- Grant privileges
GRANT ALL PRIVILEGES ON ankieta_db.* TO 'ankieta_user'@'%';
FLUSH PRIVILEGES;

-- Use the database
USE ankieta_db;

-- Create survey_responses table
CREATE TABLE IF NOT EXISTS survey_responses (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  profession VARCHAR(255) NOT NULL,
  experience VARCHAR(255) NOT NULL,
  ai_areas TEXT NOT NULL COMMENT 'JSON array of selected AI areas',
  challenge VARCHAR(500) NOT NULL,
  expectations VARCHAR(500) NOT NULL,
  time_spent VARCHAR(100) NOT NULL,
  frustration TEXT NOT NULL,
  data_consent BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create index for faster searches
CREATE INDEX idx_profession ON survey_responses(profession);
CREATE INDEX idx_experience ON survey_responses(experience);
