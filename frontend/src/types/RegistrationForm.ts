export interface RegistrationForm {
  studentId: string;
  name: string;
  email: string;
  program: string;
  phone: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  guestCount: number;
  specialRequirements: string;
  pronounceName: string;
  attendanceConfirmed: boolean;
  agreeToTerms: boolean;
}