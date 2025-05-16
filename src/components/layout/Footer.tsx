import { GraduationCap } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-[#1a365d] text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <GraduationCap size={24} className="text-[#ffc425]" />
              <span className="font-bold text-xl">University Graduation Portal</span>
            </div>
            <p className="text-gray-300 text-sm">
              Dedicated to making your graduation experience seamless and memorable.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-[#ffc425] transition">Home</a></li>
              <li><a href="/login" className="text-gray-300 hover:text-[#ffc425] transition">Login</a></li>
              <li><a href="/registration" className="text-gray-300 hover:text-[#ffc425] transition">Registration</a></li>
              <li><a href="#" className="text-gray-300 hover:text-[#ffc425] transition">Help & FAQ</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: graduation@university.edu</li>
              <li>Phone: +1 (555) 123-4567</li>
              <li>Address: 123 University Ave, City, State</li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-700 text-center text-gray-400 text-sm">
          <p>&copy; {currentYear} University Graduation Portal. All rights reserved.</p>
          <p className="mt-2">
            <a href="#" className="hover:text-[#ffc425] transition">Privacy Policy</a> | 
            <a href="#" className="hover:text-[#ffc425] transition ml-2">Terms of Service</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;