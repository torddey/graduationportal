import { User } from '../types/User';

// In a real app, these would call actual API endpoints
export const authService = {
  // Request OTP for login
  async requestOtp(studentId: string): Promise<void> {
    // This would be an API call to send OTP to student's email
    console.log(`Requesting OTP for student: ${studentId}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('OTP sent to registered email');
        resolve();
      }, 1000);
    });
  },

  // Verify OTP and get user data
  async verifyOtp(otp: string): Promise<User> {
    console.log(`Verifying OTP: ${otp}`);
    
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // For demo purposes, any 6-digit OTP is valid
        if (otp.length === 6 && /^\d+$/.test(otp)) {
          // Check if this is an admin login
          const isAdmin = localStorage.getItem('tempStudentId') === 'admin';
          
          // Simulate successful verification
          const userData: User = isAdmin ? {
            id: 'ADMIN',
            name: 'Admin User',
            email: 'admin@university.edu',
            studentId: 'ADMIN',
            program: 'Administration',
            isEligible: true,
            hasRegistered: false,
            role: 'admin'
          } : {
            id: 'ST12345',
            name: 'Jane Smith',
            email: 'jane.smith@university.edu',
            studentId: 'ST12345',
            program: 'Computer Science',
            isEligible: true,
            hasRegistered: false,
            role: 'student'
          };
          
          // Store auth token in localStorage
          localStorage.setItem('authToken', 'demo-token-xyz');
          localStorage.setItem('userData', JSON.stringify(userData));
          
          resolve(userData);
        } else {
          reject(new Error('Invalid OTP'));
        }
      }, 1000);
    });
  },

  // Get current authenticated user data
  async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    if (!token || !userData) {
      return null;
    }
    
    try {
      // In a real app, we would verify the token with the server
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error('Failed to parse user data', error);
      return null;
    }
  },

  // Logout user
  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('tempStudentId');
  }
};