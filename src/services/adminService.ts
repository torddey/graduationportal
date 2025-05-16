import { Student } from '../types/Student';

export const adminService = {
  // Upload and process CSV of eligible students
  async uploadEligibleStudents(file: File): Promise<{ success: boolean; count: number; errors?: string[] }> {
    console.log(`Processing CSV file: ${file.name}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          count: Math.floor(Math.random() * 200) + 100 // Random number between 100-300
        });
      }, 2000);
    });
  },
  
  // Get dashboard stats
  async getDashboardStats(): Promise<{
    totalEligible: number;
    registered: number;
    pending: number;
    lastUpload: string;
  }> {
    console.log('Fetching dashboard statistics');
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalEligible: 256,
          registered: 128,
          pending: 128,
          lastUpload: new Date(Date.now() - 86400000).toISOString() // Yesterday
        });
      }, 1000);
    });
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
    console.log(`Fetching audit logs: page ${page}, limit ${limit}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const logs = Array(limit).fill(0).map((_, i) => ({
          id: `log-${Date.now()}-${i}`,
          action: ['UPLOAD', 'LOGIN', 'REGISTER', 'EXPORT', 'UPDATE'][Math.floor(Math.random() * 5)],
          user: Math.random() > 0.5 ? 'admin@university.edu' : 'system',
          timestamp: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
          details: 'Lorem ipsum dolor sit amet'
        }));
        
        resolve({
          logs,
          total: 256
        });
      }, 1000);
    });
  },
  
  // Get registered students
  async getRegisteredStudents(page = 1, limit = 10): Promise<{
    students: Student[];
    total: number;
  }> {
    console.log(`Fetching registered students: page ${page}, limit ${limit}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const students = Array(limit).fill(0).map((_, i) => ({
          id: `ST${10000 + i}`,
          name: `Student ${i+1}`,
          email: `student${i+1}@university.edu`,
          studentId: `ST${10000 + i}`,
          program: ['Computer Science', 'Engineering', 'Business', 'Arts', 'Medicine'][Math.floor(Math.random() * 5)],
          faculty: ['Engineering', 'Business', 'Arts', 'Medicine', 'Science'][Math.floor(Math.random() * 5)],
          gpa: (Math.random() * 2 + 2).toFixed(2),
          isEligible: true,
          graduationTerm: 'Spring 2025',
          completedCredits: 120,
          requiredCredits: 120,
          address: `${Math.floor(Math.random() * 1000) + 1} University St`,
          phone: `555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
        }));
        
        resolve({
          students,
          total: 128
        });
      }, 1000);
    });
  }
};