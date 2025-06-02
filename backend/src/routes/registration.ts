import { Router } from 'express';
import db from '../db/db';
import { logger } from '../utils/logger';

const router = Router();

router.post('/submit', async (req, res) => {
  try {
    const { studentId, ...formData } = req.body;

    // First, check if the student exists and is eligible
    const studentResult = await db.query(
      'SELECT eligibility_status FROM students WHERE student_id = $1',
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      logger.warn(`Registration attempt for non-existent student: ${studentId}`, { category: 'Registration' });
      return res.status(404).json({ 
        success: false, 
        message: 'Student not found' 
      });
    }

    if (!studentResult.rows[0].eligibility_status) {
      logger.warn(`Registration attempt by ineligible student: ${studentId}`, { category: 'Registration' });
      return res.status(403).json({ 
        success: false, 
        message: 'Student is not eligible for graduation' 
      });
    }

    // Check if student has already registered
    const existingRegistration = await db.query(
      'SELECT confirmation_id, created_at FROM registrations WHERE student_id = $1',
      [studentId]
    );

    if (existingRegistration.rows.length > 0) {
      logger.warn(`Duplicate registration attempt by student: ${studentId}`, { category: 'Registration' });
      return res.status(409).json({
        success: false,
        message: 'Student has already registered',
        existingRegistration: {
          confirmationId: existingRegistration.rows[0].confirmation_id,
          registeredAt: existingRegistration.rows[0].created_at
        }
      });
    }

    // If all checks pass, proceed with registration
    const result = await db.query(
      `INSERT INTO registrations (student_id, form_data)
       VALUES ($1, $2)
       RETURNING confirmation_id`,
      [studentId, JSON.stringify(formData)]
    );

    const confirmationId = result.rows[0].confirmation_id;

    // Log successful registration
    await db.query(
      `INSERT INTO audit_logs (action, user_name, details)
       VALUES ($1, $2, $3)`,
      ['REGISTRATION', studentId, `Graduation registration completed with confirmation ID: ${confirmationId}`]
    );

    logger.info(`Successful registration for student: ${studentId}`, { category: 'Registration' });

    res.json({ 
      success: true, 
      confirmationId,
      message: 'Registration successful'
    });
  } catch (err) {
    logger.error(`Registration error for student ${req.body.studentId}: ${err instanceof Error ? err.message : 'Unknown error'}`, { category: 'Registration' });
    res.status(500).json({ 
      success: false, 
      message: 'Registration failed. Please try again later.' 
    });
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