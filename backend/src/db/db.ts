import { Client } from "pg";
import dotenv from "dotenv";
import { logger } from "../utils/logger";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

client
  .connect()
  .then(() => logger.db("Connected to PostgreSQL"))
  .catch((err) =>
    logger.db(`PostgreSQL connection error: ${err.message}`, "error"),
  );

export default client;
