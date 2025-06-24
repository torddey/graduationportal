const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://evans:password@localhost:5432/graduation_db",
});

async function migrateConfirmationId() {
  const client = await pool.connect();

  try {
    console.log("Starting confirmation_id migration...");

    // Check if the column is already VARCHAR
    const checkColumn = await client.query(`
      SELECT data_type 
      FROM information_schema.columns 
      WHERE table_name = 'registrations' 
      AND column_name = 'confirmation_id'
    `);

    if (
      checkColumn.rows.length > 0 &&
      checkColumn.rows[0].data_type === "character varying"
    ) {
      console.log(
        "confirmation_id column is already VARCHAR. Migration not needed.",
      );
      return;
    }

    // Begin transaction
    await client.query("BEGIN");

    // Drop the existing confirmation_id column
    console.log("Dropping existing confirmation_id column...");
    await client.query("ALTER TABLE registrations DROP COLUMN confirmation_id");

    // Add the new confirmation_id column as VARCHAR
    console.log("Adding new confirmation_id column as VARCHAR...");
    await client.query(
      "ALTER TABLE registrations ADD COLUMN confirmation_id VARCHAR(20) UNIQUE",
    );

    // Add an index for faster lookups
    console.log("Creating index for confirmation_id...");
    await client.query(
      "CREATE INDEX idx_registrations_confirmation_id ON registrations(confirmation_id)",
    );

    // Commit transaction
    await client.query("COMMIT");

    console.log("Migration completed successfully!");
    console.log(
      "confirmation_id column is now VARCHAR(20) and ready for GRAD format.",
    );
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Migration failed:", error);
    throw error;
  } finally {
    client.release();
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateConfirmationId()
    .then(() => {
      console.log("Migration script completed.");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateConfirmationId };
