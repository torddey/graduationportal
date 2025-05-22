import { RegistrationForm } from '../types/RegistrationForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const registrationService = {
  // Submit registration for graduation
  async submitRegistration(form: RegistrationForm): Promise<{ success: boolean; confirmationId?: string }> {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/registration/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error('Failed to submit registration');
    return res.json();
  },
  
  // Get registration status for a student
  async getRegistrationStatus(studentId: string): Promise<{ hasRegistered: boolean; confirmationId?: string }> {
    const token = localStorage.getItem('authToken');
    const res = await fetch(`${API_URL}/registration/status/${studentId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    });
    if (!res.ok) throw new Error('Failed to get registration status');
    return res.json();
  }
};