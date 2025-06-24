const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config();

// Database configuration from environment variables
const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/graduation_db",
});

const migrationsDir = path.join(__dirname, "migrations");

const client = process.env.DATABASE_URL
  ? new Client({ connectionString: process.env.DATABASE_URL })
  : new Client({
      host: process.env.PGHOST || "localhost",
      port: process.env.PGPORT ? parseInt(process.env.PGPORT, 10) : 5432,
      user: process.env.PGUSER || "postgres",
      password: process.env.PGPASSWORD || "",
      database: process.env.PGDATABASE || "graduation_db",
    });

async function runMigrations() {
  try {
    await client.connect();

    // 1. Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Get already run migrations
    const { rows } = await client.query(
      "SELECT migration_name FROM schema_migrations",
    );
    const completedMigrations = rows.map((r) => r.migration_name);

    const files = fs
      .readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (completedMigrations.includes(file)) {
        console.log(`Skipping already run migration: ${file}`);
        continue;
      }

      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");
      console.log(`Running migration: ${file}`);

      // Run migration in a transaction
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO schema_migrations (migration_name) VALUES ($1)",
          [file],
        );
        await client.query("COMMIT");
        console.log(`Migration ${file} completed.`);
      } catch (err) {
        await client.query("ROLLBACK");
        console.error(`Migration ${file} failed. Rolling back.`);
        throw err; // re-throw error to be caught by outer catch block
      }
    }
    console.log("All new migrations completed successfully.");
  } catch (err) {
    console.error("Migration process failed:", err);
  } finally {
    await client.end();
  }
}

runMigrations();
