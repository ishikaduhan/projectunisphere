import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getRegistrations } from '../services/registrationService';
import { getNotifications } from '../services/notificationService';
import type { EventItem, RegistrationItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [notifications, setNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setError('');
      setLoading(true);

      try {
        const [eventData, registrationData, notificationData] = await Promise.all([
          getEvents(1, 4),
          getRegistrations(1, 4),
          getNotifications('unread', 1, 1),
        ]);

        setEvents(eventData.items);
        setRegistrations(registrationData.items);
        setNotifications(notificationData.total);
      } catch (err: any) {
        setError('Unable to load dashboard content. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p>Quick access to your upcoming events, registrations, and notifications.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="dashboard-grid">
        <article className="card summary-card">
          <h3>Upcoming events</h3>
          <p>{events.length} events ready for browsing</p>
        </article>
        <article className="card summary-card">
          <h3>My registrations</h3>
          <p>{registrations.length} active registrations</p>
        </article>
        <article className="card summary-card">
          <h3>Unread notifications</h3>
          <p>{notifications} pending notifications</p>
        </article>
      </div>

      <div className="grid-layout">
        <div className="card">
          <h3>Latest events</h3>
          {events.length === 0 ? (
            <p>No events available yet.</p>
          ) : (
            <ul className="list-card">
              {events.map((event) => (
                <li key={event._id}>
                  <strong>{event.title}</strong>
                  <span>{new Date(event.schedule.startAt).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card">
          <h3>Recent registrations</h3>
          {registrations.length === 0 ? (
            <p>You don't have any registrations yet.</p>
          ) : (
            <ul className="list-card">
              {registrations.map((registration) => (
                <li key={registration._id}>
                  <div>{registration.eventId}</div>
                  <span>{registration.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
