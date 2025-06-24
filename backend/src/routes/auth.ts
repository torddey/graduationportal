import { Router } from "express";
import db from "../db/db";
import jwt from "jsonwebtoken";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

// Request OTP for both students and admins
router.post("/request-otp", async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    let userRes;
    let identifier;
    let role = "student";
    const studentIdInt = parseInt(userId, 10);

    if (!isNaN(studentIdInt)) {
      userRes = await db.query(
        "SELECT student_id AS id, name, email FROM students WHERE student_id = $1",
        [studentIdInt],
      );
      identifier = studentIdInt;
    } else {
      userRes = await db.query(
        "SELECT id, username AS name, email FROM admin_users WHERE username = $1 OR email = $1",
        [userId],
      );
      if (userRes.rows.length === 0)
        return res.status(404).json({ error: "User not found" });
      identifier = userRes.rows[0].id;
      role = "admin";
    }

    if (userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    if (role === "student") {
      await db.query("DELETE FROM otps WHERE student_id = $1", [identifier]);
      await db.query(
        `INSERT INTO otps (student_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
        [identifier, otp, expiresAt],
      );
    } else {
      // role === 'admin'
      await db.query("DELETE FROM admin_otps WHERE admin_id = $1", [
        identifier,
      ]);
      await db.query(
        `INSERT INTO admin_otps (admin_id, otp_code, expires_at) VALUES ($1, $2, $3)`,
        [identifier, otp, expiresAt],
      );
    }

    console.log(`OTP for ${role} (${userId}): ${otp}`);
    res.json({ success: true, message: "OTP generated successfully" });
  } catch (err) {
    console.error("OTP Generation failed:", err);
    res.status(500).json({ error: "Failed to generate OTP" });
  }
});

// Verify OTP for both students and admins
router.post("/verify-otp", async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp)
    return res.status(400).json({ error: "User ID and OTP are required" });

  try {
    let userRes;
    let identifier;
    let role = "student";
    let studentId = null;
    const studentIdInt = parseInt(userId, 10);

    if (!isNaN(studentIdInt)) {
      userRes = await db.query(
        "SELECT student_id, name, email FROM students WHERE student_id = $1",
        [studentIdInt],
      );
      if (userRes.rows.length > 0) {
        identifier = userRes.rows[0].student_id;
        studentId = userRes.rows[0].student_id;
      }
    } else {
      userRes = await db.query(
        "SELECT id, username AS name, email, role FROM admin_users WHERE username = $1 OR email = $1",
        [userId],
      );
      if (userRes.rows.length > 0) {
        identifier = userRes.rows[0].id;
        role = userRes.rows[0].role;
      }
    }

    if (!userRes || userRes.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    let otpRes;
    if (role === "student") {
      otpRes = await db.query(
        `SELECT * FROM otps WHERE student_id = $1 AND otp_code = $2 AND used = false AND expires_at > NOW()`,
        [identifier, otp],
      );
      if (otpRes.rows.length > 0) {
        await db.query(
          `UPDATE otps SET used = true WHERE student_id = $1 AND otp_code = $2`,
          [identifier, otp],
        );
      }
    } else {
      // role === 'admin'
      otpRes = await db.query(
        `SELECT * FROM admin_otps WHERE admin_id = $1 AND otp_code = $2 AND used = false AND expires_at > NOW()`,
        [identifier, otp],
      );
      if (otpRes.rows.length > 0) {
        await db.query(
          `UPDATE admin_otps SET used = true WHERE admin_id = $1 AND otp_code = $2`,
          [identifier, otp],
        );
      }
    }

    if (!otpRes || otpRes.rows.length === 0)
      return res.status(400).json({ error: "Invalid OTP" });

    const user = userRes.rows[0];

    // For admins, the user.name is the username string. For students, we need to map student_id to id.
    const finalUserId = role === "student" ? studentId : user.name;

    const userForFrontend: any = {
      id: finalUserId,
      name: user.name,
      email: user.email,
      role: user.role || role,
    };

    if (role === "student" && studentId) {
      userForFrontend.studentId = studentId;
      const studentDetailsRes = await db.query(
        "SELECT phone, address, postalCode, city, country, school, program, course FROM students WHERE student_id = $1",
        [studentId],
      );
      if (studentDetailsRes.rows.length > 0) {
        Object.assign(userForFrontend, studentDetailsRes.rows[0]);
      }
    }

    const token = jwt.sign(
      {
        id: finalUserId,
        name: user.name,
        role: user.role || role,
        ...(studentId && { studentId }),
      },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      success: true,
      token,
      user: userForFrontend,
    });
  } catch (err) {
    console.error("OTP verification failed:", err);
    return res.status(500).json({ error: "Failed to verify OTP" });
  }
});

// Add this endpoint after the other routes but before export default
router.get("/me", authenticateToken, (req: AuthRequest, res) => {
  res.json({ user: req.user || null });
});

export default router;
