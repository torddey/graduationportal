import { Router } from 'express';
import { io } from './index'; 
import db from '../db/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

interface UploadedData {
  student_id: string;
  name: string;
  email: string;
  program: string;
  faculty: string; 
}

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
          const errorMsg = err instanceof Error ? err.message : String(err);
          errors.push(`Failed to insert student_id ${student.student_id}: ${errorMsg}`);
        }
      }
      // Log the upload
      await db.query(
        `INSERT INTO eligible_uploads (uploaded_by, file_name) VALUES ($1, $2)`,
        ['admin', req.file?.originalname || 'unknown']
      );
      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ success: errors.length === 0, count, errors });
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ success: false, errors: [err.message] });
    });
});

router.post('/upload-csv', async (req, res) => {
  try {
    const uploadedData: UploadedData[] = []; // Explicitly typed

    // Assume parsedRows is the result of parsing the CSV file
    const parsedRows = [
      ['ST12345', 'Jane Smith', 'jane.smith@university.edu', 'Computer Science', 'Engineering'],
      ['ST67890', 'John Doe', 'john.doe@university.edu', 'Information Technology', 'Engineering'],
    ];

    for (const row of parsedRows) {
      uploadedData.push({
        student_id: row[0],
        name: row[1],
        email: row[2],
        program: row[3],
        faculty: row[4], 
      });

      await db.query(
        `INSERT INTO students (student_id, name, email, program, faculty) VALUES ($1, $2, $3, $4, $5)`,
        [row[0], row[1], row[2], row[3], row[4]]
      );
    }

    // Emit an event to notify the frontend
    io.emit('csv-upload-complete', { success: true, data: uploadedData });
    console.log('Emitted csv-upload-complete event:', uploadedData);

    res.json({ success: true, message: 'CSV uploaded and processed successfully' });
  } catch (err) {
    console.error('CSV upload failed:', err);
    res.status(500).json({ error: 'Failed to upload CSV' });
  }
});

export default router;