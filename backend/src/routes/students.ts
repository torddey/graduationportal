import { Router } from 'express';
import db from '../db/db'; 

const router = Router();

// GET /api/students - Fetch all students
router.get('/', async (req, res) => {
  try {
    const students = await db.query('SELECT * FROM students');
    res.json(students.rows);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

export default router;