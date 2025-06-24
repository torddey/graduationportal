import { Router } from "express";
import db from "../db/db";

const router = Router();

// GET /api/students - Fetch all students with pagination
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query(
      "SELECT COUNT(*) as count FROM students",
    );
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const studentsResult = await db.query(
      "SELECT * FROM students ORDER BY created_at DESC LIMIT $1 OFFSET $2",
      [limit, offset],
    );

    res.json({
      students: studentsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Failed to fetch students" });
  }
});

export default router;
