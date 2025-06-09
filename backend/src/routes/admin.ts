import { Router } from 'express';
import db from '../db/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { stringify } from 'csv-stringify';

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

    // Get total count from both tables
    const countResult = await db.query(`
      SELECT 
        (SELECT COUNT(*) FROM eligible_uploads) +
        (SELECT COUNT(*) FROM audit_logs) as total_count
    `);
    const total = parseInt(countResult.rows[0].total_count);

    // Get paginated results from both tables
    const logsResult = await db.query(`
      WITH combined_logs AS (
        -- Eligible uploads
        SELECT 
          id,
          'UPLOAD' as action,
          uploaded_by as user_name,
          file_name as details,
          upload_time as timestamp,
          errors_count,
          'eligible_upload' as log_type
        FROM eligible_uploads
        UNION ALL
        -- Audit logs
        SELECT 
          id,
          action,
          user_name,
          details,
          timestamp,
          NULL as errors_count,
          'audit_log' as log_type
        FROM audit_logs
      )
      SELECT * FROM combined_logs
      ORDER BY timestamp DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

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

// Export students data endpoint
router.get('/export/students', async (req, res) => {
  try {
    // Get all students data
    const studentsResult = await db.query(`
      SELECT 
        student_id,
        name,
        email,
        program,
        phone,
        address,
        postalCode,
        city,
        country,
        eligibility_status,
        created_at
      FROM students 
      ORDER BY created_at DESC
    `);

    if (studentsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No students found to export' });
    }

    // Convert to CSV
    const csvData = studentsResult.rows.map(student => ({
      'Student ID': student.student_id,
      'Name': student.name,
      'Email': student.email,
      'Program': student.program,
      'Phone': student.phone || '',
      'Address': student.address || '',
      'Postal Code': student.postalCode || '',
      'City': student.city || '',
      'Country': student.country || '',
      'Eligible': student.eligibility_status ? 'Yes' : 'No',
      'Created At': new Date(student.created_at).toLocaleString()
    }));

    // Generate CSV string
    stringify(csvData, { header: true }, (err: Error | undefined, csvString: string) => {
      if (err) {
        console.error('CSV generation error:', err);
        return res.status(500).json({ error: 'Failed to generate CSV' });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="students_export_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Send CSV data
      res.send(csvString);

      // Log the export
      db.query(
        `INSERT INTO audit_logs (action, user_name, details) VALUES ($1, $2, $3)`,
        ['EXPORT', 'admin', `Exported ${studentsResult.rows.length} students to CSV`]
      ).catch(logError => console.error('Error logging export:', logError));
    });
  } catch (error) {
    console.error('Export students error:', error);
    res.status(500).json({ error: 'Failed to export students data' });
  }
});

// Export registrations data endpoint
router.get('/export/registrations', async (req, res) => {
  try {
    // Get all registrations with student details
    const registrationsResult = await db.query(`
      SELECT 
        r.confirmation_id,
        r.student_id,
        s.name,
        s.email,
        s.program,
        s.phone,
        r.form_data,
        r.created_at
      FROM registrations r
      JOIN students s ON r.student_id = s.student_id
      ORDER BY r.created_at DESC
    `);

    if (registrationsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No registrations found to export' });
    }

    // Convert to CSV with form data flattened
    const csvData = registrationsResult.rows.map(registration => {
      const formData = registration.form_data || {};
      return {
        'Confirmation ID': registration.confirmation_id,
        'Student ID': registration.student_id,
        'Name': registration.name,
        'Email': registration.email,
        'Program': registration.program,
        'Phone': registration.phone || '',
        'Address': formData.address || '',
        'Postal Code': formData.postalCode || '',
        'City': formData.city || '',
        'Country': formData.country || '',
        'Emergency Contact Name': formData.emergencyContact?.name || '',
        'Emergency Contact Relationship': formData.emergencyContact?.relationship || '',
        'Emergency Contact Phone': formData.emergencyContact?.phone || '',
        'Guest Count': formData.guestCount || '',
        'Special Requirements': formData.specialRequirements || '',
        'Pronounce Name': formData.pronounceName || '',
        'Registered At': new Date(registration.created_at).toLocaleString()
      };
    });

    // Generate CSV string
    stringify(csvData, { header: true }, (err: Error | undefined, csvString: string) => {
      if (err) {
        console.error('CSV generation error:', err);
        return res.status(500).json({ error: 'Failed to generate CSV' });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="registrations_export_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Send CSV data
      res.send(csvString);

      // Log the export
      db.query(
        `INSERT INTO audit_logs (action, user_name, details) VALUES ($1, $2, $3)`,
        ['EXPORT', 'admin', `Exported ${registrationsResult.rows.length} registrations to CSV`]
      ).catch(logError => console.error('Error logging export:', logError));
    });
  } catch (error) {
    console.error('Export registrations error:', error);
    res.status(500).json({ error: 'Failed to export registrations data' });
  }
});

// Export all data endpoint (students + registrations)
router.get('/export/all', async (req, res) => {
  try {
    // Get all students and registrations
    const studentsResult = await db.query(`
      SELECT 
        s.student_id,
        s.name,
        s.email,
        s.program,
        s.phone,
        s.eligibility_status,
        r.confirmation_id,
        r.created_at as registration_date,
        s.created_at as student_created_at
      FROM students s
      LEFT JOIN registrations r ON s.student_id = r.student_id
      ORDER BY s.created_at DESC
    `);

    if (studentsResult.rows.length === 0) {
      return res.status(404).json({ error: 'No data found to export' });
    }

    // Convert to CSV
    const csvData = studentsResult.rows.map(row => ({
      'Student ID': row.student_id,
      'Name': row.name,
      'Email': row.email,
      'Program': row.program,
      'Phone': row.phone || '',
      'Eligible': row.eligibility_status ? 'Yes' : 'No',
      'Registration Status': row.confirmation_id ? 'Registered' : 'Not Registered',
      'Confirmation ID': row.confirmation_id || '',
      'Registration Date': row.registration_date ? new Date(row.registration_date).toLocaleString() : '',
      'Student Created At': new Date(row.student_created_at).toLocaleString()
    }));

    // Generate CSV string
    stringify(csvData, { header: true }, (err: Error | undefined, csvString: string) => {
      if (err) {
        console.error('CSV generation error:', err);
        return res.status(500).json({ error: 'Failed to generate CSV' });
      }

      // Set headers for file download
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="all_data_export_${new Date().toISOString().split('T')[0]}.csv"`);
      
      // Send CSV data
      res.send(csvString);

      // Log the export
      db.query(
        `INSERT INTO audit_logs (action, user_name, details) VALUES ($1, $2, $3)`,
        ['EXPORT', 'admin', `Exported complete dataset with ${studentsResult.rows.length} records to CSV`]
      ).catch(logError => console.error('Error logging export:', logError));
    });
  } catch (error) {
    console.error('Export all data error:', error);
    res.status(500).json({ error: 'Failed to export all data' });
  }
});

export default router;