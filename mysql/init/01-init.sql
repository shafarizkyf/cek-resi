-- Initialize cek_resi database

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  display_name VARCHAR(255),
  photo_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS waybills (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  awb VARCHAR(100) NOT NULL,
  courier VARCHAR(50) NOT NULL,
  phone_number VARCHAR(20),
  polling_enabled BOOLEAN DEFAULT FALSE,
  polling_interval_hours INT DEFAULT 6,
  last_checked_at TIMESTAMP NULL,
  last_status VARCHAR(100),
  status_detail TEXT,
  has_update BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_waybill (user_id, awb, courier)
);

CREATE TABLE IF NOT EXISTS tracking_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  waybill_id INT NOT NULL,
  status VARCHAR(100),
  location VARCHAR(255),
  description TEXT,
  event_date TIMESTAMP,
  checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (waybill_id) REFERENCES waybills(id) ON DELETE CASCADE,
  INDEX idx_waybill_checked (waybill_id, checked_at)
);
