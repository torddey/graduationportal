const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Database configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/graduation_db'
});

async function runMigration() {
  try {
    console.log('Running migration: Add download_tracking table...');
    
    const migrationSQL = `
      -- Create download_tracking table if it doesn't exist
      CREATE TABLE IF NOT EXISTS download_tracking (
          id SERIAL PRIMARY KEY,
          student_id VARCHAR(50) NOT NULL REFERENCES students(student_id),
          confirmation_id VARCHAR(20) NOT NULL,
          downloaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          ip_address VARCHAR(45),
          user_agent TEXT,
          UNIQUE(student_id)
      );

      -- Add index for better performance
      CREATE INDEX IF NOT EXISTS idx_download_tracking_student_id ON download_tracking (student_id);
      CREATE INDEX IF NOT EXISTS idx_download_tracking_downloaded_at ON download_tracking (downloaded_at);

      -- Log the migration
      INSERT INTO audit_logs (action, user_name, details) 
      VALUES ('MIGRATION', 'SYSTEM', 'Added download_tracking table to prevent multiple PDF downloads per student');
    `;

    await pool.query(migrationSQL);
    console.log('Migration completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

runMigration(); 