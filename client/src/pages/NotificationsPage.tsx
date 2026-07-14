import { useEffect, useState } from 'react';
import {
  deleteNotification,
  getNotifications,
  markNotificationRead,
  markNotificationUnread,
} from '../services/notificationService';
import type { NotificationItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'sent' | 'read' | 'failed' | 'queued'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = async (status: string) => {
    setError('');
    setLoading(true);

    try {
      const response = await getNotifications(status, 1, 50);
      setNotifications(response.items);
    } catch (err: any) {
      setError('Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(statusFilter);
  }, [statusFilter]);

  const handleToggleRead = async (notification: NotificationItem) => {
    try {
      const updated = notification.status === 'read'
        ? await markNotificationUnread(notification._id)
        : await markNotificationRead(notification._id);
      setNotifications((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to update notification.');
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await deleteNotification(notificationId);
      setNotifications((current) => current.filter((item) => item._id !== notificationId));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to delete notification.');
    }
  };

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-headline-md">Notifications</h2>
          <p className="text-on-surface-variant">Manage your in-app notifications and keep track of event updates.</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span className="text-caption uppercase text-on-surface-variant">Filter</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)} className="ml-2 px-3 py-2 border rounded">
              <option value="all">All</option>
              <option value="sent">Unread / Sent</option>
              <option value="read">Read</option>
              <option value="failed">Failed</option>
              <option value="queued">Queued</option>
            </select>
          </label>
        </div>
      </header>

      {error && <div className="message error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="card">No notifications found.</div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <article key={notification._id} className={`bg-surface p-4 rounded-lg border border-outline-variant flex justify-between ${notification.status === 'read' ? 'opacity-60' : ''}`}>
              <div>
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-on-surface-variant">{notification.message}</p>
                <small className="text-caption text-on-surface-variant">{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button type="button" className="px-3 py-2 bg-primary text-on-primary rounded" onClick={() => handleToggleRead(notification)}>
                  {notification.status === 'read' ? 'Mark unread' : 'Mark read'}
                </button>
                <button type="button" className="px-3 py-2 bg-transparent border border-danger text-danger rounded" onClick={() => handleDelete(notification._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
};

export default NotificationsPage;
