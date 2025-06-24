import { RegistrationForm } from "../types/RegistrationForm";

// Use relative URLs to work with Vite proxy
const API_BASE = "/api";

export const registrationService = {
  // Submit registration for graduation
  async submitRegistration(
    form: RegistrationForm,
  ): Promise<{ success: boolean; confirmationId?: string }> {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/registration/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(form),
    });
    if (!res.ok) throw new Error("Failed to submit registration");
    return res.json();
  },

  // Get registration status for a student
  async getRegistrationStatus(
    studentId: string,
  ): Promise<{ hasRegistered: boolean; confirmationId?: string }> {
    const token = localStorage.getItem("authToken");
    const res = await fetch(`${API_BASE}/registration/status/${studentId}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) throw new Error("Failed to get registration status");
    return res.json();
  },

  // Export confirmation as PDF
  async exportConfirmationPDF(studentId: string): Promise<void> {
    try {
      console.log("Starting PDF export for student:", studentId);
      const token = localStorage.getItem("authToken");
      console.log("Using API base:", API_BASE);

      const response = await fetch(
        `${API_BASE}/registration/export/${studentId}`,
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      );

      console.log("PDF export response status:", response.status);
      console.log(
        "PDF export response headers:",
        Object.fromEntries(response.headers.entries()),
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("PDF export error response:", errorData);
        throw new Error(
          errorData.error || `Download failed: ${response.status}`,
        );
      }

      // Check if response is actually a PDF
      const contentType = response.headers.get("Content-Type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("application/pdf")) {
        const text = await response.text();
        console.error(
          "Invalid content type:",
          contentType,
          "Response body:",
          text,
        );
        throw new Error("Invalid response format. Expected PDF.");
      }

      // Get the filename from the Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition");
      const filename =
        contentDisposition?.split("filename=")[1]?.replace(/"/g, "") ||
        `graduation_confirmation_${studentId}.pdf`;
      console.log("Downloading file:", filename);

      // Create blob and download
      const blob = await response.blob();
      console.log("Blob size:", blob.size);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("PDF download completed successfully");
    } catch (error) {
      console.error("Error exporting confirmation PDF:", error);
      throw error;
    }
  },
};
