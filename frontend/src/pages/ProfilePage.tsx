import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';
import TextInput from '../components/ui/TextInput';
import toast from 'react-hot-toast';
import { User, Mail, Phone, MapPin } from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '050-123-4567', // Mock data
    address: 'East Legon. Accra, Ghana.' // Mock data
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Profile updated successfully');
      setLoading(false);
    }, 1000);
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Your Profile</h1>
        <p className="text-gray-600 mb-8">Update your contact information for graduation communications</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Summary */}
          <div className="col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col items-center">
                <div className="h-24 w-24 rounded-full bg-[#1a365d] flex items-center justify-center text-white text-3xl font-bold mb-4">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <h2 className="text-xl font-semibold text-gray-800 mb-1">{user?.name}</h2>
                <p className="text-gray-500 mb-4">{user?.program}</p>
                
                <div className="w-full pt-4 border-t">
                  <div className="flex items-center mb-3">
                    <User size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">{user?.studentId}</span>
                  </div>
                  <div className="flex items-center mb-3">
                    <Mail size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">{user?.email}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin size={18} className="text-gray-500 mr-2" />
                    <span className="text-gray-700">College of {user?.program}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Update Form */}
          <div className="col-span-1 md:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">Update Contact Information</h2>
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <TextInput
                    id="name"
                    name="name"
                    label="Full Name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  
                  <TextInput
                    id="email"
                    name="email"
                    label="Email Address"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  
                  <TextInput
                    id="phone"
                    name="phone"
                    label="Phone Number"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  
                  <TextInput
                    id="address"
                    name="address"
                    label="Mailing Address"
                    value={form.address}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                  
                  <div className="mt-6">
                    <Button
                      type="submit"
                      loading={loading}
                      disabled={loading}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </form>
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Graduation Status</h3>
                <div className="bg-green-50 border-l-4 border-green-400 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-green-700">
                        <span className="font-medium">Registration Complete!</span> You are registered for the 2025 graduation ceremony.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;