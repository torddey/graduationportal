import { Student } from '../types/Student';

export const eligibilityService = {
  // Check if a student is eligible to graduate
  async checkEligibility(studentId: string): Promise<boolean> {
    // This would be an API call to the central student database
    console.log(`Checking eligibility for student: ${studentId}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo purposes, most IDs are considered eligible
        const isEligible = Math.random() > 0.2;
        console.log(`Student ${studentId} eligibility: ${isEligible}`);
        resolve(isEligible);
      }, 1000);
    });
  },
  
  // Get full student details
  async getStudentDetails(studentId: string): Promise<Student> {
    // This would be an API call to get student details
    console.log(`Getting details for student: ${studentId}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const student: Student = {
          id: studentId,
          name: 'Jane Smith',
          email: 'jane.smith@university.edu',
          studentId: studentId,
          program: 'Computer Science',
          faculty: 'Engineering',
          gpa: 3.8,
          isEligible: true,
          graduationTerm: 'Spring 2025',
          completedCredits: 120,
          requiredCredits: 120,
          address: '123 University Ave',
          phone: '555-123-4567'
        };
        
        resolve(student);
      }, 1000);
    });
  }
};