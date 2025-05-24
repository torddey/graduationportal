import { Router } from 'express';
import db from '../db/db';
import multer from 'multer';
import { parse } from 'csv-parse';
import fs from 'fs';

const router = Router();
const upload = multer({ dest: 'uploads/' });

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
          errors.push(`Failed to insert student_id ${student.student_id}: ${err.message}`);
        }
      }
      // Log the upload
      await db.query(
        `INSERT INTO eligible_uploads (uploaded_by, file_name) VALUES ($1, $2)`,
        ['admin', req.file.originalname]
      );
      fs.unlinkSync(filePath); // Clean up uploaded file
      res.json({ success: errors.length === 0, count, errors });
    })
    .on('error', (err) => {
      fs.unlinkSync(filePath);
      res.status(500).json({ success: false, errors: [err.message] });
    });
});

export default router;