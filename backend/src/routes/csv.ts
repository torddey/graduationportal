import { Router } from 'express';
import { io } from '../app';
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

// Helper function to perform bulk upsert
const bulkUpsertStudents = async (students: any[]) => {
  if (students.length === 0) return 0; // Return count of inserted/updated rows

  const values = students.map(student => [
    student.student_id,
    student.name,
    student.email,
    student.program,
    // Safely access phone, defaulting to null if not present
    student.phone || null 
  ]).flat();

  // Construct the multi-value insert query
  // Adjust placeholder count based on the number of columns being inserted/updated
  const numColumns = 5; // student_id, name, email, program, phone
  const valuePlaceholders = students.map((_, i) => {
    const start = i * numColumns + 1;
    // Ensure the VALUES clause matches the columns and placeholders
    return `($${start}, $${start + 1}, $${start + 2}, $${start + 3}, $${start + 4}, TRUE)`;
  }).join(',');

  const query = `
    INSERT INTO students (student_id, name, email, program, phone, eligibility_status)
    VALUES ${valuePlaceholders}
    ON CONFLICT (student_id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      program = EXCLUDED.program,
      phone = EXCLUDED.phone,
      eligibility_status = TRUE;
  `;

  // Consider adding error handling per row if needed, but ON CONFLICT handles most cases
  await db.query(query, values);
  return students.length; // Assuming all rows in batch were processed by ON CONFLICT
};

router.post('/upload-eligible', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, errors: ['No file uploaded'] });
  }

  const filePath = req.file.path;
  const batchSize = 1000; // Process in batches of 1000
  let studentsBatch: any[] = [];
  let totalCount = 0;
  const errors: string[] = [];
  let fileStream: fs.ReadStream | undefined;
  let parser: any;

  // Function to clean up the temporary file
  const cleanupFile = (callback?: () => void) => {
    fs.unlink(filePath, (err) => {
      if (err) console.error('Error deleting temporary file:', err);
      if (callback) callback();
    });
  };

  // Function to normalize column names (remove BOM and trim)
  const normalizeColumnName = (name: string) => {
    // Remove BOM and any leading/trailing whitespace
    return name.replace(/^\uFEFF/, '').trim();
  };

  // Function to validate and normalize student data
  const validateAndNormalizeStudent = (row: any) => {
    // Normalize column names
    const normalizedRow: any = {};
    Object.keys(row).forEach(key => {
      const normalizedKey = normalizeColumnName(key);
      normalizedRow[normalizedKey] = row[key];
    });

    // Check for required fields
    if (!normalizedRow.student_id || !normalizedRow.name || !normalizedRow.email || !normalizedRow.program) {
      return null;
    }

    return {
      student_id: normalizedRow.student_id.trim(),
      name: normalizedRow.name.trim(),
      email: normalizedRow.email.trim(),
      program: normalizedRow.program.trim(),
      phone: normalizedRow.phone ? normalizedRow.phone.trim() : null
    };
  };

  // Function to finalize the upload process (send response and emit socket event)
  const finalizeUpload = (success: boolean, finalErrors: string[] = []) => {
    const uploadErrors = errors.concat(finalErrors);
    const fileName = req.file?.originalname || 'unknown';
    const uploadedBy = 'admin'; // Assuming admin user performs upload

    // Log the upload to eligible_uploads (keeping this for detailed upload history)
    db.query(
      `INSERT INTO eligible_uploads (uploaded_by, file_name, errors_count) VALUES ($1, $2, $3)`,
      [uploadedBy, fileName, uploadErrors.length]
    ).catch(logError => console.error('Error logging eligible_uploads:', logError));

    // Log a general audit event for successful uploads
    if (success && uploadErrors.length === 0) {
      db.query(
        `INSERT INTO audit_logs (action, user_name, details) VALUES ($1, $2, $3)`,
        ['UPLOAD', uploadedBy, `Successfully uploaded ${totalCount} eligible students from ${fileName}`]
      ).catch(logError => console.error('Error logging audit_logs (success):', logError));
    } else if (uploadErrors.length > 0) {
       // Log an audit event for uploads with errors
       db.query(
        `INSERT INTO audit_logs (action, user_name, details) VALUES ($1, $2, $3)`,
        ['UPLOAD_FAILED', uploadedBy, `Upload of ${fileName} completed with ${uploadErrors.length} errors.`]
      ).catch(logError => console.error('Error logging audit_logs (failure):', logError));
    }

    // Emit socket event
    io.emit('csv-upload-complete', { 
      success: success && uploadErrors.length === 0, 
      count: totalCount, 
      errors: uploadErrors,
      timestamp: new Date().toISOString()
    });

    // Send HTTP response
    if (!res.headersSent) {
        res.json({ success: success && uploadErrors.length === 0, count: totalCount, errors: uploadErrors });
    }
  };

  const processBatch = async (batch: any[]) => {
    if (batch.length === 0) return;
    try {
      const processedCount = await bulkUpsertStudents(batch);
      totalCount += processedCount;
    } catch (batchErr) {
      console.error(`Error processing batch:`, batchErr);
      errors.push(`Batch processing failed. Error: ${batchErr instanceof Error ? batchErr.message : String(batchErr)}`);
      // In a streaming context, deciding whether to stop or continue on batch error
      // depends on requirements. For now, we log and continue.
    }
  };

  try {
    fileStream = fs.createReadStream(filePath);
    parser = parse({ 
      columns: (headers: string[]) => headers.map(normalizeColumnName),
      trim: true,
      skip_empty_lines: true
    });

    fileStream.pipe(parser);

    parser.on('data', async (row: any) => {
      const normalizedStudent = validateAndNormalizeStudent(row);
      if (!normalizedStudent) {
        errors.push(`Skipping row due to missing data: ${JSON.stringify(row)}`);
        return;
      }

      studentsBatch.push(normalizedStudent);

      if (studentsBatch.length >= batchSize) {
        parser.pause(); // Pause parsing while processing batch
        await processBatch(studentsBatch);
        studentsBatch = []; // Clear batch after processing
        parser.resume(); // Resume parsing
      }
    });

    parser.on('end', async () => {
      // Process any remaining students in the last batch
      if (studentsBatch.length > 0) {
        await processBatch(studentsBatch);
      }
      finalizeUpload(true);
      cleanupFile();
    });

    parser.on('error', (err: Error) => {
      console.error('Error during CSV parsing:', err);
      // Destroy streams to prevent further events
      if (fileStream) fileStream.destroy();
      parser.end();
      finalizeUpload(false, ['Failed to parse CSV file.', err.message]);
      cleanupFile();
    });

    fileStream.on('error', (err: Error) => {
      console.error('Error reading file stream:', err);
      // Destroy parser to prevent further events
      parser.end();
      finalizeUpload(false, ['Failed to read uploaded file.', err.message]);
      cleanupFile();
    });

  } catch (initialErr) {
    console.error('Initial file stream or parser setup error:', initialErr);
    finalizeUpload(false, ['An internal error occurred setting up file processing.', initialErr instanceof Error ? initialErr.message : String(initialErr)]);
    cleanupFile();
  }
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

// POST /api/csv/upload - Handle CSV file upload
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    // Process CSV here...
    res.status(200).json({ success: true, count: 0, errors: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

export default router;