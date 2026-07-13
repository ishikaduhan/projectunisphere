import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getEvents } from '../services/eventService';
import type { EventItem } from '../types/api';
import type { FormEvent } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

const EventListingPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async (searchTerm = '') => {
    setLoading(true);
    setError('');

    try {
      const result = await getEvents(1, 20, searchTerm || undefined);
      setEvents(result.items);
    } catch (err: any) {
      setError('Unable to load events. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadEvents(search);
  };

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Event listing</h2>
          <p>Browse upcoming UniSphere events and join the ones you like.</p>
        </div>
      </div>

      <form className="search-bar" onSubmit={handleSearch}>
        <input
          type="search"
          placeholder="Search events by title, tags, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="button button-secondary">
          Search
        </button>
      </form>

      {error && <div className="message error">{error}</div>}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid-layout">
          {events.length === 0 ? (
            <div className="card">No events were found.</div>
          ) : (
            events.map((event) => (
              <article key={event._id} className="card card-preview">
                <div>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                </div>
                <div className="card-footer">
                  <span>{event.location?.mode || 'Unknown location'}</span>
                  <span>{new Date(event.schedule.startAt).toLocaleDateString()}</span>
                </div>
                <Link to={`/events/${event._id}`} className="button button-link">
                  View details
                </Link>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default EventListingPage;
