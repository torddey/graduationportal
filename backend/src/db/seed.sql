-- Clear existing data
TRUNCATE students, registrations, otps, audit_logs, admin_users, eligible_uploads RESTART IDENTITY CASCADE;

-- Insert test students
INSERT INTO students (student_id, name, email, program, phone, eligibility_status) VALUES
('123456', 'John Doe', 'john.doe@st.gimpa.edu.gh', 'BSc Computer Science', '+233123456789', true),
('234567', 'Jane Smith', 'jane.smith@st.gimpa.edu.gh', 'BSc Information Technology', '+233234567890', true),
('345678', 'Mark Johnson', 'mark.johnson@st.gimpa.edu.gh', 'BSc Business Admin', '+233345678901', true),
('456789', 'Sarah Williams', 'sarah.williams@st.gimpa.edu.gh', 'BSc Accounting', '+233456789012', false);

-- Insert test audit logs
INSERT INTO audit_logs (action, user_name, details) VALUES
('STUDENT_UPLOAD', 'admin', 'Uploaded 100 eligible students'),
('LOGIN_ATTEMPT', 'john.doe', 'Successful login'),
('REGISTRATION', '123456', 'Graduation registration completed');