import { apiClient } from './apiClient';
import type { NotificationItem } from '../types/api';

interface NotificationListResponse {
  items: NotificationItem[];
  total: number;
}

export const getNotifications = async (status = 'all', page = 1, limit = 20): Promise<NotificationListResponse> => {
  const response = await apiClient.get('/notifications', {
    params: { status, page, limit },
  });
  return response.data;
};

export const markNotificationRead = async (id: string): Promise<NotificationItem> => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data.notification;
};

export const markNotificationUnread = async (id: string): Promise<NotificationItem> => {
  const response = await apiClient.patch(`/notifications/${id}/unread`);
  return response.data.notification;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await apiClient.delete(`/notifications/${id}`);
};
