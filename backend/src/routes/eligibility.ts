import { Router } from 'express';
import db from '../db/db';

const router = Router();

// Check if a student is eligible
router.get('/check/:studentId', async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await db.query(
      'SELECT eligibility_status FROM students WHERE student_id = $1',
      [studentId]
    );
    if (result.rows.length === 0) return res.json({ isEligible: false });
    res.json({ isEligible: result.rows[0].eligibility_status });
  } catch (err) {
    res.status(500).json({ isEligible: false });
  }
});

// Get full student details
router.get('/student/:studentId', async (req, res) => {
  const { studentId } = req.params;
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  try {
    const result = await db.query(
      'SELECT * FROM students WHERE student_id = $1',
      [studentId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Student not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;