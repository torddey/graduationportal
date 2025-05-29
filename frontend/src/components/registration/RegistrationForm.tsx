import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { registrationService } from '../../services/registrationService';
import { emailService } from '../../services/emailService';
import { RegistrationForm as RegistrationFormType } from '../../types/RegistrationForm';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';
import TextArea from '../ui/TextArea';
import Checkbox from '../ui/Checkbox';
import Select from '../ui/Select';

const initialState: RegistrationFormType = {
  studentId: '',
  name: '',
  email: '',
  program: '',
  phone: '',
  address: '',
  postalCode: '',
  city: '',
  country: '',
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
  },
  guestCount: 2,
  specialRequirements: '',
  pronounceName: '',
  attendanceConfirmed: false,
  agreeToTerms: false,
};

const RegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<RegistrationFormType>({
    ...initialState,
    studentId: user?.studentId || '',
    name: user?.name || '',
    email: user?.email || '',
    program: user?.program || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: type === 'checkbox' 
          ? (e.target as HTMLInputElement).checked 
          : value
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const registrationData = {
        student_id: form.studentId, 
        name: form.name,
        email: form.email,
        program: form.program,
        faculty: '', 
      };

      const result = await registrationService.submitRegistration(registrationData);
      console.log('Registration successful:', result);
    } catch (error) {
      console.error('Error during registration:', error);
      alert('Failed to submit registration');
    }
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      window.scrollTo(0, 0);
    }
  };

  // Validate current step
  const validateStep = () => {
    if (step === 1) {
      return !!(form.name && form.email && form.phone && form.address && form.postalCode && form.city && form.country);
    }
    if (step === 2) {
      return !!(form.emergencyContact.name && form.emergencyContact.relationship && form.emergencyContact.phone);
    }
    return true;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div key={index} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > index + 1 
                  ? 'bg-green-500 text-white' 
                  : step === index + 1 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
              }`}>
                {step > index + 1 ? '✓' : index + 1}
              </div>
              {index < totalSteps - 1 && (
                <div className={`h-1 w-12 ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}></div>
              )}
            </div>
          ))}
        </div>
        <h2 className="text-2xl font-semibold text-gray-800">
          {step === 1 && 'Personal Information'}
          {step === 2 && 'Emergency Contact & Guests'}
          {step === 3 && 'Graduation Details & Confirmation'}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        {step === 1 && (
          <div className="space-y-4">
            <TextInput
              id="name"
              name="name"
              label="Full Name (as it will appear on your diploma)"
              value={form.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <TextInput
              id="email"
              name="email"
              label="Email Address"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <TextInput
              id="phone"
              name="phone"
              label="Phone Number"
              value={form.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <TextInput
              id="address"
              name="address"
              label="Address"
              value={form.address}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="postalCode"
                name="postalCode"
                label="Postal/Zip Code"
                value={form.postalCode}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              
              <TextInput
                id="city"
                name="city"
                label="City"
                value={form.city}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <TextInput
              id="country"
              name="country"
              label="Country"
              value={form.country}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
        )}
        
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Emergency Contact Information</h3>
              <p className="text-sm text-blue-700">
                Please provide details of someone we can contact in case of emergency during the graduation ceremony.
              </p>
            </div>
            
            <TextInput
              id="emergencyContact.name"
              name="emergencyContact.name"
              label="Emergency Contact Name"
              value={form.emergencyContact.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <TextInput
              id="emergencyContact.relationship"
              name="emergencyContact.relationship"
              label="Relationship to You"
              value={form.emergencyContact.relationship}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <TextInput
              id="emergencyContact.phone"
              name="emergencyContact.phone"
              label="Emergency Contact Phone"
              value={form.emergencyContact.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
            
            <div className="mt-8 border-t pt-6">
              <h3 className="font-semibold text-gray-800 mb-4">Guest Information</h3>
              
              <Select
                id="guestCount"
                name="guestCount"
                label="Number of Guests (Maximum: 4)"
                value={form.guestCount.toString()}
                onChange={handleChange}
                options={[
                  { value: '0', label: '0 - No guests' },
                  { value: '1', label: '1 guest' },
                  { value: '2', label: '2 guests' },
                  { value: '3', label: '3 guests' },
                  { value: '4', label: '4 guests' }
                ]}
                disabled={isSubmitting}
              />
              
              <p className="text-sm text-gray-500 mt-2">
                Each graduate is allowed to bring up to 4 guests to the ceremony.
                Additional tickets may be available after the registration deadline.
              </p>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-2">Program Information</h3>
              <p className="text-gray-700">Graduating from: <span className="font-medium">{form.program}</span></p>
              <p className="text-gray-700">Student ID: <span className="font-medium">{form.studentId}</span></p>
            </div>
            
            <TextInput
              id="pronounceName"
              name="pronounceName"
              label="How to Pronounce Your Name"
              placeholder="e.g., JAY-son SMITH"
              value={form.pronounceName}
              onChange={handleChange}
              disabled={isSubmitting}
              helperText="This helps ensure your name is pronounced correctly during the ceremony"
            />
            
            <TextArea
              id="specialRequirements"
              name="specialRequirements"
              label="Special Requirements or Accessibility Needs"
              placeholder="Please let us know if you have any accessibility requirements or special needs"
              value={form.specialRequirements}
              onChange={handleChange}
              disabled={isSubmitting}
              rows={3}
            />
            
            <Checkbox
              id="attendanceConfirmed"
              name="attendanceConfirmed"
              label="I confirm I will attend the graduation ceremony"
              checked={form.attendanceConfirmed}
              onChange={(e) => setForm({...form, attendanceConfirmed: e.target.checked})}
              disabled={isSubmitting}
            />
            
            <Checkbox
              id="agreeToTerms"
              name="agreeToTerms"
              label="I agree to the terms and conditions of the graduation ceremony"
              checked={form.agreeToTerms}
              onChange={(e) => setForm({...form, agreeToTerms: e.target.checked})}
              disabled={isSubmitting}
              required
            />
            
            <div className="text-sm text-gray-500 mt-2">
              By submitting this form, you consent to the use of your information for graduation-related purposes
              and agree to abide by the university's code of conduct during the ceremony.
            </div>
          </div>
        )}
        
        <div className="flex justify-between mt-8">
          {step > 1 ? (
            <Button
              type="button"
              onClick={prevStep}
              variant="outline"
              disabled={isSubmitting}
            >
              Previous
            </Button>
          ) : (
            <div></div>
          )}
          
          {step < totalSteps ? (
            <Button
              type="button"
              onClick={nextStep}
              disabled={isSubmitting || !validateStep()}
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !form.agreeToTerms}
            >
              Submit Registration
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default RegistrationForm;