export interface Student {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  faculty: string;
  gpa: number;
  isEligible: boolean;
  graduationTerm: string;
  completedCredits: number;
  requiredCredits: number;
  address: string;
  phone: string;
  role?: 'student' | 'admin'; 
  school: string;
  course: string;
}