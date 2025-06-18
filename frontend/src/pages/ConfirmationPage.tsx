import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DownloadButton from '../components/student/DownloadButton';
import Button from '../components/ui/Button';
import { User, Mail, Users, MapPin, Calendar, Clock, Share2, CheckCircle } from 'lucide-react';

interface LocationState {
  confirmationId?: string;
}

interface Settings {
  ceremonyDate: string;
  ceremonyLocation: string;
  gownCollectionDeadline: string;
  gownReturnDeadline: string;
}

// Use relative URLs to work with Vite proxy
const API_BASE = '/api';

const ConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [confirmationId, setConfirmationId] = useState<string>('');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.confirmationId) {
      setConfirmationId(state.confirmationId);
    } else {
      // If no confirmation ID is provided, create a mock one in GRAD format
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      setConfirmationId(`GIMPA${timestamp}${random}`);
    }

    // Debug: Log current user info
    console.log('Current user:', user);
    console.log('User studentId:', user?.studentId);

    // Fetch settings
    const fetchSettings = async () => {
      try {
        console.log('Fetching settings from:', `${API_BASE}/admin/public-settings`);
        const response = await fetch(`${API_BASE}/admin/public-settings`);
        console.log('Settings response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('Settings data received:', data);
          setSettings(data);
        } else {
          console.warn('Settings fetch failed, using defaults:', response.status, response.statusText);
          // Silently use default values - this is not critical for PDF download
        }
      } catch (error) {
        console.warn('Settings fetch error, using defaults:', error);
        // Silently use default values - this is not critical for PDF download
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [location, user]);
  
  const handleShareConfirmation = () => {
    // In a real application, this might open a sharing dialog
    console.log('Sharing confirmation...');
    alert('This feature would enable sharing in a production environment.');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Format date and time for display
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }) + ' at ' + date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading confirmation details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header */}
          <div className="bg-[#1a365d] text-white p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircle className="mr-3" size={32} />
              <h1 className="text-3xl font-bold">Registration Confirmed!</h1>
            </div>
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
                  <p className="text-gray-800">
                    {settings ? formatDate(settings.ceremonyDate) : 'May 15, 2025'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Time</p>
                  <p className="text-gray-800">
                    {settings ? formatTime(settings.ceremonyDate) : '10:00 AM'}
                  </p>
                </div>
              </div>
              <div className="flex items-start md:col-span-2">
                <MapPin className="mr-2 text-gray-500 mt-1" size={20} />
                <div>
                  <p className="font-medium text-gray-700">Venue</p>
                  <p className="text-gray-800">
                    {settings?.ceremonyLocation || 'GIMPA Main Campus Auditorium'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Important Notes */}
          <div className="p-6 border-b bg-yellow-50">
            <h2 className="text-xl font-semibold text-gray-800 mb-3">Important Notes</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Please arrive at least 30 minutes before the ceremony
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Bring this confirmation with you on the day
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Wear appropriate academic attire
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Contact the graduation office if you need to make changes
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Gown collection deadline: {settings ? formatDateTime(settings.gownCollectionDeadline) : 'May 10, 2025 at 2:00 PM'}
              </li>
              <li className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                Gown return deadline: {settings ? formatDateTime(settings.gownReturnDeadline) : 'August 8, 2025'}
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