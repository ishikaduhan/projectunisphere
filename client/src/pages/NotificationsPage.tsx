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
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Notifications</h2>
          <p>Manage your in-app notifications and keep track of event updates.</p>
        </div>
      </div>

      <div className="toolbar">
        <label>
          Filter status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="sent">Unread / Sent</option>
            <option value="read">Read</option>
            <option value="failed">Failed</option>
            <option value="queued">Queued</option>
          </select>
        </label>
      </div>

      {error && <div className="message error">{error}</div>}
      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="card">No notifications found.</div>
      ) : (
        <div className="stacked-list">
          {notifications.map((notification) => (
            <article key={notification._id} className={`card notification-card ${notification.status === 'read' ? 'notification-read' : ''}`}>
              <div>
                <h3>{notification.title}</h3>
                <p>{notification.message}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
              <div className="notification-actions">
                <button type="button" className="button button-secondary" onClick={() => handleToggleRead(notification)}>
                  {notification.status === 'read' ? 'Mark unread' : 'Mark read'}
                </button>
                <button type="button" className="button button-danger" onClick={() => handleDelete(notification._id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default NotificationsPage;
