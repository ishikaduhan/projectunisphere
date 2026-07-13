import { apiClient } from './apiClient';
import type { UserProfile } from '../types/api';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
  universityId: string;
  profile: {
    department: string;
    year?: number;
    interests?: string[];
  };
}

export const login = async ({ email, password }: LoginPayload): Promise<{ accessToken: string; user: { id: string; roles: string[] } }> => {
  const response = await apiClient.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (payload: RegisterPayload): Promise<void> => {
  await apiClient.post('/auth/register', payload);
};

export const fetchProfile = async (): Promise<UserProfile> => {
  const response = await apiClient.get('/users/me');
  return response.data;
};

export const updateProfile = async (payload: Partial<Omit<UserProfile, 'id' | 'name' | 'email'>>): Promise<void> => {
  await apiClient.patch('/users/me', payload);
};
