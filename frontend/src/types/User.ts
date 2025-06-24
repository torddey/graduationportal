export interface User {
  id: string;
  name: string;
  email: string;
  studentId: string;
  program: string;
  isEligible: boolean;
  hasRegistered: boolean;
  role: "student" | "admin" | "superadmin";
}
