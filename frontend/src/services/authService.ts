

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Request OTP for login (student or admin)
  async requestOtp(userId: string): Promise<void> {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to request OTP');
    }
  },

  // Verify OTP and get user data (student or admin)
  async verifyOtp(userId: string, otp: string): Promise<any> {
    if (!userId || !otp) {
      throw new Error('User ID and OTP are required');
    }

    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, otp }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Invalid OTP');
    }

    const { token, user } = await res.json();

    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    return user;
  },

  // Get current authenticated user data (student or admin)
  async getCurrentUser(): Promise<any | null> {
    const token = localStorage.getItem('authToken');
    if (!token) return null;

    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    return res.json();
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tempStudentId');
  }
};