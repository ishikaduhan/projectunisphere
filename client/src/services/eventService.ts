import { apiClient } from './apiClient';
import type { EventItem } from '../types/api';

interface EventListResponse {
  items: EventItem[];
  total: number;
}

export interface EventPayload {
  title: string;
  description: string;
  tags?: string[];
  schedule: {
    startAt: string;
    endAt: string;
    timezone?: string;
  };
  location: {
    mode: 'offline' | 'online' | 'hybrid';
    venue?: string;
    room?: string;
    meetingUrl?: string;
  };
}

export const getEvents = async (
  page = 1,
  limit = 12,
  search?: string,
  status?: string,
  clubId?: string
): Promise<EventListResponse> => {
  const response = await apiClient.get('/events', {
    params: {
      page,
      limit,
      search,
      status,
      clubId,
    },
  });
  return response.data;
};

export const getEvent = async (id: string): Promise<EventItem> => {
  const response = await apiClient.get(`/events/${id}`);
  return response.data.event;
};

export const createEvent = async (payload: EventPayload): Promise<EventItem> => {
  const response = await apiClient.post('/events', payload);
  return response.data.event;
};

export const updateEvent = async (eventId: string, payload: Partial<EventPayload>): Promise<EventItem> => {
  const response = await apiClient.patch(`/events/${eventId}`, payload);
  return response.data.event;
};

export const deleteEvent = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/events/${eventId}`);
};

export const registerForEvent = async (eventId: string): Promise<{ registration: any; qrToken?: string }> => {
  const response = await apiClient.post('/registrations', { eventId });
  return response.data;
};
