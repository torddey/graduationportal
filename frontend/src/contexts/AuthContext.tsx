import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { authService } from "../services/authService";
import type { User } from "../types/User";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userId: string) => Promise<void>;
  verifyOtp: (userId: string, otp: string) => Promise<boolean>;
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
        if (userData) {
          setUser(userData);
          setIsAdmin(userData.role === "admin" || userData.role === "superadmin");
        } else {
          // If no user data is returned but no error was thrown (e.g., no token), ensure logged out state
          logout();
        }
      } catch (error) {
        console.error("Failed to restore authentication state:", error);
        // If an error is caught (e.g., invalid token), logout the user
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async (userId: string): Promise<void> => {
    try {
      setLoading(true);
      await authService.requestOtp(userId);
      // We don't set the user here yet - we'll do that after OTP verification
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: string, otp: string): Promise<boolean> => {
    try {
      setLoading(true);
      const userData = await authService.verifyOtp(userId, otp);
      setUser(userData);
      setIsAdmin(userData.role === "admin" || userData.role === "superadmin");
      return true;
    } catch (error) {
      console.error("OTP verification failed:", error);
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

  const value: AuthContextType = {
    user,
    loading,
    login,
    verifyOtp,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
