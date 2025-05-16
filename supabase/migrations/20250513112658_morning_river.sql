-- Active: 1747049435817@@127.0.0.1@5432@postgres
/*
  # Initial schema setup for graduation portal

  1. New Tables
    - `students`: Stores eligible student information
    - `registrations`: Stores graduation ceremony registrations
    - `audit_logs`: Tracks system activities

  2. Triggers
    - Automatic `updated_at` timestamp updates
    
  3. Indexes
    - Optimized queries for common lookups
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  program TEXT NOT NULL,
  faculty TEXT NOT NULL,
  gpa NUMERIC(3,2),
  is_eligible BOOLEAN DEFAULT false,
  graduation_term TEXT NOT NULL,
  completed_credits INTEGER NOT NULL,
  required_credits INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  confirmation_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  emergency_contact_name TEXT NOT NULL,
  emergency_contact_relationship TEXT NOT NULL,
  emergency_contact_phone TEXT NOT NULL,
  guest_count INTEGER NOT NULL DEFAULT 2,
  special_requirements TEXT,
  pronounce_name TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  user_id UUID,
  details JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create updated_at trigger function if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at') THEN
    CREATE FUNCTION update_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = CURRENT_TIMESTAMP;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  END IF;
END $$;

-- Create triggers only if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_students_updated_at') THEN
    CREATE TRIGGER update_students_updated_at
      BEFORE UPDATE ON students
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_registrations_updated_at') THEN
    CREATE TRIGGER update_registrations_updated_at
      BEFORE UPDATE ON registrations
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_students_student_id ON students(student_id);
CREATE INDEX IF NOT EXISTS idx_registrations_student_id ON registrations(student_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Students are editable by admins only"
  ON students
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Students are viewable by authenticated users"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins have full access to registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);

CREATE POLICY "Users can insert their own registration"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM students WHERE student_id = (auth.jwt() ->> 'student_id'::text)
  ));

CREATE POLICY "Users can view their own registration"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students WHERE student_id = (auth.jwt() ->> 'student_id'::text)
  ));

CREATE POLICY "Audit logs are insertable by authenticated users"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Audit logs are viewable by admins only"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);