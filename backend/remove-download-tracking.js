const { Pool } = require('pg');
require('dotenv').config();

// Database configuration from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/graduation_db'
});

async function removeDownloadTracking() {
  try {
    console.log('Removing download_tracking table...');
    
    const migrationSQL = `
      -- Drop download_tracking table if it exists
      DROP TABLE IF EXISTS download_tracking CASCADE;

      -- Log the migration
      INSERT INTO audit_logs (action, user_name, details) 
      VALUES ('MIGRATION', 'SYSTEM', 'Removed download_tracking table - download limit functionality disabled');
    `;

    await pool.query(migrationSQL);
    console.log('Migration completed successfully! Download tracking removed.');
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

removeDownloadTracking(); 