-- Clear existing data
TRUNCATE students, registrations, otps, audit_logs, admin_users, eligible_uploads RESTART IDENTITY CASCADE;

-- Insert students
INSERT INTO students (student_id, name, email, program, phone, eligibility_status) VALUES
('123456', 'John Doe', 'john.doe@st.gimpa.edu.gh', 'BSc Computer Science', '+233123456789', true),
('234567', 'Jane Smith', 'jane.smith@st.gimpa.edu.gh', 'BSc Information Technology', '+233234567890', true);

-- Insert test admin user
-- The password_hash below is a bcrypt hash for the password: admin123
INSERT INTO admin_users (username, password_hash, email) VALUES
('admin', '$2b$10$wH8QwQwQwQwQwQwQwQwQwOQwQwQwQwQwQwQwQwQwQwQwQwQwQw', 'admin@gimpa.edu.gh');

-- Add some audit logs for testing
INSERT INTO audit_logs (action, user_name, details) VALUES
('STUDENT_UPLOAD', 'admin', 'Uploaded 100 eligible students'),
('LOGIN_ATTEMPT', 'john.doe', 'Successful login'),
('REGISTRATION', '123456', 'Graduation registration completed');