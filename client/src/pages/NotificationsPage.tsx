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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <section className="lg:col-span-4 space-y-6">
          <div className="glass-card p-8 rounded-[1.5rem] border border-outline-variant shadow-sm text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-surface-dim flex items-center justify-center text-headline-md text-primary">U</div>
              <div>
                <h3 className="font-headline-sm text-[22px] text-on-background">Your Profile</h3>
                <p className="text-body-md text-on-surface-variant">Manage your personal settings and notification preferences.</p>
              </div>
              <button className="w-full rounded-full bg-primary text-on-primary px-5 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors">Edit Profile</button>
            </div>
          </div>

          <div className="glass-card p-6 rounded-[1.5rem] border border-outline-variant shadow-sm">
            <h4 className="font-headline-sm mb-3">Notification Settings</h4>
            <div className="space-y-4 text-on-surface-variant">
              <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4">
                <span>Email notifications</span>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
              </label>
              <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4">
                <span>Push notifications</span>
                <input type="checkbox" defaultChecked className="h-5 w-5 accent-primary" />
              </label>
            </div>
          </div>
        </section>

        <section className="lg:col-span-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
            <div>
              <h2 className="font-headline-md text-[32px] text-on-background">Notifications</h2>
              <p className="text-body-md text-on-surface-variant">Manage your in-app notifications and keep track of event updates.</p>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-caption uppercase tracking-[0.2em] text-on-surface-variant">Filter</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="rounded-xl border border-outline px-4 py-3 bg-surface text-on-surface text-body-md focus:border-primary focus:ring-primary/20 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="sent">Unread / Sent</option>
                <option value="read">Read</option>
                <option value="failed">Failed</option>
                <option value="queued">Queued</option>
              </select>
            </div>
          </header>

          {error && <div className="message error mb-6">{error}</div>}

          {loading ? (
            <LoadingSpinner />
          ) : notifications.length === 0 ? (
            <div className="glass-card rounded-[1.5rem] border border-outline-variant p-8 text-center text-on-surface-variant">No notifications found.</div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <article
                  key={notification._id}
                  className={`glass-card rounded-[1.25rem] border border-outline-variant p-5 shadow-sm transition ${notification.status === 'read' ? 'opacity-70' : ''}`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h3 className="font-headline-sm text-[18px] text-on-background mb-2">{notification.title}</h3>
                      <p className="text-body-md text-on-surface-variant leading-relaxed mb-3">{notification.message}</p>
                      <p className="text-caption uppercase tracking-[0.2em] text-on-surface-variant">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        className="rounded-full bg-primary text-on-primary px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition-colors"
                        onClick={() => handleToggleRead(notification)}
                      >
                        {notification.status === 'read' ? 'Mark unread' : 'Mark read'}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-error text-error px-4 py-2 text-sm font-semibold hover:bg-error/10 transition-colors"
                        onClick={() => handleDelete(notification._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default NotificationsPage;
