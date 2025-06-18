import { Router } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

// Helper to get email config from env
function getEmailConfig() {
  return {
    service: process.env.EMAIL_SERVICE || 'gmail',
    gmail: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASSWORD,
    },
    from: process.env.EMAIL_FROM || 'graduation@university.edu',
    fromName: process.env.EMAIL_FROM_NAME || 'University Graduation Office',
  };
}

router.post('/confirmation', async (req, res) => {
  const { email, name, confirmationId } = req.body;
  const config = getEmailConfig();

  // Development safety: log instead of sending real email
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Would send confirmation email to ${email} (${name}) with ID ${confirmationId}`);
    return res.json({ success: true, dev: true });
  }

  if (config.service === 'gmail') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmail.user,
          pass: config.gmail.pass,
        },
      });
      await transporter.sendMail({
        from: `${config.fromName} <${config.from}>`,
        to: email,
        subject: 'Graduation Registration Confirmation',
        text: `Dear ${name},\n\nThank you for registering. Your confirmation ID is ${confirmationId}.`,
      });
      return res.json({ success: true });
    } catch (err) {
      console.error('Gmail send error:', err);
      return res.status(500).json({ error: 'Failed to send email' });
    }
  }

  // TODO: Add other providers
  console.log(`Send confirmation email to ${email} (${name}) with ID ${confirmationId}`);
  res.json({ success: true });
});

router.post('/otp', async (req, res) => {
  const { email, otp } = req.body;
  const config = getEmailConfig();

  // Development safety: log instead of sending real email
  if (process.env.NODE_ENV === 'development') {
    console.log(`[DEV] Would send OTP email to ${email} with OTP ${otp}`);
    return res.json({ success: true, dev: true });
  }

  if (config.service === 'gmail') {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.gmail.user,
          pass: config.gmail.pass,
        },
      });
      await transporter.sendMail({
        from: `${config.fromName} <${config.from}>`,
        to: email,
        subject: 'Your OTP Code',
        text: `Your OTP code is: ${otp}`,
      });
      return res.json({ success: true });
    } catch (err) {
      console.error('Gmail send error (OTP):', err);
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }
  }

  // TODO: Add other providers
  console.log(`Send OTP email to ${email} with OTP ${otp}`);
  res.json({ success: true });
});

export default router;