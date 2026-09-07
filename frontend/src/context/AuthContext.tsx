import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../data/mockData';
import { MOCK_USERS } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  currentView: string;
  setCurrentView: (view: string) => void;
  login: (email: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, email: string, phone?: string, company?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<string>('overview');

  // Set default view based on user role when user changes
  useEffect(() => {
    if (user) {
      setCurrentView('overview');
    } else {
      setCurrentView('login');
    }
  }, [user]);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    // Simulate API lag
    await new Promise((resolve) => setTimeout(resolve, 800));

    const matchedUser = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role
    );

    if (matchedUser) {
      setUser(matchedUser);
      setLoading(false);
      return true;
    } else {
      // Create user on-the-fly for ease of evaluation or trigger simulated error
      if (email.includes('@')) {
        const newUser: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0].toUpperCase(),
          email: email,
          role: role,
          avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
          joinedDate: new Date().toISOString().split('T')[0]
        };
        setUser(newUser);
        setLoading(false);
        return true;
      }
      setError('Invalid credentials or role mismatch. Try: buyer@example.com (Buyer) or agent@example.com (Agent).');
      setLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, role: UserRole): Promise<boolean> => {
    setLoading(true);
    setError(null);

    // Simulate API lag
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!name || !email || !role) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return false;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    setUser(newUser);
    setLoading(false);
    return true;
  };

  const logout = () => {
    setUser(null);
    setError(null);
  };

  const updateProfile = async (name: string, email: string, phone?: string, company?: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setUser({
      ...user,
      name,
      email,
      phone,
      company
    });
    setLoading(false);
    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        currentView,
        setCurrentView,
        login,
        register,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
