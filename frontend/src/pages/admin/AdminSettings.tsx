import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import TextArea from '../../components/ui/TextArea';
import Checkbox from '../../components/ui/Checkbox';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [settings, setSettings] = useState({
    // Email settings
    emailService: 'gmail',
    emailApiKey: '',
    emailFromAddress: 'graduation@university.edu',
    emailFromName: 'University Graduation Office',
    // Gmail SMTP settings
    gmailUsername: '',
    gmailPassword: '',
    gmailAppPassword: '',
    // Registration settings
    registrationOpen: true,
    registrationDeadline: '2025-07-04T23:59',
    maxGuests: 4,
    // Ceremony settings
    ceremonyDate: '2025-05-15T10:00',
    ceremonyLocation: 'GIMPA Main Campus Auditorium',
    ceremonyAddress: '123 University Ave, City, State 12345',
    // Gown settings
    gownCollectionDeadline: '2025-05-10T14:00',
    gownReturnDeadline: '2025-08-08T23:59',
    // Email templates
    confirmationTemplate: 'Dear {{name}},\n\nThank you for registering for the graduation ceremony. Your confirmation ID is {{confirmationId}}.\n\nDetails:\nDate: May 15, 2025\nTime: 10:00 AM\nLocation: GIMPA Main Campus Auditorium\n\nPlease arrive at least 1 hour before the ceremony.\n\nRegards,\nUniversity Graduation Office',
    reminderTemplate: 'Dear {{name}},\n\nThis is a reminder that the graduation ceremony is approaching. Please remember to bring your confirmation ID {{confirmationId}} and a valid photo ID.\n\nRegards,\nUniversity Graduation Office'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          setSettings(prev => ({
            ...prev,
            registrationDeadline: data.registrationDeadline?.replace('Z', '') || prev.registrationDeadline,
            ceremonyDate: data.ceremonyDate?.replace('Z', '') || prev.ceremonyDate,
            ceremonyLocation: data.ceremonyLocation || prev.ceremonyLocation,
            gownCollectionDeadline: data.gownCollectionDeadline?.replace('Z', '') || prev.gownCollectionDeadline,
            gownReturnDeadline: data.gownReturnDeadline?.replace('Z', '') || prev.gownReturnDeadline,
          }));
        } else {
          const errorData = await response.json().catch(() => ({}));
          console.error('Failed to fetch settings:', errorData);
          throw new Error(errorData.error || 'Failed to fetch settings');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load settings');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSettings();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : value
    }));
  };
  
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          registration_deadline: settings.registrationDeadline + 'Z',
          ceremony_date: settings.ceremonyDate + 'Z',
          ceremony_location: settings.ceremonyLocation,
          gown_collection_deadline: settings.gownCollectionDeadline + 'Z',
          gown_return_deadline: settings.gownReturnDeadline + 'Z',
        }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        throw new Error(errorData.error || errorData.details || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Link to="/admin" className="inline-flex items-center text-blue-600 hover:text-blue-800">
          <ArrowLeft size={18} className="mr-1" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Admin Settings</h1>
        <p className="text-gray-600">Configure system settings for the graduation portal</p>
      </div>
      
      <form onSubmit={handleSave} className="max-w-4xl">
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Email Configuration</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="emailService" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Service Provider
                </label>
                <select
                  id="emailService"
                  name="emailService"
                  value={settings.emailService}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={loading}
                >
                  <option value="gmail">Gmail SMTP</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              
              {settings.emailService === 'gmail' ? (
                <div>
                  <label htmlFor="gmailUsername" className="block text-sm font-medium text-gray-700 mb-1">
                    Gmail Username
                  </label>
                  <input
                    type="email"
                    id="gmailUsername"
                    name="gmailUsername"
                    value={settings.gmailUsername}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="your-email@gmail.com"
                    disabled={loading}
                  />
                </div>
              ) : (
                <TextInput
                  id="emailApiKey"
                  name="emailApiKey"
                  label="API Key"
                  value={settings.emailApiKey}
                  onChange={handleChange}
                  type="password"
                  disabled={loading}
                />
              )}
            </div>
            
            {settings.emailService === 'gmail' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="gmailAppPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Gmail App Password
                  </label>
                  <input
                    type="password"
                    id="gmailAppPassword"
                    name="gmailAppPassword"
                    value={settings.gmailAppPassword}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="16-character app password"
                    disabled={loading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Generate this in your Google Account settings under Security &gt; 2-Step Verification &gt; App passwords
                  </p>
                </div>
                
                <div>
                  <label htmlFor="gmailPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Gmail Password (Legacy)
                  </label>
                  <input
                    type="password"
                    id="gmailPassword"
                    name="gmailPassword"
                    value={settings.gmailPassword}
                    onChange={handleChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="Your Gmail password"
                    disabled={loading}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Only use if you don't have 2FA enabled (not recommended)
                  </p>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="emailFromName"
                name="emailFromName"
                label="From Name"
                value={settings.emailFromName}
                onChange={handleChange}
                disabled={loading}
              />
              
              <TextInput
                id="emailFromAddress"
                name="emailFromAddress"
                label="From Email Address"
                value={settings.emailFromAddress}
                onChange={handleChange}
                type="email"
                disabled={loading}
              />
            </div>
            
            {settings.emailService === 'gmail' && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      Gmail SMTP Setup Instructions
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Enable 2-Step Verification in your Google Account</li>
                        <li>Generate an App Password: Google Account → Security → 2-Step Verification → App passwords</li>
                        <li>Use your Gmail address as the username</li>
                        <li>Use the 16-character app password (not your regular password)</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Registration Settings</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <Checkbox
              id="registrationOpen"
              name="registrationOpen"
              label="Registration is currently open"
              checked={settings.registrationOpen}
              onChange={(e) => setSettings({...settings, registrationOpen: e.target.checked})}
              disabled={loading}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="registrationDeadline"
                name="registrationDeadline"
                label="Registration Deadline"
                type="datetime-local"
                value={settings.registrationDeadline}
                onChange={handleChange}
                disabled={loading}
              />
              
              <div>
                <label htmlFor="maxGuests" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Guests per Student
                </label>
                <select
                  id="maxGuests"
                  name="maxGuests"
                  value={settings.maxGuests.toString()}
                  onChange={handleChange}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  disabled={loading}
                >
                  {[0, 1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num}>{num}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Ceremony Details</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="ceremonyDate"
                name="ceremonyDate"
                label="Ceremony Date & Time"
                type="datetime-local"
                value={settings.ceremonyDate}
                onChange={handleChange}
                disabled={loading}
              />
              
              <TextInput
                id="ceremonyLocation"
                name="ceremonyLocation"
                label="Venue Name"
                value={settings.ceremonyLocation}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
            
            <TextInput
              id="ceremonyAddress"
              name="ceremonyAddress"
              label="Venue Address"
              value={settings.ceremonyAddress}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Gown Management</h2>
          </div>
          
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextInput
                id="gownCollectionDeadline"
                name="gownCollectionDeadline"
                label="Gown Collection Deadline"
                type="datetime-local"
                value={settings.gownCollectionDeadline}
                onChange={handleChange}
                disabled={loading}
              />
              
              <TextInput
                id="gownReturnDeadline"
                name="gownReturnDeadline"
                label="Gown Return Deadline"
                type="datetime-local"
                value={settings.gownReturnDeadline}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-800">Email Templates</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <TextArea
              id="confirmationTemplate"
              name="confirmationTemplate"
              label="Confirmation Email Template"
              value={settings.confirmationTemplate}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              helperText="Available variables: {{name}}, {{confirmationId}}, {{date}}, {{location}}"
            />
            
            <TextArea
              id="reminderTemplate"
              name="reminderTemplate"
              label="Reminder Email Template"
              value={settings.reminderTemplate}
              onChange={handleChange}
              rows={8}
              disabled={loading}
              helperText="Available variables: {{name}}, {{confirmationId}}, {{date}}, {{location}}"
            />
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            icon={<Save size={18} />}
          >
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;