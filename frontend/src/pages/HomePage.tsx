import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { GraduationCap, CheckCircle, Clock, Mail } from 'lucide-react';
import Button from '../components/ui/Button';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col min-h-[calc(100vh-14rem)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-[#1a365d] to-[#2a4365] text-white py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Graduation Portal
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            A streamlined way to register for your upcoming graduation ceremony
          </p>
          {user ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/registration')}
              variant="secondary"
            >
              Continue to Registration
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              variant="secondary"
            >
              Login to Register
            </Button>
          )}
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-blue-100 rounded-full p-4 mb-4">
                <CheckCircle size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Verify Eligibility</h3>
              <p className="text-gray-600">
                Our system automatically checks your eligibility based on your student ID and academic records.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-green-100 rounded-full p-4 mb-4">
                <GraduationCap size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Register</h3>
              <p className="text-gray-600">
                Complete your graduation registration form with personal details and guest information.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg shadow-sm flex flex-col items-center text-center">
              <div className="bg-purple-100 rounded-full p-4 mb-4">
                <Mail size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Receive Confirmation</h3>
              <p className="text-gray-600">
                Get your confirmation email with all the details you need for the graduation day.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Important Dates */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Important Dates</h2>
          
          <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
            <div className="bg-[#1a365d] text-white py-3 px-6">
              <h3 className="text-xl font-semibold">2025 Graduation Timeline</h3>
            </div>
            
            <div className="divide-y">
              <div className="flex items-start p-6">
                <div className="bg-blue-100 rounded-full p-2 mr-4">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Registration Deadline</h4>
                  <p className="text-gray-600">April 15, 2025 at 11:59 PM</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="bg-blue-100 rounded-full p-2 mr-4">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Gown Collection Deadline</h4>
                  <p className="text-gray-600">May 10, 2025 at 2:00 PM</p>
                </div>
              </div>
              
              <div className="flex items-start p-6">
                <div className="bg-blue-100 rounded-full p-2 mr-4">
                  <Clock size={20} className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-1">Graduation Ceremony</h4>
                  <p className="text-gray-600">October 15, 2025 at 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-[#1a365d] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Register?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Don't wait until the last minute. Register today to secure your spot in the graduation ceremony.
          </p>
          {user ? (
            <Button 
              size="lg" 
              onClick={() => navigate('/registration')}
              variant="secondary"
            >
              Continue to Registration
            </Button>
          ) : (
            <Button 
              size="lg" 
              onClick={() => navigate('/login')}
              variant="secondary"
            >
              Login to Register
            </Button>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;