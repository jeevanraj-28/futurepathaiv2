import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, SubscriptionStatus } from '../types';
import { ApiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  subscription: SubscriptionStatus | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (data: any) => Promise<void>;
  demoLogin: (role: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const data = await ApiService.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setSubscription(data.subscription || { planCode: 'FREE', planName: 'Free Explorer', isActive: true });
      }
    } catch (err) {
      // Session invalid or token expired
      ApiService.clearToken();
      setUser(null);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('futurepath_token');
    if (token) {
      refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    const res = await ApiService.login(credentials);
    if (res.success && res.token) {
      ApiService.setToken(res.token);
      setUser(res.user);
      setSubscription(res.subscription);
    }
  };

  const register = async (data: any) => {
    const res = await ApiService.register(data);
    if (res.success && res.token) {
      ApiService.setToken(res.token);
      setUser(res.user);
      setSubscription(res.subscription);
    }
  };

  const demoLogin = async (role: string) => {
    setLoading(true);
    try {
      const res = await ApiService.demoLogin(role);
      if (res.success && res.token) {
        ApiService.setToken(res.token);
        setUser(res.user);
        setSubscription(res.subscription);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    ApiService.clearToken();
    setUser(null);
    setSubscription(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        subscription,
        loading,
        login,
        register,
        demoLogin,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
