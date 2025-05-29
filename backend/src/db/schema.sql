-- Connect to graduation_db first!

-- Drop existing tables if they exist 
DROP TABLE IF EXISTS eligible_uploads CASCADE;
DROP TABLE IF EXISTS otps CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS registrations CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create tables with proper ownership

CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    program VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    eligibility_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL REFERENCES students(student_id),
    confirmation_id UUID DEFAULT gen_random_uuid(),
    form_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    user_name VARCHAR(100),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE otps (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL, 
    otp_code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_active_otp UNIQUE (student_id)
);

CREATE TABLE eligible_uploads (
    id SERIAL PRIMARY KEY,
    uploaded_by VARCHAR(100),
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_name VARCHAR(255)
);

-- Set ownership of tables to evans
ALTER TABLE students OWNER TO evans;
ALTER TABLE registrations OWNER TO evans;
ALTER TABLE audit_logs OWNER TO evans;
ALTER TABLE admin_users OWNER TO evans;
ALTER TABLE otps OWNER TO evans;
ALTER TABLE eligible_uploads OWNER TO evans;

-- Grant all privileges to evans
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO evans;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO evans;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO evans;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO evans;

SELECT student_id, name FROM students;



