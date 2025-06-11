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
  },

  // Export confirmation as PDF
  async exportConfirmationPDF(studentId: string): Promise<void> {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/registration/export/${studentId}`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Download failed: ${response.status}`);
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get('Content-Type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('Invalid response format. Expected PDF.');
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || `graduation_confirmation_${studentId}.pdf`;

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting confirmation PDF:', error);
      throw error;
    }
  }
};