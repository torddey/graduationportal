import { Router } from "express";
import db from "../db/db";
import { logger } from "../utils/logger";
import { stringify } from "csv-stringify";
import PDFDocument from "pdfkit";
import { io } from "../app";

const router = Router();

router.post("/submit", async (req, res) => {
  try {
    let { studentId, ...formData } = req.body;
    studentId = parseInt(studentId, 10);
    if (isNaN(studentId))
      return res
        .status(400)
        .json({ success: false, message: "Invalid studentId" });

    // First, check if the student exists and is eligible
    const studentResult = await db.query(
      "SELECT eligibility_status FROM students WHERE student_id = $1",
      [studentId],
    );

    if (studentResult.rows.length === 0) {
      logger.warn(
        `Registration attempt for non-existent student: ${studentId}`,
        { category: "Registration" },
      );
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    if (!studentResult.rows[0].eligibility_status) {
      logger.warn(`Registration attempt by ineligible student: ${studentId}`, {
        category: "Registration",
      });
      return res.status(403).json({
        success: false,
        message: "Student is not eligible for graduation",
      });
    }

    // Check if student has already registered
    const existingRegistration = await db.query(
      "SELECT confirmation_id, created_at FROM registrations WHERE student_id = $1",
      [studentId],
    );

    if (existingRegistration.rows.length > 0) {
      logger.warn(`Duplicate registration attempt by student: ${studentId}`, {
        category: "Registration",
      });
      return res.status(409).json({
        success: false,
        message: "Student has already registered",
        existingRegistration: {
          confirmationId: existingRegistration.rows[0].confirmation_id,
          registeredAt: existingRegistration.rows[0].created_at,
        },
      });
    }

    // Fetch school, program, and course from students table
    const studentDetails = await db.query(
      "SELECT school, program, course FROM students WHERE student_id = $1",
      [studentId],
    );
    if (studentDetails.rows.length === 0) {
      logger.warn(
        `Registration attempt for non-existent student: ${studentId}`,
        { category: "Registration" },
      );
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }
    const { school, program, course } = studentDetails.rows[0];

    // If all checks pass, proceed with registration
    // Generate custom confirmation ID starting with GIMPA
    const generateConfirmationId = () => {
      const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0"); // 3-digit random number
      return `GIMPA${timestamp}${random}`;
    };

    const confirmationId = generateConfirmationId();

    const result = await db.query(
      `INSERT INTO registrations (student_id, school, program, course, form_data, confirmation_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING confirmation_id`,
      [
        studentId,
        school,
        program,
        course,
        JSON.stringify(formData),
        confirmationId,
      ],
    );

    const finalConfirmationId = result.rows[0].confirmation_id;

    // Log successful registration
    await db.query(
      `INSERT INTO audit_logs (action, user_name, details)
       VALUES ($1, $2, $3)`,
      [
        "REGISTRATION",
        studentId,
        `Graduation registration completed with confirmation ID: ${finalConfirmationId}`,
      ],
    );

    // Notify connected clients of the new registration
    io.emit("new_registration", { studentId: finalConfirmationId });

    logger.info(`Successful registration for student: ${studentId}`, {
      category: "Registration",
    });

    res.json({
      success: true,
      confirmationId: finalConfirmationId,
      message: "Registration successful",
    });
  } catch (err) {
    logger.error(
      `Registration error for student ${req.body.studentId}: ${err instanceof Error ? err.message : "Unknown error"}`,
      { category: "Registration" },
    );
    res.status(500).json({
      success: false,
      message: "Registration failed. Please try again later.",
    });
  }
});

router.post("/", async (req, res) => {
  try {
    let { student_id, name, email, program, faculty } = req.body;
    student_id = parseInt(student_id, 10);
    if (isNaN(student_id))
      return res.status(400).json({ error: "Invalid student_id" });

    // Validate student_id exists in students table
    const studentExists = await db.query(
      "SELECT * FROM students WHERE student_id = $1",
      [student_id],
    );

    if (studentExists.rows.length === 0) {
      return res
        .status(400)
        .json({ error: "Student ID does not exist in students table" });
    }

    // Insert into registrations table
    await db.query(
      `INSERT INTO registrations (student_id, name, email, program, faculty) VALUES ($1, $2, $3, $4, $5)`,
      [student_id, name, email, program, faculty],
    );

    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ error: "Failed to submit registration" });
  }
});

// Export student registration confirmation as PDF
router.get("/export/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId))
      return res.status(400).json({ error: "Invalid studentId" });

    // Get student and registration data
    const result = await db.query(
      `
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
    `,
      [studentId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const student = result.rows[0];

    if (!student.confirmation_id) {
      return res
        .status(404)
        .json({ error: "Student has not registered for graduation" });
    }

    // Fetch settings from database
    const settingsResult = await db.query("SELECT key, value FROM settings");
    const settings: any = {};
    settingsResult.rows.forEach((row) => {
      settings[row.key] = row.value;
    });

    // Get ceremony details from settings with defaults
    const ceremonyDate = settings.ceremony_date || "2025-05-15T10:00:00";
    const ceremonyLocation =
      settings.ceremony_location || "GIMPA Main Campus Auditorium";
    const gownCollectionDeadline =
      settings.gown_collection_deadline || "2025-05-10T14:00:00";
    const gownReturnDeadline =
      settings.gown_return_deadline || "2025-08-08T23:59:59";

    // Format dates for display
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const formatTime = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };

    const formatDateTime = (dateString: string) => {
      const date = new Date(dateString);
      return (
        date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) +
        " at " +
        date.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      );
    };

    // Create PDF document
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    // Set response headers for PDF download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="graduation_confirmation_${studentId}.pdf"`,
    );

    // Pipe PDF to response
    doc.pipe(res);

    const formData = student.form_data || {};

    // PAGE 1: Header and Student Information
    // Header with logo placeholder
    doc.rect(40, 40, 515, 80).fill("#1a365d");

    doc
      .fontSize(28)
      .font("Helvetica-Bold")
      .fill("white")
      .text("GIMPA", 50, 60, { align: "center" });

    doc
      .fontSize(20)
      .font("Helvetica")
      .fill("white")
      .text("Graduation Confirmation", 50, 90, { align: "center" });

    // Confirmation ID (prominent)
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Confirmation ID:", 50, 160);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fill("#1a365d")
      .text(student.confirmation_id, 200, 160);

    // Registration Date
    doc
      .fontSize(12)
      .font("Helvetica")
      .fill("#718096")
      .text(
        `Registration Date: ${new Date(student.registration_date).toLocaleDateString()}`,
        50,
        190,
      );

    // Student Information Section
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Student Information", 50, 230);

    // Student details in a table format
    const studentInfo = [
      { label: "Full Name:", value: student.name },
      { label: "Student ID:", value: student.student_id },
      { label: "Email Address:", value: student.email },
      { label: "Program:", value: student.program },
      { label: "Phone Number:", value: student.phone || "Not provided" },
    ];

    let yPosition = 260;
    studentInfo.forEach((info) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fill("#4a5568")
        .text(info.label, 50, yPosition);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(info.value, 200, yPosition);

      yPosition += 25;
    });

    // Contact Information Section
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Contact Information", 50, yPosition + 20);

    yPosition += 50;
    const contactInfo = [
      {
        label: "Address:",
        value: formData.address || student.address || "Not provided",
      },
      {
        label: "City:",
        value: formData.city || student.city || "Not provided",
      },
      {
        label: "Postal Code:",
        value: formData.postalCode || student.postalCode || "Not provided",
      },
      {
        label: "Country:",
        value: formData.country || student.country || "Not provided",
      },
    ];

    contactInfo.forEach((info) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fill("#4a5568")
        .text(info.label, 50, yPosition);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(info.value, 200, yPosition);

      yPosition += 25;
    });

    // Emergency Contact Information
    if (formData.emergencyContact) {
      doc
        .fontSize(18)
        .font("Helvetica-Bold")
        .fill("#2d3748")
        .text("Emergency Contact", 50, yPosition + 20);

      yPosition += 50;
      const emergencyInfo = [
        {
          label: "Name:",
          value: formData.emergencyContact.name || "Not provided",
        },
        {
          label: "Relationship:",
          value: formData.emergencyContact.relationship || "Not provided",
        },
        {
          label: "Phone:",
          value: formData.emergencyContact.phone || "Not provided",
        },
      ];

      emergencyInfo.forEach((info) => {
        doc
          .fontSize(12)
          .font("Helvetica-Bold")
          .fill("#4a5568")
          .text(info.label, 50, yPosition);

        doc
          .fontSize(12)
          .font("Helvetica")
          .fill("#2d3748")
          .text(info.value, 200, yPosition);

        yPosition += 25;
      });
    }

    // Ceremony Details Section
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Ceremony Details", 50, yPosition + 20);

    yPosition += 50;
    const ceremonyInfo = [
      { label: "Date:", value: formatDate(ceremonyDate) },
      { label: "Time:", value: formatTime(ceremonyDate) },
      { label: "Venue:", value: ceremonyLocation },
    ];

    ceremonyInfo.forEach((info) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fill("#4a5568")
        .text(info.label, 50, yPosition);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(info.value, 200, yPosition);

      yPosition += 25;
    });

    // Page 1 Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#718096")
      .text(
        `Page 1 of 2 - Generated on: ${new Date().toLocaleDateString()}`,
        50,
        750,
        { align: "center" },
      );

    // PAGE 2: Additional Details and Important Information
    doc.addPage();

    // Page 2 Header
    doc
      .fontSize(20)
      .font("Helvetica-Bold")
      .fill("#1a365d")
      .text("Graduation Details & Requirements", 50, 50, { align: "center" });

    // Guest Information
    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Guest Information", 50, 100);

    const guestInfo = [
      {
        label: "Number of Guests:",
        value: formData.guestCount || "Not specified",
      },
      {
        label: "Dignitaries Attending:",
        value: formData.dignitaries === "yes" ? "Yes" : "No",
      },
    ];

    let page2Y = 130;
    guestInfo.forEach((info) => {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .fill("#4a5568")
        .text(info.label, 50, page2Y);

      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(info.value, 200, page2Y);

      page2Y += 25;
    });

    // Add dignitaries details if present
    if (formData.dignitaries === "yes" && formData.dignitariesDetails) {
      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(
          `Dignitaries Details: ${formData.dignitariesDetails}`,
          50,
          page2Y
        );
      page2Y += 25;
    }

    // Special Requirements
    if (formData.specialRequirements) {
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fill("#2d3748")
        .text("Special Requirements", 50, page2Y + 20);

      page2Y += 50;
      doc
        .fontSize(12)
        .font("Helvetica")
        .fill("#2d3748")
        .text(formData.specialRequirements, 50, page2Y, { width: 500 });
    }

    // Important Information Box
    page2Y += 80;
    doc.rect(50, page2Y, 495, 120).fill("#f7fafc").stroke("#e2e8f0");

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Important Information", 70, page2Y + 20);

    const importantInfo = [
      "• Please arrive at least 30 minutes before the ceremony",
      "• Bring this confirmation document with you",
      "• Wear appropriate academic attire",
      "• Contact the graduation office for any changes",
      `• Gown collection deadline: ${formatDateTime(gownCollectionDeadline)}`,
      `• Gown return deadline: ${formatDateTime(gownReturnDeadline)}`,
    ];

    page2Y += 50;
    importantInfo.forEach((item) => {
      doc.fontSize(11).font("Helvetica").fill("#4a5568").text(item, 70, page2Y);
      page2Y += 20;
    });

    // Contact Information Box
    page2Y += 40;
    doc.rect(50, page2Y, 495, 80).fill("#edf2f7").stroke("#cbd5e0");

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .fill("#2d3748")
      .text("Contact Information", 70, page2Y + 20);

    const contactDetails = [
      "Graduation Office: graduation@gimpa.edu.gh",
      "Phone: +233 30 224 0000",
      "Address: GIMPA Main Campus, Accra, Ghana",
    ];

    page2Y += 50;
    contactDetails.forEach((detail) => {
      doc
        .fontSize(11)
        .font("Helvetica")
        .fill("#4a5568")
        .text(detail, 70, page2Y);
      page2Y += 20;
    });

    // Page 2 Footer
    doc
      .fontSize(10)
      .font("Helvetica")
      .fill("#718096")
      .text(`Page 2 of 2 - GIMPA Graduation Portal`, 50, 750, {
        align: "center",
      });

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Export confirmation error:", error);
    res.status(500).json({ error: "Failed to export confirmation" });
  }
});

// Get registration status for a student
router.get("/status/:studentId", async (req, res) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    if (isNaN(studentId))
      return res.status(400).json({ error: "Invalid studentId" });

    const result = await db.query(
      `
      SELECT r.confirmation_id, r.created_at
      FROM registrations r
      WHERE r.student_id = $1
    `,
      [studentId],
    );

    if (result.rows.length > 0) {
      res.json({
        hasRegistered: true,
        confirmationId: result.rows[0].confirmation_id,
        registeredAt: result.rows[0].created_at,
      });
    } else {
      res.json({
        hasRegistered: false,
      });
    }
  } catch (error) {
    console.error("Get registration status error:", error);
    res.status(500).json({ error: "Failed to get registration status" });
  }
});

export default router;
