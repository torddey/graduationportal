/*
  # Initial schema for graduation portal

  1. New Tables
    - `students`
      - `id` (uuid, primary key)
      - `student_id` (text, unique)
      - `name` (text)
      - `email` (text)
      - `program` (text)
      - `faculty` (text)
      - `gpa` (numeric)
      - `is_eligible` (boolean)
      - `graduation_term` (text)
      - `completed_credits` (integer)
      - `required_credits` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `registrations`
      - `id` (uuid, primary key)
      - `student_id` (uuid, references students)
      - `confirmation_id` (text, unique)
      - `name` (text)
      - `email` (text)
      - `phone` (text)
      - `address` (text)
      - `postal_code` (text)
      - `city` (text)
      - `country` (text)
      - `emergency_contact_name` (text)
      - `emergency_contact_relationship` (text)
      - `emergency_contact_phone` (text)
      - `guest_count` (integer)
      - `special_requirements` (text)
      - `pronounce_name` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `audit_logs`
      - `id` (uuid, primary key)
      - `action` (text)
      - `user_id` (uuid, references auth.users)
      - `details` (jsonb)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add policies for admin access
*/

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  program text NOT NULL,
  faculty text NOT NULL,
  gpa numeric(3,2),
  is_eligible boolean DEFAULT false,
  graduation_term text NOT NULL,
  completed_credits integer NOT NULL,
  required_credits integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  confirmation_id text UNIQUE NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  postal_code text NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  emergency_contact_name text NOT NULL,
  emergency_contact_relationship text NOT NULL,
  emergency_contact_phone text NOT NULL,
  guest_count integer NOT NULL DEFAULT 2,
  special_requirements text,
  pronounce_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit_logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for students table
CREATE POLICY "Students are viewable by authenticated users"
  ON students
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students are editable by admins only"
  ON students
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for registrations table
CREATE POLICY "Users can view their own registration"
  ON registrations
  FOR SELECT
  TO authenticated
  USING (student_id IN (
    SELECT id FROM students 
    WHERE student_id = (auth.jwt() ->> 'student_id')
  ));

CREATE POLICY "Users can insert their own registration"
  ON registrations
  FOR INSERT
  TO authenticated
  WITH CHECK (student_id IN (
    SELECT id FROM students 
    WHERE student_id = (auth.jwt() ->> 'student_id')
  ));

CREATE POLICY "Admins have full access to registrations"
  ON registrations
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Policies for audit_logs table
CREATE POLICY "Audit logs are viewable by admins only"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Audit logs are insertable by authenticated users"
  ON audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_students_updated_at
  BEFORE UPDATE ON students
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();