import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (studentId: string) => Promise<void>;
  verifyOtp: (otp: string, studentId: string) => Promise<boolean>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Check for existing auth token on app load
    const checkAuthStatus = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setIsAdmin(userData?.role === 'admin');
      } catch (error) {
        console.error('Failed to restore authentication state:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (studentId: string): Promise<void> => {
    try {
      setLoading(true);
      await authService.requestOtp(studentId);
      // We don't set the user here yet - we'll do that after OTP verification
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (otp: string, studentId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await authService.verifyOtp(otp, studentId);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      return true;
    } catch (error) {
      console.error('OTP verification failed:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAdmin(false);
  };

  const value = {
    user,
    loading,
    login,
    verifyOtp,
    logout,
    isAdmin
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};