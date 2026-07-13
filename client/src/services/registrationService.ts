import { apiClient } from './apiClient';
import type { RegistrationItem } from '../types/api';

interface RegistrationListResponse {
  items: RegistrationItem[];
  total: number;
}

export const getRegistrations = async (page = 1, limit = 20): Promise<RegistrationListResponse> => {
  const response = await apiClient.get('/registrations', {
    params: { page, limit },
  });
  return response.data;
};

export const cancelRegistration = async (id: string): Promise<void> => {
  await apiClient.delete(`/registrations/${id}`);
};
