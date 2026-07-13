import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getEvent, registerForEvent } from '../services/eventService';
import { getRegistrations } from '../services/registrationService';
import type { EventItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [registered, setRegistered] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDetails = async () => {
      if (!id) return;
      setError('');
      setLoading(true);

      try {
        const [eventData, registrationData] = await Promise.all([
          getEvent(id),
          getRegistrations(1, 50),
        ]);

        setEvent(eventData);
        const registration = registrationData.items.find((item) => item.eventId === id);
        setRegistered(Boolean(registration));
        setStatus(registration?.status || '');
      } catch (err: any) {
        setError('Unable to load event details.');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id]);

  const handleRegister = async () => {
    if (!id) {
      return;
    }

    setActionLoading(true);
    setError('');

    try {
      const response = await registerForEvent(id);
      setRegistered(true);
      setStatus(response.registration.status);
    } catch (err: any) {
      const message = err?.response?.data?.error?.message || 'Registration failed.';
      setError(message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!event) {
    return (
      <section className="page-section">
        <div className="message error">Event not found.</div>
      </section>
    );
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="card event-details-card">
        <div className="details-grid">
          <div>
            <h3>When</h3>
            <p>{new Date(event.schedule.startAt).toLocaleString()}</p>
            <p>Ends: {new Date(event.schedule.endAt).toLocaleString()}</p>
          </div>
          <div>
            <h3>Where</h3>
            <p>{event.location.mode}</p>
            {event.location.venue && <p>{event.location.venue}</p>}
            {event.location.meetingUrl && (
              <a href={event.location.meetingUrl} target="_blank" rel="noreferrer">
                Join online meeting
              </a>
            )}
          </div>
          <div>
            <h3>Capacity</h3>
            <p>{event.capacity?.limit ? `${event.capacity.limit} attendees` : 'Unlimited'}</p>
            <p>{event.capacity?.waitlistEnabled ? 'Waitlist enabled' : 'No waitlist'}</p>
          </div>
        </div>

        <div className="event-actions">
          {registered ? (
            <button type="button" className="button button-secondary" disabled>
              Registered ({status})
            </button>
          ) : (
            <button type="button" className="button" onClick={handleRegister} disabled={actionLoading}>
              {actionLoading ? 'Registering…' : 'Register for event'}
            </button>
          )}
          <button type="button" className="button button-link" onClick={() => navigate('/events')}>
            Back to events
          </button>
        </div>
      </div>
    </section>
  );
};

export default EventDetailsPage;
