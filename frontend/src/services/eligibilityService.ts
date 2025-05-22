import { Student } from '../types/Student';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const eligibilityService = {
  // Check if a student is eligible to graduate
  async checkEligibility(studentId: string): Promise<boolean> {
    const res = await fetch(`${API_URL}/eligibility/check/${studentId}`);
    if (!res.ok) throw new Error('Failed to check eligibility');
    const data = await res.json();
    return data.isEligible;
  },
  
  // Get full student details
  async getStudentDetails(studentId: string): Promise<Student> {
    const res = await fetch(`${API_URL}/eligibility/student/${studentId}`);
    if (!res.ok) throw new Error('Failed to get student details');
    return res.json();
  }
};