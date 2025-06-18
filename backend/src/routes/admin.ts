import { Router } from 'express';
import db from '../db/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';
import { stringify } from 'csv-stringify';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();
const upload = multer({ dest: 'uploads/' });

// Public settings endpoint (no authentication required)
router.get('/public-settings', async (req, res) => {
  try {
    // Check if settings table exists, create if it doesn't
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default settings if they don't exist
      await db.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('registration_deadline', '2025-07-04T23:59:59', 'Registration deadline for graduation ceremony'),
        ('gown_return_deadline', '2025-08-08T23:59:59', 'Deadline for returning graduation gowns'),
        ('gown_collection_deadline', '2025-05-10T14:00:00', 'Deadline for collecting graduation gowns'),
        ('ceremony_date', '2025-05-15T10:00:00', 'Date and time of graduation ceremony'),
        ('ceremony_location', 'GIMPA Main Campus Auditorium', 'Location of graduation ceremony')
        ON CONFLICT (key) DO NOTHING
      `);
    } catch (tableError) {
      console.error('Error creating settings table:', tableError);
      // Continue with default values if table creation fails
    }

    // Fetch settings from database
    const settingsResult = await db.query('SELECT key, value FROM settings');
    
    const settings: any = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Return settings with defaults if not found
    const response = {
      registrationDeadline: settings.registration_deadline || '2025-07-04T23:59:59',
      gownReturnDeadline: settings.gown_return_deadline || '2025-08-08T23:59:59',
      gownCollectionDeadline: settings.gown_collection_deadline || '2025-05-10T14:00:00',
      ceremonyDate: settings.ceremony_date || '2025-05-15T10:00:00',
      ceremonyLocation: settings.ceremony_location || 'GIMPA Main Campus Auditorium'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Public settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Apply authentication middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Settings endpoint for configurable dates
router.get('/settings', async (req, res) => {
  try {
    // Fetch settings from database
    const settingsResult = await db.query('SELECT key, value FROM settings');
    
    const settings: any = {};
    settingsResult.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    
    // Return settings with defaults if not found
    const response = {
      registrationDeadline: settings.registration_deadline || '2025-07-04T23:59:59',
      gownReturnDeadline: settings.gown_return_deadline || '2025-08-08T23:59:59',
      gownCollectionDeadline: settings.gown_collection_deadline || '2025-05-10T14:00:00',
      ceremonyDate: settings.ceremony_date || '2025-05-15T10:00:00',
      ceremonyLocation: settings.ceremony_location || 'GIMPA Main Campus Auditorium'
    };
    
    res.json(response);
  } catch (error) {
    console.error('Settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Save settings endpoint
router.post('/settings', async (req, res) => {
  try {
    console.log('Received settings update request:', req.body);
    
    const { 
      registration_deadline, 
      ceremony_date, 
      ceremony_location, 
      gown_collection_deadline, 
      gown_return_deadline 
    } = req.body;

    // Validate required fields
    if (!registration_deadline || !ceremony_date) {
      return res.status(400).json({ error: 'Missing required fields: registration_deadline and ceremony_date' });
    }

    // Check if settings table exists, create if it doesn't
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS settings (
          id SERIAL PRIMARY KEY,
          key VARCHAR(100) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Insert default settings if they don't exist
      await db.query(`
        INSERT INTO settings (key, value, description) VALUES
        ('registration_deadline', '2025-07-04T23:59:59', 'Registration deadline for graduation ceremony'),
        ('gown_return_deadline', '2025-08-08T23:59:59', 'Deadline for returning graduation gowns'),
        ('gown_collection_deadline', '2025-05-10T14:00:00', 'Deadline for collecting graduation gowns'),
        ('ceremony_date', '2025-05-15T10:00:00', 'Date and time of graduation ceremony'),
        ('ceremony_location', 'GIMPA Main Campus Auditorium', 'Location of graduation ceremony')
        ON CONFLICT (key) DO NOTHING
      `);
    } catch (tableError) {
      console.error('Error creating settings table:', tableError);
      throw tableError;
    }

    // Update settings in database
    const updates = [
      { key: 'registration_deadline', value: registration_deadline },
      { key: 'ceremony_date', value: ceremony_date },
      { key: 'ceremony_location', value: ceremony_location },
      { key: 'gown_collection_deadline', value: gown_collection_deadline },
      { key: 'gown_return_deadline', value: gown_return_deadline }
    ];

    console.log('Updating settings:', updates);

    for (const update of updates) {
      if (update.value !== undefined) {
        try {
          const result = await db.query(
            'UPDATE settings SET value = $1, updated_at = CURRENT_TIMESTAMP WHERE key = $2',
            [update.value, update.key]
          );
          console.log(`Updated ${update.key}:`, result.rowCount, 'rows affected');
        } catch (updateError) {
          console.error(`Error updating ${update.key}:`, updateError);
          throw updateError;
        }
      }
    }

    // Log the settings update
    try {
      await db.query(
        `INSERT INTO audit_logs (action, user_name, details)
         VALUES ($1, $2, $3)`,
        ['SETTINGS_UPDATE', 'admin', 'Graduation settings updated']
      );
    } catch (logError) {
      console.error('Error logging settings update:', logError);
      // Don't fail the entire request if logging fails
    }

    console.log('Settings updated successfully');
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ 
      error: 'Failed to save settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

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
      `SELECT r.*, s.student_id, s.name, s.email, s.program, s.phone 
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
  console.log('Upload endpoint called');
  if (!req.file) {
    console.log('No file uploaded');
    return res.status(400).json({ success: false, errors: ['No file uploaded'] });
  }

  console.log('File received:', req.file.originalname, 'Size:', req.file.size);
  const filePath = req.file.path;
  const students: any[] = [];
  const errors: string[] = [];

  fs.createReadStream(filePath)
    .pipe(parse({ columns: true, trim: true }))
    .on('data', (row) => {
      console.log('Parsed row:', row);
      students.push(row);
    })
    .on('end', async () => {
      console.log('CSV parsing complete. Total students:', students.length);
      let count = 0;
      for (const student of students) {
        try {
          console.log('Processing student:', student.student_id, student.name);
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
          console.log('Successfully processed student:', student.student_id);
        } catch (err) {
          const error = err as Error;
          console.error('Error processing student:', student.student_id, error.message);
          errors.push(`Error processing student ${student.student_id}: ${error.message}`);
        }
      }
      
      console.log('Upload complete. Successfully processed:', count, 'students. Errors:', errors.length);
      
      // Log the upload
      try {
        await db.query(
          `INSERT INTO eligible_uploads (uploaded_by, file_name) VALUES ($1, $2)`,
          ['admin', req.file!.originalname]
        );
        console.log('Upload logged to database');
      } catch (err) {
        console.error('Error logging upload:', err);
      }

      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ success: errors.length === 0, count, errors });
    })
    .on('error', (err) => {
      console.error('CSV parsing error:', err);
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
        'Dignitaries': formData.dignitaries || '',
        'Special Requirements': formData.specialRequirements || '',
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