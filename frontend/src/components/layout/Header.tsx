import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Menu, X, User, LogOut } from "lucide-react";
import Button from "../ui/Button";
import logo from "../../assets/logo_GIMPA.png";
const Header = () => {
  const { user, logout, isAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-[#1a365d] text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="" className="flex items-center space-x-2">
            <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`hover:text-[#ffc425] transition ${
                location.pathname === "/" ? "text-[#ffc425] font-medium" : ""
              }`}
            >
              Home
            </Link>

            <Link
              to="/notice"
              className={`hover:text-[#ffc425] transition ${
                location.pathname === "/notice"
                  ? "text-[#ffc425] font-medium"
                  : ""
              }`}
            >
              Notice
            </Link>

            {user && (
              <Link
                to="/registration"
                className={`hover:text-[#ffc425] transition ${
                  location.pathname === "/registration"
                    ? "text-[#ffc425] font-medium"
                    : ""
                }`}
              >
                Registration
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`hover:text-[#ffc425] transition ${
                  location.pathname.startsWith("/admin") &&
                  !location.pathname.startsWith("/admin/analytics")
                    ? "text-[#ffc425] font-medium"
                    : ""
                }`}
              >
                Admin
              </Link>
            )}
            {isAdmin && (
              <Link
                to="/admin/analytics"
                className={`hover:text-[#ffc425] transition ${
                  location.pathname.startsWith("/admin/analytics")
                    ? "text-[#ffc425] font-medium"
                    : ""
                }`}
              >
                Analytics
              </Link>
            )}

            {user && (
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <button className="flex items-center space-x-1 hover:text-[#ffc425] transition">
                    <User size={18} />
                    <span>{user?.name ? user.name.split(" ")[0] : "User"}</span>
                  </button>
                  <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                      onClick={closeMenu}
                    >
                      Profile
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin/settings"
                        className="block px-4 py-2 text-sm text-gray-800 hover:bg-gray-100"
                        onClick={closeMenu}
                      >
                        Settings
                      </Link>
                    )}
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
                <Button variant="secondary" size="sm">
                  Login
                </Button>
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
                  location.pathname === "/" ? "text-[#ffc425] font-medium" : ""
                }`}
                onClick={closeMenu}
              >
                Home
              </Link>

              <Link
                to="/notice"
                className={`hover:text-[#ffc425] transition ${
                  location.pathname === "/notice"
                    ? "text-[#ffc425] font-medium"
                    : ""
                }`}
                onClick={closeMenu}
              >
                Notice
              </Link>

              {user && (
                <Link
                  to="/registration"
                  className={`hover:text-[#ffc425] transition ${
                    location.pathname === "/registration"
                      ? "text-[#ffc425] font-medium"
                      : ""
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
                    location.pathname.startsWith("/admin") &&
                    !location.pathname.startsWith("/admin/analytics")
                      ? "text-[#ffc425] font-medium"
                      : ""
                  }`}
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              )}
              {isAdmin && (
                <Link
                  to="/admin/analytics"
                  className={`hover:text-[#ffc425] transition ${
                    location.pathname.startsWith("/admin/analytics")
                      ? "text-[#ffc425] font-medium"
                      : ""
                  }`}
                  onClick={closeMenu}
                >
                  Analytics
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
                  {isAdmin && (
                    <Link
                      to="/admin/settings"
                      className="hover:text-[#ffc425] transition"
                      onClick={closeMenu}
                    >
                      Settings
                    </Link>
                  )}
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
                <Link to="/login" onClick={closeMenu}>
                  <Button variant="secondary" size="sm">
                    Login
                  </Button>
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
