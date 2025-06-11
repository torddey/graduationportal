-- Migration script to update confirmation_id column to accept custom GRAD format
-- Run this script to update existing database schema

-- First, drop the existing confirmation_id column
ALTER TABLE registrations DROP COLUMN confirmation_id;

-- Add the new confirmation_id column as VARCHAR
ALTER TABLE registrations ADD COLUMN confirmation_id VARCHAR(20) UNIQUE;

-- Add an index for faster lookups
CREATE INDEX idx_registrations_confirmation_id ON registrations(confirmation_id);

-- Update any existing registrations with new format (if any exist)
-- This is optional and only needed if you have existing data
-- UPDATE registrations SET confirmation_id = 'GRAD' || LPAD(id::text, 9, '0') WHERE confirmation_id IS NULL; 