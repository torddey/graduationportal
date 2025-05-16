import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Menu, X, User, LogOut, GraduationCap } from 'lucide-react';
import Button from '../ui/Button';

const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-[#1a365d] text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <GraduationCap size={32} className="text-[#ffc425]" />
            <span className="font-bold text-xl">University Graduation Portal</span>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              to="/" 
              className={`hover:text-[#ffc425] transition ${
                location.pathname === '/' ? 'text-[#ffc425] font-medium' : ''
              }`}
            >
              Home
            </Link>
            
            {user && (
              <Link 
                to="/registration" 
                className={`hover:text-[#ffc425] transition ${
                  location.pathname === '/registration' ? 'text-[#ffc425] font-medium' : ''
                }`}
              >
                Registration
              </Link>
            )}
            
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`hover:text-[#ffc425] transition ${
                  location.pathname.startsWith('/admin') ? 'text-[#ffc425] font-medium' : ''
                }`}
              >
                Admin
              </Link>
            )}
            
            {user && (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-[#ffc425] transition">
                    <User size={18} />
                    <span>{user.name.split(' ')[0]}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 flex items-center"
                    >
                      <LogOut size={16} className="mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {!user && (
              <Link to="/login">
                <Button variant="secondary" size="sm">Login</Button>
              </Link>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-2">
            <div className="flex flex-col space-y-3">
              <Link 
                to="/" 
                className={`hover:text-[#ffc425] transition ${
                  location.pathname === '/' ? 'text-[#ffc425] font-medium' : ''
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>
              
              {user && (
                <Link 
                  to="/registration" 
                  className={`hover:text-[#ffc425] transition ${
                    location.pathname === '/registration' ? 'text-[#ffc425] font-medium' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Registration
                </Link>
              )}
              
              {isAdmin && (
                <Link 
                  to="/admin" 
                  className={`hover:text-[#ffc425] transition ${
                    location.pathname.startsWith('/admin') ? 'text-[#ffc425] font-medium' : ''
                  }`}
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}
              
              {user && (
                <>
                  <Link 
                    to="/profile" 
                    className="hover:text-[#ffc425] transition"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      closeMenu();
                    }}
                    className="text-left hover:text-[#ffc425] transition flex items-center"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </button>
                </>
              )}
              
              {!user && (
                <Link 
                  to="/login"
                  onClick={closeMenu}
                >
                  <Button variant="secondary" size="sm">Login</Button>
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;