import { apiClient } from './apiClient';
import type { EventItem } from '../types/api';

interface EventListResponse {
  items: EventItem[];
  total: number;
}

export const getEvents = async (page = 1, limit = 12, search?: string): Promise<EventListResponse> => {
  const response = await apiClient.get('/events', {
    params: {
      page,
      limit,
      search,
    },
  });
  return response.data;
};

export const getEvent = async (id: string): Promise<EventItem> => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data;
};

export const registerForEvent = async (eventId: string): Promise<{ registration: any; qrToken?: string }> => {
  const response = await apiClient.post('/registrations', { eventId });
  return response.data;
};
