-- Phase 1: Foundation schema (users)
-- Later phases append: announcements, namaz_timings, admissions, donations, expenses

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(10) UNIQUE NOT NULL,       -- stored as 10-digit number, +91 is UI-only
  email VARCHAR(150),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL DEFAULT 'user', -- 'user' | 'admin'
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- Phase 2: Announcements, Namaz Timings, Masjid Info
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  image_url VARCHAR(500),
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS namaz_timings (
  id SERIAL PRIMARY KEY,
  fajr TIME NOT NULL,
  zuhr TIME NOT NULL,
  asr TIME NOT NULL,
  maghrib TIME NOT NULL,
  isha TIME NOT NULL,
  jumma TIME NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS masjid_info (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL DEFAULT 'Doctor Para Jame Masjid',
  address TEXT,
  contact_number VARCHAR(15),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 3: Deeniyat Admissions
CREATE TABLE IF NOT EXISTS admissions (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  father_name VARCHAR(100) NOT NULL,
  mother_name VARCHAR(100) NOT NULL,
  mobile_number VARCHAR(10) NOT NULL,
  email VARCHAR(150) NOT NULL,
  address TEXT NOT NULL,
  student_name VARCHAR(100) NOT NULL,
  student_age INT NOT NULL,
  fee_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status VARCHAR(10) NOT NULL DEFAULT 'pending', -- pending | paid
  payment_ref VARCHAR(100),
  token_id VARCHAR(20) UNIQUE,
  status VARCHAR(10) NOT NULL DEFAULT 'pending', -- pending | accepted | rejected
  admin_note TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 4: Donations
CREATE TABLE IF NOT EXISTS donations (
  id SERIAL PRIMARY KEY,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  donor_name VARCHAR(100),
  donor_phone VARCHAR(10),
  donor_address TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_ref VARCHAR(100),
  payment_status VARCHAR(10) NOT NULL DEFAULT 'pending', -- pending | paid
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Phase 5: Expenses
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  category VARCHAR(50) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  receipt_url VARCHAR(500),
  spent_on DATE NOT NULL,
  added_by INT REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admissions_status ON admissions(status);
CREATE INDEX IF NOT EXISTS idx_admissions_token ON admissions(token_id);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(payment_status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(spent_on);
