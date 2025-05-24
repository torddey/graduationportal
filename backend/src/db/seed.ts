import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seed() {
  try {
    const seedSQL = fs.readFileSync(
      path.join(__dirname, 'seed.sql'),
      'utf8'
    );

    await pool.query(seedSQL);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
  } finally {
    await pool.end();
  }
}

seed();