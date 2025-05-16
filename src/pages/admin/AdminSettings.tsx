import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import TextInput from '../../components/ui/TextInput';
import TextArea from '../../components/ui/TextArea';
import Checkbox from '../../components/ui/Checkbox';
import toast from 'react-hot-toast';

const AdminSettings = () => {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    // Email settings
    emailService: 'sendgrid',
    emailApiKey: '••••••••••••••••••••••••••',
    emailFromAddress: 'graduation@university.edu',
    emailFromName: 'University Graduation Office',
    // Registration settings
    registrationOpen: true,
    registrationDeadline: '2025-04-15T23:59',
    maxGuests: 4,
    // Ceremony settings
    ceremonyDate: '2025-05-15T10:00',
    ceremonyLocation: 'University Main Auditorium',
    ceremonyAddress: '123 University Ave, City, State 12345',
    // Email templates
    confirmationTemplate: 'Dear {{name}},\n\nThank you for registering for the graduation ceremony. Your confirmation ID is {{confirmationId}}.\n\nDetails:\nDate: May 15, 2025\nTime: 10:00 AM\nLocation: University Main Auditorium\n\nPlease arrive at least 1 hour before the ceremony.\n\nRegards,\nUniversity Graduation Office',
    reminderTemplate: 'Dear {{name}},\n\nThis is a reminder that the graduation ceremony is approaching. Please remember to bring your confirmation ID {{confirmationId}} and a valid photo ID.\n\nRegards,\nUniversity Graduation Office'
  });
  
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
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Settings saved successfully');
      setLoading(false);
    }, 1000);
  };
  
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
                  <option value="sendgrid">SendGrid</option>
                  <option value="ses">Amazon SES</option>
                  <option value="mailgun">Mailgun</option>
                </select>
              </div>
              
              <TextInput
                id="emailApiKey"
                name="emailApiKey"
                label="API Key"
                value={settings.emailApiKey}
                onChange={handleChange}
                type="password"
                disabled={loading}
              />
            </div>
            
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