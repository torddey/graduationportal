import { Router } from 'express';
import db from '../db/db';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';

// Unified: Request OTP for both students and admins
router.post('/request-otp', async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    let userRes = await db.query('SELECT student_id AS id, name, email FROM students WHERE student_id = $1', [userId]);
    let identifier = userId;
    let role = 'student';

    if (userRes.rows.length === 0) {
      userRes = await db.query('SELECT username AS id, username AS name, email FROM admin_users WHERE username = $1 OR email = $1', [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      identifier = userRes.rows[0].id;
      role = 'admin';
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await db.query('DELETE FROM otps WHERE student_id = $1', [identifier]);
    await db.query(
      `INSERT INTO otps (student_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
      [identifier, otp, expiresAt]
    );

    console.log(`OTP for ${identifier} (${role}): ${otp}`);
    res.json({ success: true, message: 'OTP generated successfully' });
  } catch (err) {
    console.error('OTP Generation failed:', err);
    res.status(500).json({ error: 'Failed to generate OTP' });
  }
});

// Unified: Verify OTP for both students and admins
router.post('/verify-otp', async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) return res.status(400).json({ error: 'User ID and OTP are required' });

  try {
    let userRes = await db.query('SELECT student_id AS id, name, email FROM students WHERE student_id = $1', [userId]);
    let identifier = userId;
    let role = 'student';

    if (userRes.rows.length === 0) {
      userRes = await db.query('SELECT username AS id, username AS name, email FROM admin_users WHERE username = $1 OR email = $1', [userId]);
      if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });
      identifier = userRes.rows[0].id;
      role = 'admin';
    }

    const otpRes = await db.query(
      `SELECT * FROM otps WHERE student_id = $1 AND otp_code = $2 AND used = false AND expires_at > NOW()`,
      [identifier, otp]
    );
    if (otpRes.rows.length === 0) return res.status(400).json({ error: 'Invalid OTP' });

    await db.query(`UPDATE otps SET used = true WHERE student_id = $1 AND otp_code = $2`, [identifier, otp]);

    const user = userRes.rows[0];
    const token = jwt.sign(
      { id: user.id, name: user.name, role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role
      }
    });
  } catch (err) {
    console.error('OTP verification failed:', err);
    return res.status(500).json({ error: 'Failed to verify OTP' });
  }
});

export default router;