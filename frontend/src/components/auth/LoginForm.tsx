import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';

const LoginForm = () => {
  const [step, setStep] = useState<'studentId' | 'otp'>('studentId');
  const [studentId, setStudentId] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, verifyOtp } = useAuth();
  const navigate = useNavigate();

  const handleStudentIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId.trim()) {
      toast.error('Please enter your student ID');
      return;
    }

    setIsSubmitting(true);
    try {
      // Store studentId temporarily for admin check
      localStorage.setItem('tempStudentId', studentId);
      await login(studentId);
      toast.success('OTP sent to your registered email');
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP. Please check your student ID.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await verifyOtp(otp);
      if (success) {
        toast.success('Login successful');
        // Redirect admin to dashboard, students to registration
        const isAdmin = localStorage.getItem('tempStudentId') === 'admin';
        navigate(isAdmin ? '/admin' : '/registration');
      } else {
        toast.error('Invalid OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to verify OTP. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full mx-auto">
      {step === 'studentId' ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login with Student ID</h2>
          <form onSubmit={handleStudentIdSubmit}>
            <div className="mb-6">
              <TextInput
                id="studentId"
                label="Student ID"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="Enter your student ID"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              fullWidth 
              loading={isSubmitting}
              disabled={isSubmitting || !studentId.trim()}
            >
              Request OTP
            </Button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Enter OTP</h2>
          <p className="text-gray-600 mb-4">
            We've sent a one-time password to your registered email.
          </p>
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-6">
              <TextInput
                id="otp"
                label="One-Time Password"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                required
                maxLength={6}
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              fullWidth 
              loading={isSubmitting}
              disabled={isSubmitting || otp.length !== 6}
            >
              Verify & Login
            </Button>
            <button
              type="button"
              className="mt-4 text-center w-full text-blue-600 hover:text-blue-800"
              onClick={() => setStep('studentId')}
              disabled={isSubmitting}
            >
              Back to Student ID
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default LoginForm;