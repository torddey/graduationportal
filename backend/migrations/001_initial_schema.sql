-- Drop existing tables if they exist 
DROP TABLE IF EXISTS eligible_uploads CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS students CASCADE;
DROP TABLE IF EXISTS settings CASCADE;

-- Create students table
CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id INTEGER UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    school VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    program VARCHAR(100) NOT NULL,
    course VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    phone VARCHAR(20),
    address VARCHAR(255),
    postalCode VARCHAR(20),
    city VARCHAR(100),
    country VARCHAR(100),
    eligibility_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_students_student_id ON students (student_id);

-- Create registrations table
CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(student_id),
    school VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    program VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    course VARCHAR(100) NOT NULL DEFAULT 'UNKNOWN',
    confirmation_id VARCHAR(20) UNIQUE,
    form_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id),
    dignitaries TEXT,
    special_requirements TEXT
);

-- Create audit_logs table
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_name VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create admin_users table with role
CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create otps table
CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL, 
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_active_otp UNIQUE (student_id)
);

-- Create eligible_uploads table
CREATE TABLE eligible_uploads (
    id SERIAL PRIMARY KEY,
    uploaded_by VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(255),
    errors_count INTEGER DEFAULT 0
);

-- Create settings table
CREATE TABLE settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT INTO settings (key, value, description) VALUES
('registration_deadline', '2025-07-04T23:59:59', 'Registration deadline for graduation ceremony'),
('gown_return_deadline', '2025-08-08T23:59:59', 'Deadline for returning graduation gowns'),
('gown_collection_deadline', '2025-05-10T14:00:00', 'Deadline for collecting graduation gowns'),
('ceremony_date', '2025-05-15T10:00:00', 'Date and time of graduation ceremony'),
('ceremony_location', 'GIMPA Main Campus Auditorium', 'Location of graduation ceremony')
ON CONFLICT (key) DO NOTHING;

-- Insert seeded superadmin
INSERT INTO admin_users (username, password_hash, email, role) VALUES
('admin', '$2b$10$wH8QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'admin@gimpa.edu.gh', 'superadmin');

-- Create admin_otps table
CREATE TABLE admin_otps (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_active_admin_otp UNIQUE (admin_id)
); 