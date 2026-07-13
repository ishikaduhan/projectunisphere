import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { apiClient, setAccessTokenInMemory } from '../services/apiClient';

interface User {
  id: string;
  roles: string[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const checkAuth = async () => {
    try {
      // Call silent refresh on mount to retrieve accessToken and verify session
      const response = await apiClient.post('/auth/refresh');
      const { accessToken } = response.data;
      setAccessTokenInMemory(accessToken);

      // Hydrate user profile details
      const profileResponse = await apiClient.get('/users/me');
      setUser({
        id: profileResponse.data.id,
        roles: profileResponse.data.roles,
      });
    } catch (error) {
      setUser(null);
      setAccessTokenInMemory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { accessToken, user: loggedUser } = response.data;
      setAccessTokenInMemory(accessToken);
      setUser(loggedUser);
    } catch (error) {
      setUser(null);
      setAccessTokenInMemory(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setAccessTokenInMemory(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
