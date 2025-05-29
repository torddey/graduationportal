import { Student } from '../types/Student';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const adminService = {
  // Upload and process CSV of eligible students
  async uploadEligibleStudents(file: File): Promise<{ success: boolean; count: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append('file', file);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    try {
      const response = await fetch(`${API_URL}/csv/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  // Get dashboard stats
  async getDashboardStats(): Promise<{
    totalEligible: number;
    registered: number;
    pending: number;
    lastUpload: string;
  }> {
    const res = await fetch(`${API_URL}/admin/dashboard-stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  // Get audit logs
  async getAuditLogs(page = 1, limit = 10): Promise<{
    logs: Array<{
      id: string;
      action: string;
      user: string;
      timestamp: string;
      details: string;
    }>;
    total: number;
  }> {
    const res = await fetch(`${API_URL}/admin/audit-logs?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch audit logs');
    return res.json();
  },

  // Get registered students
  async getRegisteredStudents(page = 1, limit = 10): Promise<{
    students: Student[];
    total: number;
  }> {
    const res = await fetch(`${API_URL}/admin/registered-students?page=${page}&limit=${limit}`);
    if (!res.ok) throw new Error('Failed to fetch registered students');
    return res.json();
  }
};