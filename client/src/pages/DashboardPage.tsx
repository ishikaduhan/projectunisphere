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
    <div className="px-margin-desktop py-10 max-w-container-max mx-auto w-full">
      {error && <div className="message error">{error}</div>}

      {/* Welcome Hero */}
      <section className="relative overflow-hidden rounded-[2rem] bg-inverse-surface p-10 text-inverse-on-surface luxury-glow mb-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 max-w-lg">
          <span className="text-label-md bg-secondary/20 text-secondary-fixed px-3 py-1 rounded-full mb-6 inline-block uppercase tracking-widest">Academic Year 2024</span>
          <h2 className="text-display-lg-mobile md:text-headline-md mb-4 leading-tight">Welcome back, Student.</h2>
          <p className="text-body-lg opacity-80 mb-8 font-light">Your participation score is up — here are events and clubs curated for you.</p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-secondary-fixed text-on-secondary-fixed text-body-md font-semibold rounded-xl hover:shadow-xl transition-all active:scale-95">View Schedule</button>
            <button className="px-8 py-3 border border-secondary-fixed/30 text-secondary-fixed text-body-md font-semibold rounded-xl hover:bg-secondary-fixed/10 transition-all active:scale-95">Explore Clubs</button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-8">
        <div className="bg-surface p-8 rounded-3xl border border-outline-variant/20 luxury-glow transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-2xl">
              <span className="material-symbols-outlined">confirmation_number</span>
            </div>
            <span className="text-on-secondary-fixed-variant text-caption bg-secondary-fixed/30 px-2 py-1 rounded-full">+2 NEW</span>
          </div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Registered Events</p>
          <h3 className="text-headline-md">{registrations.length}</h3>
        </div>

        <div className="bg-surface p-8 rounded-3xl border border-outline-variant/20 luxury-glow transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-2xl">
              <span className="material-symbols-outlined">event</span>
            </div>
            <span className="text-on-secondary-fixed-variant text-caption bg-secondary-fixed/30 px-2 py-1 rounded-full">TRENDING</span>
          </div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Upcoming Events</p>
          <h3 className="text-headline-md">{events.length}</h3>
        </div>

        <div className="bg-surface p-8 rounded-3xl border border-outline-variant/20 luxury-glow transition-all hover:-translate-y-1">
          <div className="flex justify-between items-start mb-6">
            <div className="p-3 bg-secondary-fixed text-on-secondary-fixed rounded-2xl">
              <span className="material-symbols-outlined">mark_email_unread</span>
            </div>
            <span className="text-on-secondary-fixed-variant text-caption bg-secondary-fixed/30 px-2 py-1 rounded-full">ACTION</span>
          </div>
          <p className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Unread Notifications</p>
          <h3 className="text-headline-md">{notifications}</h3>
        </div>
      </div>

      {/* Two column lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20">
          <h3 className="mb-4 text-headline-sm">Latest events</h3>
          {events.length === 0 ? (
            <p>No events available yet.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event._id} className="flex justify-between items-center">
                  <div>
                    <strong className="block">{event.title}</strong>
                    <small className="text-on-surface-variant">{new Date(event.schedule.startAt).toLocaleString()}</small>
                  </div>
                  <div className="text-sm text-on-surface-variant">{event.location?.venue ?? event.location?.mode ?? ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20">
          <h3 className="mb-4 text-headline-sm">Recent registrations</h3>
          {registrations.length === 0 ? (
            <p>You don't have any registrations yet.</p>
          ) : (
            <ul className="space-y-4">
              {registrations.map((registration) => (
                <li key={registration._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{registration.eventId}</div>
                    <small className="text-on-surface-variant">{registration.status}</small>
                  </div>
                  <div className="text-sm text-on-surface-variant">{new Date(registration.registeredAt || '').toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
