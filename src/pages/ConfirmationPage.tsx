import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import { Calendar, Mail, MapPin, User, Users, Download, Share2 } from 'lucide-react';

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
      // If no confirmation ID is provided, create a mock one
      setConfirmationId(`GRAD-${Date.now().toString().slice(-6)}`);
    }
  }, [location]);
  
  const handleDownloadPDF = () => {
    // In a real application, this would generate and download a PDF
    console.log('Downloading confirmation PDF...');
    alert('This feature would download a PDF in a production environment.');
  };
  
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
                <Users className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Student ID</p>
                  <p className="text-gray-800">{user?.studentId || 'ST12345'}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Ceremony Details */}
          <div className="p-6 border-b bg-gray-50">
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
                  <p className="text-gray-800">10:00 AM - 12:30 PM</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Location</p>
                  <p className="text-gray-800">University Main Auditorium</p>
                </div>
              </div>
              <div className="flex items-start">
                <Users className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Guests</p>
                  <p className="text-gray-800">2 guests confirmed</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Information */}
          <div className="p-6 border-b">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Important Information</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mr-2">1</span>
                <span>Arrive at least <strong>1 hour before</strong> the ceremony for check-in and preparation.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mr-2">2</span>
                <span>Bring this confirmation and a valid photo ID on graduation day.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mr-2">3</span>
                <span>Cap and gown distribution will take place on May 10-14 at the University Bookstore.</span>
              </li>
              <li className="flex items-start">
                <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-800 font-semibold text-sm mr-2">4</span>
                <span>Parking will be available in the North and West campus parking lots.</span>
              </li>
            </ul>
          </div>
          
          {/* Actions */}
          <div className="p-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleDownloadPDF}
              icon={<Download size={18} />}
            >
              Download PDF
            </Button>
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

// This component is missing in the provided imports
const Clock = ({ className, size }: { className?: string, size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size || 24}
    height={size || 24}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);