import { Router } from 'express';
import db from '../db/db';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Request OTP
router.post('/request-otp', async (req, res) => {
  try {
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // First, delete any existing OTPs for this student
    await db.query(
      'DELETE FROM otps WHERE student_id = $1',
      [studentId]
    );

    // Then insert the new OTP
    await db.query(
      `INSERT INTO otps (student_id, otp_code, expires_at)
       VALUES ($1, $2, $3)`,
      [studentId, otp, expiresAt]
    );

    // For development, log the OTP (remove in production)
    console.log(`OTP for ${studentId}:${otp}`);

    res.json({ success: true, message: 'OTP generated successfully' });
  } catch (err) {
    console.error('OTP Generation failed:', err);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { studentId, otp } = req.body;
  if (!studentId || !otp) {
    return res.status(400).json({ error: 'Student ID and OTP are required' });
  }
  const result = await db.query(
    `SELECT * FROM otps WHERE student_id = $1 AND otp_code = $2 AND used = false AND expires_at > NOW()`,
    [studentId, otp]
  );
  if (result.rows.length === 0) {
    return res.status(400).json({ error: 'Invalid OTP' });
  }
  await db.query(`UPDATE otps SET used = true WHERE student_id = $1 AND otp_code = $2`, [studentId, otp]);
  // ...generate JWT and return user info...
});

// Get current user
router.get('/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const token = auth.split(' ')[1];
    const user = jwt.verify(token, JWT_SECRET);
    res.json(user);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});


export default router;