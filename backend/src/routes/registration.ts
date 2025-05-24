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

export default router;