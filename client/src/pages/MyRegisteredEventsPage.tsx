import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRegistrations } from '../services/registrationService';
import type { RegistrationItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const MyRegisteredEventsPage = () => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRegistrations = async () => {
      setError('');
      setLoading(true);

      try {
        const response = await getRegistrations(1, 50);
        setRegistrations(response.items);
      } catch (err: any) {
        setError('Unable to load your registered events.');
      } finally {
        setLoading(false);
      }
    };

    loadRegistrations();
  }, []);

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>My Registered Events</h2>
          <p>Review your event registrations and see which sessions you are signed up for.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : registrations.length === 0 ? (
        <div className="card">
          <p>You have not registered for any events yet.</p>
        </div>
      ) : (
        <div className="grid-layout">
          {registrations.map((registration) => (
            <article key={registration._id} className="card card-preview">
              <div>
                <h3>Event ID: {registration.eventId}</h3>
                <p>Status: {registration.status}</p>
                <p>Registered on {new Date(registration.registeredAt).toLocaleDateString()}</p>
              </div>
              <Link to={`/events/${registration.eventId}`} className="button button-link">
                View event
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default MyRegisteredEventsPage;
