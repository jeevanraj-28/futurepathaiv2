import React, { useState, useEffect } from 'react';
import type { User, SubscriptionStatus } from '../types';
import { ApiService } from '../services/api';
import { AuthContext } from './auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null);
  // only wait for the session check when there is a stored token to check
  const [loading, setLoading] = useState<boolean>(() => !!localStorage.getItem('futurepath_token'));

  const checkSession = () =>
    ApiService.getMe()
      .then((data) => {
        if (data.success && data.user) {
          setUser(data.user);
          setSubscription(data.subscription || { planCode: 'FREE', planName: 'Free Explorer', isActive: true });
        }
      })
      .catch(() => {
        // Session invalid or token expired
        ApiService.clearToken();
        setUser(null);
        setSubscription(null);
      })
      .finally(() => setLoading(false));

  const refreshUser = async () => { await checkSession(); };

  useEffect(() => {
    if (localStorage.getItem('futurepath_token')) checkSession();
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
