import { apiClient } from './apiClient';
import type { ClubItem } from '../types/api';

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
  return response.data;
};
