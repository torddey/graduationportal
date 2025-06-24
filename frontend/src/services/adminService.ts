import { Student } from "../types/Student";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const adminService = {
  // Upload and process CSV of eligible students
  async uploadEligibleStudents(
    file: File,
  ): Promise<{ success: boolean; count: number; errors?: string[] }> {
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Use the correct backend endpoint for eligible student uploads
      const response = await fetch(`${API_URL}/csv/upload-eligible`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.errors?.[0] || `HTTP error! status: ${response.status}`,
        );
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error uploading file:", error);
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
    const res = await fetch(`${API_URL}/admin/dashboard-stats`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch dashboard stats");
    return res.json();
  },

  // Get audit logs
  async getAuditLogs(
    page = 1,
    limit = 10,
  ): Promise<{
    logs: Array<{
      id: string;
      action: string;
      user: string;
      timestamp: string;
      details: string;
    }>;
    total: number;
  }> {
    const res = await fetch(
      `${API_URL}/admin/audit-logs?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch audit logs");
    return res.json();
  },

  // Get registered students
  async getRegisteredStudents(
    page = 1,
    limit = 10,
  ): Promise<{
    students: Student[];
    total: number;
  }> {
    const res = await fetch(
      `${API_URL}/admin/registered-students?page=${page}&limit=${limit}`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch registered students");
    return res.json();
  },

  // Export students data as CSV
  async exportStudents(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/admin/export/students`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        "students_export.csv";

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting students:", error);
      throw error;
    }
  },

  // Export registrations data as CSV
  async exportRegistrations(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/admin/export/registrations`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        "registrations_export.csv";

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting registrations:", error);
      throw error;
    }
  },

  // Export all data as CSV
  async exportAllData(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/admin/export/all`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        "all_data_export.csv";

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting all data:", error);
      throw error;
    }
  },

  // --- Analytics ---
  async getAnalyticsBySchool(): Promise<
    Array<{ school: string; count: number }>
  > {
    const res = await fetch(`${API_URL}/admin/analytics/by-school`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch analytics by school");
    return res.json();
  },

  async getAnalyticsByProgram(): Promise<
    Array<{ program: string; count: number }>
  > {
    const res = await fetch(`${API_URL}/admin/analytics/by-program`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch analytics by program");
    return res.json();
  },

  async getAnalyticsByCourse(): Promise<
    Array<{ course: string; count: number }>
  > {
    const res = await fetch(`${API_URL}/admin/analytics/by-course`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch analytics by course");
    return res.json();
  },

  async getRegistrationsOverTime(): Promise<
    Array<{ date: string; count: number }>
  > {
    const res = await fetch(
      `${API_URL}/admin/analytics/registrations-over-time`,
      {
        headers: getAuthHeaders(),
      },
    );
    if (!res.ok) throw new Error("Failed to fetch registration trends");
    return res.json();
  },

  async exportAnalyticsCsv(): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/admin/analytics/export-csv`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`,
        );
      }
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        "analytics_export.csv";
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting analytics:", error);
      throw error;
    }
  },
};
