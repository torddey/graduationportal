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
  dignitaries: "yes" | "no";
  specialRequirements: "physical_disability" | "visual_impairment" | "none";
  attendanceConfirmed: boolean;
  agreeToTerms: boolean;
}
