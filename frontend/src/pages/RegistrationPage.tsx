import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { registrationService } from '../services/registrationService';
import RegistrationForm from '../components/registration/RegistrationForm';
import Button from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { CheckCircle } from 'lucide-react';

const RegistrationPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasRegistered, setHasRegistered] = useState(false);
  const [confirmationId, setConfirmationId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!user) return;
      
      try {
        const status = await registrationService.getRegistrationStatus(user.studentId);
        setHasRegistered(status.hasRegistered);
        setConfirmationId(status.confirmationId);
      } catch (error) {
        console.error('Failed to check registration status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkRegistrationStatus();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Graduation Registration</h1>
        <p className="text-gray-600 mb-8">Fill out the form below to register for your graduation ceremony</p>
        
        {hasRegistered ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              You're Already Registered!
            </h2>
            <p className="text-gray-600 mb-6">
              You have successfully registered for the graduation ceremony.
              Your confirmation ID is: <span className="font-semibold">{confirmationId}</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                onClick={() => navigate('/confirmation', { state: { confirmationId } })}
              >
                View Confirmation
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/profile')}
              >
                Update Profile
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-md font-medium text-blue-800">Before you begin</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Please have the following information ready:
                    </p>
                    <ul className="list-disc list-inside mt-1 ml-2">
                      <li>Current contact information</li>
                      <li>Emergency contact details</li>
                      <li>Guest information (maximum 4 guests allowed)</li>
                      <li>Special accommodations needed (if any)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <RegistrationForm />
          </>
        )}
      </div>
    </div>
  );
};

export default RegistrationPage;