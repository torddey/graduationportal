import { Router } from 'express';
import db from '../db/db';

const router = Router();

router.post('/submit', async (req, res) => {
  try {
    const { studentId, ...formData } = req.body;

    // Insert registration into the database
    const result = await db.query(
      `INSERT INTO registrations (student_id, form_data)
       VALUES ($1, $2)
       RETURNING confirmation_id`,
      [studentId, JSON.stringify(formData)]
    );

    const confirmationId = result.rows[0].confirmation_id;
    res.json({ success: true, confirmationId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Registration failed' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { student_id, name, email, program, faculty } = req.body;

    // Validate student_id exists in students table
    const studentExists = await db.query(
      'SELECT * FROM students WHERE student_id = $1',
      [student_id]
    );

    if (studentExists.rows.length === 0) {
      return res.status(400).json({ error: 'Student ID does not exist in students table' });
    }

    // Insert into registrations table
    await db.query(
      `INSERT INTO registrations (student_id, name, email, program, faculty) VALUES ($1, $2, $3, $4, $5)`,
      [student_id, name, email, program, faculty]
    );

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Failed to submit registration' });
  }
});

export default router;