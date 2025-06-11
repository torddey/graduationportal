import { Router } from 'express';
import db from '../db/db';
import { logger } from '../utils/logger';
import { stringify } from 'csv-stringify';
import PDFDocument from 'pdfkit';

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
    // Generate custom confirmation ID starting with GRAD
    const generateConfirmationId = () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 3-digit random number
      return `GRAD${timestamp}${random}`;
    };

    const confirmationId = generateConfirmationId();

    const result = await db.query(
      `INSERT INTO registrations (student_id, form_data, confirmation_id)
       VALUES ($1, $2, $3)
       RETURNING confirmation_id`,
      [studentId, JSON.stringify(formData), confirmationId]
    );

    const finalConfirmationId = result.rows[0].confirmation_id;

    // Log successful registration
    await db.query(
      `INSERT INTO audit_logs (action, user_name, details)
       VALUES ($1, $2, $3)`,
      ['REGISTRATION', studentId, `Graduation registration completed with confirmation ID: ${finalConfirmationId}`]
    );

    logger.info(`Successful registration for student: ${studentId}`, { category: 'Registration' });

    res.json({ 
      success: true, 
      confirmationId: finalConfirmationId,
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

// Export student registration confirmation as PDF
router.get('/export/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    // Get student and registration data
    const result = await db.query(`
      SELECT 
        s.student_id,
        s.name,
        s.email,
        s.program,
        s.phone,
        s.address,
        s.postalCode,
        s.city,
        s.country,
        r.confirmation_id,
        r.form_data,
        r.created_at as registration_date
      FROM students s
      LEFT JOIN registrations r ON s.student_id = r.student_id
      WHERE s.student_id = $1
    `, [studentId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const student = result.rows[0];
    
    if (!student.confirmation_id) {
      return res.status(404).json({ error: 'Student has not registered for graduation' });
    }

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="graduation_confirmation_${studentId}.pdf"`);

    // Pipe PDF to response
    doc.pipe(res);

    // Add content to PDF - Simplified version
    const formData = student.form_data || {};

    // Header
    doc.fontSize(24)
       .font('Helvetica-Bold')
       .fill('#1a365d')
       .text('GIMPA Graduation Confirmation', { align: 'center' });

    doc.moveDown(0.5);

    // Confirmation ID
    doc.fontSize(16)
       .font('Helvetica-Bold')
       .fill('#2d3748')
       .text('Confirmation ID:', 50, 120);

    doc.fontSize(14)
       .font('Helvetica')
       .fill('#4a5568')
       .text(student.confirmation_id, 50, 140);

    doc.moveDown(1);

    // Student Information Section (Essential details only)
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fill('#2d3748')
       .text('Student Information', 50, 200);

    doc.moveDown(0.5);

    const studentInfo = [
      { label: 'Name:', value: student.name },
      { label: 'Student ID:', value: student.student_id },
      { label: 'Email:', value: student.email },
      { label: 'Program:', value: student.program }
    ];

    let yPosition = 240;
    studentInfo.forEach(info => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fill('#4a5568')
         .text(info.label, 50, yPosition);

      doc.fontSize(12)
         .font('Helvetica')
         .fill('#2d3748')
         .text(info.value, 150, yPosition);

      yPosition += 25;
    });

    // Ceremony Details Section
    doc.moveDown(1);
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .fill('#2d3748')
       .text('Ceremony Details', 50, yPosition + 20);

    doc.moveDown(0.5);

    const ceremonyInfo = [
      { label: 'Date:', value: 'May 15, 2025' },
      { label: 'Time:', value: '10:00 AM' },
      { label: 'Venue:', value: 'GIMPA Main Campus Auditorium' }
    ];

    yPosition += 60;
    ceremonyInfo.forEach(info => {
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .fill('#4a5568')
         .text(info.label, 50, yPosition);

      doc.fontSize(12)
         .font('Helvetica')
         .fill('#2d3748')
         .text(info.value, 150, yPosition);

      yPosition += 25;
    });

    // Footer
    doc.fontSize(10)
       .font('Helvetica')
       .fill('#718096')
       .text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 750, { align: 'center' });

    doc.fontSize(10)
       .font('Helvetica')
       .fill('#718096')
       .text('GIMPA Graduation Portal', 50, 770, { align: 'center' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('Export confirmation error:', error);
    res.status(500).json({ error: 'Failed to export confirmation' });
  }
});

// Get registration status for a student
router.get('/status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;

    const result = await db.query(`
      SELECT r.confirmation_id, r.created_at
      FROM registrations r
      WHERE r.student_id = $1
    `, [studentId]);

    if (result.rows.length > 0) {
      res.json({
        hasRegistered: true,
        confirmationId: result.rows[0].confirmation_id,
        registeredAt: result.rows[0].created_at
      });
    } else {
      res.json({
        hasRegistered: false
      });
    }
  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({ error: 'Failed to get registration status' });
  }
});

export default router;