import { User } from '../types/User';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const authService = {
  // Request OTP for login
  async requestOtp(studentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/auth/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId }),
    });
    if (!res.ok) throw new Error('Failed to request OTP');
  },

  // Verify OTP and get user data
  async verifyOtp(otp: string, studentId: string): Promise<User> {
    const res = await fetch(`${API_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp, studentId }),
    });
    if (!res.ok) throw new Error('Invalid OTP');
    const { token, user } = await res.json();

    // Store auth token and user data in localStorage
    localStorage.setItem('authToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    return user;
  },

  // Get current authenticated user data
  async getCurrentUser(): Promise<User | null> {
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