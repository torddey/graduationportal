import { Router } from "express";
import db from "../db/db";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const logs = await db.query(
      "SELECT * FROM audit_logs ORDER BY timestamp DESC",
    );
    res.json(logs.rows);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;
