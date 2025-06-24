const { Client } = require('pg');
require('dotenv').config();

const client = process.env.DATABASE_URL
  ? new Client({ connectionString: process.env.DATABASE_URL })
  : new Client({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'graduation_db',
    });

async function resetDatabase() {
  try {
    await client.connect();
    console.log('Dropping all tables...');
    // Drop tables in an order that respects dependencies, or use CASCADE
    await client.query(`
      DROP TABLE IF EXISTS schema_migrations CASCADE;
      DROP TABLE IF EXISTS admin_otps CASCADE;
      DROP TABLE IF EXISTS download_tracking CASCADE;
      DROP TABLE IF EXISTS eligible_uploads CASCADE;
      DROP TABLE IF EXISTS otps CASCADE;
      DROP TABLE IF EXISTS admin_users CASCADE;
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS registrations CASCADE;
      DROP TABLE IF EXISTS students CASCADE;
      DROP TABLE IF EXISTS settings CASCADE;
    `);
    console.log('All tables dropped successfully.');
  } catch (err) {
    console.error('Failed to reset database:', err);
  } finally {
    await client.end();
  }
}

resetDatabase(); 