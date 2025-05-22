const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const emailService = {
  // Send confirmation email
  async sendConfirmationEmail(email: string, name: string, confirmationId: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/email/confirmation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name, confirmationId }),
    });
    if (!res.ok) throw new Error('Failed to send confirmation email');
    return true;
  },
  
  // Send OTP email
  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/email/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    if (!res.ok) throw new Error('Failed to send OTP email');
    return true;
  }
};