import { apiClient } from './apiClient';
import type { ClubItem } from '../types/api';

export interface ClubPayload {
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'university_only' | 'private';
  slug?: string;
  members?: Array<{ userId: string; role: string; status?: string }>;
}

interface ClubListResponse {
  items: ClubItem[];
  total: number;
}

export const getClubs = async (page = 1, limit = 12): Promise<ClubListResponse> => {
  const response = await apiClient.get('/clubs', {
    params: { page, limit },
  });
  return response.data;
};

export const getClub = async (id: string): Promise<ClubItem> => {
  const response = await apiClient.get(`/clubs/${id}`);
  return response.data.club;
};

export const createClub = async (payload: ClubPayload): Promise<ClubItem> => {
  const response = await apiClient.post('/clubs', payload);
  return response.data.club;
};

export const updateClub = async (id: string, payload: Partial<ClubPayload>): Promise<ClubItem> => {
  const response = await apiClient.patch(`/clubs/${id}`, payload);
  return response.data.club;
};

export const deleteClub = async (id: string): Promise<void> => {
  await apiClient.delete(`/clubs/${id}`);
};
