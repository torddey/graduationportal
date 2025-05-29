import { Router } from 'express';
import db from '../db/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Dashboard stats endpoint
router.get('/dashboard-stats', async (req, res) => {
  try {
    // Get total students count
    const totalStudentsResult = await db.query('SELECT COUNT(*) as count FROM students');
    
    // Get total registrations count
    const totalRegistrationsResult = await db.query('SELECT COUNT(*) as count FROM registrations');
    
    // Get eligible students count
    const eligibleStudentsResult = await db.query('SELECT COUNT(*) as count FROM students WHERE eligibility_status = TRUE');
    
    // Get recent registrations (last 7 days)
    const recentRegistrationsResult = await db.query(
      `SELECT COUNT(*) as count FROM registrations 
       WHERE created_at >= NOW() - INTERVAL '7 days'`
    );

    const stats = {
      totalStudents: parseInt(totalStudentsResult.rows[0].count),
      totalRegistrations: parseInt(totalRegistrationsResult.rows[0].count),
      eligibleStudents: parseInt(eligibleStudentsResult.rows[0].count),
      recentRegistrations: parseInt(recentRegistrationsResult.rows[0].count)
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Registered students endpoint
router.get('/registered-students', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as count FROM registrations r JOIN students s ON r.student_id = s.student_id');
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const studentsResult = await db.query(
      `SELECT r.*, s.name, s.email, s.program, s.phone 
       FROM registrations r 
       JOIN students s ON r.student_id = s.student_id 
       ORDER BY r.created_at DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      students: studentsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Registered students error:', error);
    res.status(500).json({ error: 'Failed to fetch registered students' });
  }
});

// Audit logs endpoint
router.get('/audit-logs', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Get total count
    const countResult = await db.query('SELECT COUNT(*) as count FROM eligible_uploads');
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    const logsResult = await db.query(
      `SELECT * FROM eligible_uploads 
       ORDER BY upload_time DESC 
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    res.json({
      logs: logsResult.rows,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Original upload endpoint (fixed)
router.post('/upload-eligible', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, errors: ['No file uploaded'] });

  const filePath = req.file.path;
  const students: any[] = [];
  const errors: string[] = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => {
      students.push(row);
    })
    .on('end', async () => {
      let count = 0;
      for (const student of students) {
        try {
          await db.query(
            `INSERT INTO students (student_id, name, email, program, phone, eligibility_status)
             VALUES ($1, $2, $3, $4, $5, TRUE)
             ON CONFLICT (student_id) DO UPDATE SET
               name = EXCLUDED.name,
               email = EXCLUDED.email,
               program = EXCLUDED.program,
               phone = EXCLUDED.phone,
               eligibility_status = TRUE`,
            [
              student.student_id,
              student.name,
              student.email,
              student.program,
              student.phone
            ]
          );
          count++;
        } catch (err) {
          const error = err as Error;
          errors.push(`Error processing student ${student.student_id}: ${error.message}`);
        }
      }
      
      // Log the upload
      try {
        await db.query(
          `INSERT INTO eligible_uploads (uploaded_by, file_name) VALUES ($1, $2)`,
          ['admin', req.file!.originalname]
        );
      } catch (err) {
        console.error('Error logging upload:', err);
      }

      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ success: errors.length === 0, count, errors });
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ success: false, errors: [err.message] });
    });
});

export default router;