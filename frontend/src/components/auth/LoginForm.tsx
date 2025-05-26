import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import TextInput from '../ui/TextInput';

const LoginForm = () => {
  const [step, setStep] = useState<'userId' | 'otp'>('userId');
  const [userId, setUserId] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, verifyOtp, user } = useAuth();
  const navigate = useNavigate();

  const handleUserIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId.trim()) {
      toast.error('Please enter your User ID');
      return;
    }

    setIsSubmitting(true);
    try {
      localStorage.setItem('tempUserId', userId);
      await login(userId);
      toast.success('OTP sent to your registered email');
      setStep('otp');
    } catch (error) {
      toast.error('Failed to send OTP. Please check your User ID.');
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
      const success = await verifyOtp(userId, otp);
      if (success) {
        toast.success('Login successful');
        localStorage.removeItem('tempUserId');
        // Use the user object from context to determine role
        if (user?.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/registration');
        }
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
      {step === 'userId' ? (
        <>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Login</h2>
          <form onSubmit={handleUserIdSubmit}>
            <div className="mb-6">
              <TextInput
                id="userId"
                label="User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your Student ID, Username, or Email"
                required
                disabled={isSubmitting}
              />
            </div>
            <Button 
              type="submit" 
              fullWidth 
              loading={isSubmitting}
              disabled={isSubmitting || !userId.trim()}
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
              onClick={() => setStep('userId')}
              disabled={isSubmitting}
            >
              Back to User ID
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default LoginForm;