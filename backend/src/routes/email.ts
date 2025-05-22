import { Router } from 'express';

const router = Router();

router.post('/confirmation', async (req, res) => {
  const { email, name, confirmationId } = req.body;
  // TODO: Integrate with real email service (e.g., nodemailer, SendGrid)
  console.log(`Send confirmation email to ${email} (${name}) with ID ${confirmationId}`);
  res.json({ success: true });
});

router.post('/otp', async (req, res) => {
  const { email, otp } = req.body;
  // TODO: Integrate with real email service
  console.log(`Send OTP email to ${email} with OTP ${otp}`);
  res.json({ success: true });
});

export default router;