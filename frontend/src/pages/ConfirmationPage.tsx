import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DownloadButton from '../components/student/DownloadButton';
import Button from '../components/ui/Button';
import { User, Mail, Users, MapPin, Calendar, Clock, Share2 } from 'lucide-react';

interface LocationState {
  confirmationId?: string;
}

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmationId, setConfirmationId] = useState<string>('');
  
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.confirmationId) {
      setConfirmationId(state.confirmationId);
    } else {
      // If no confirmation ID is provided, create a mock one in GRAD format
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setConfirmationId(`GRAD${timestamp}${random}`);
    }
  }, [location]);
  
  const handleShareConfirmation = () => {
    // In a real application, this might open a sharing dialog
    console.log('Sharing confirmation...');
    alert('This feature would enable sharing in a production environment.');
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a365d] text-white p-6 text-center">
            <h1 className="text-3xl font-bold mb-2">Registration Confirmed!</h1>
            <p className="text-xl">
              Confirmation ID: <span className="font-mono font-medium">{confirmationId}</span>
            </p>
          </div>
          
          {/* Student Information */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Student Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <User className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Name</p>
                  <p className="text-gray-800">{user?.name || 'Jane Smith'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-800">{user?.email || 'jane.smith@university.edu'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Program</p>
                  <p className="text-gray-800">{user?.program || 'Computer Science'}</p>
                </div>
              </div>
              <div className="flex items-start">
                <User className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Student ID</p>
                  <p className="text-gray-800">{user?.studentId || 'ST12345'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ceremony Details */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Ceremony Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <Calendar className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Date</p>
                  <p className="text-gray-800">May 15, 2025</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Time</p>
                  <p className="text-gray-800">10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start md:col-span-2">
                <MapPin className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Venue</p>
                  <p className="text-gray-800">GIMPA Main Campus Auditorium</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Notes */}
          <div className="p-6 border-b bg-blue-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Important Notes</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Please arrive at least 30 minutes before the ceremony
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Bring this confirmation with you on the day
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Wear appropriate academic attire
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">•</span>
                Contact the graduation office if you need to make changes
              </li>
            </ul>
          </div>
          
          {/* Action Buttons */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 justify-center">
            {user?.studentId && (
              <DownloadButton studentId={user.studentId} variant="primary" />
            )}
            <Button 
              variant="outline"
              onClick={handleShareConfirmation}
              icon={<Share2 size={18} />}
            >
              Share Confirmation
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/profile')}
            >
              Update Information
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;