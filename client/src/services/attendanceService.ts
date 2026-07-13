import { apiClient } from './apiClient';
import type { AttendanceReport } from '../types/api';

export const getEventAttendanceReport = async (eventId: string): Promise<AttendanceReport> => {
  const response = await apiClient.get(`/attendance/events/${eventId}/report`);
  return response.data;
};
