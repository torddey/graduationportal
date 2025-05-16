import { RegistrationForm } from '../types/RegistrationForm';

export const registrationService = {
  // Submit registration for graduation
  async submitRegistration(form: RegistrationForm): Promise<{ success: boolean; confirmationId?: string }> {
    console.log('Submitting registration:', form);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate a confirmation ID
        const confirmationId = `GRAD-${Date.now().toString().slice(-6)}`;
        
        // Update local storage to mark user as registered
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          parsed.hasRegistered = true;
          localStorage.setItem('userData', JSON.stringify(parsed));
        }
        
        resolve({
          success: true,
          confirmationId
        });
      }, 1500);
    });
  },
  
  // Get registration status for a student
  async getRegistrationStatus(studentId: string): Promise<{ hasRegistered: boolean; confirmationId?: string }> {
    console.log(`Checking registration status for: ${studentId}`);
    
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        const userData = localStorage.getItem('userData');
        if (userData) {
          const parsed = JSON.parse(userData);
          if (parsed.hasRegistered) {
            resolve({
              hasRegistered: true,
              confirmationId: `GRAD-${Date.now().toString().slice(-6)}`
            });
          } else {
            resolve({ hasRegistered: false });
          }
        } else {
          resolve({ hasRegistered: false });
        }
      }, 800);
    });
  }
};