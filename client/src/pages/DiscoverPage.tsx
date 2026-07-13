import { useMemo, useState } from 'react';
import EventCard from '../components/EventCard';
import { mockEvents } from '../data/mockEvents';

const categories = ['All', 'Academic', 'Workshop', 'Social', 'Sports'];

const DiscoverPage = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [registeredIds, setRegisteredIds] = useState<string[]>([]);

  const filteredEvents = useMemo(
    () =>
      activeCategory === 'All'
        ? mockEvents
        : mockEvents.filter((event) => event.category === activeCategory),
    [activeCategory]
  );

  const handleToggleRegister = (eventId: string) => {
    setRegisteredIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]
    );
  };

  return (
    <section className="page-section">
      <div className="page-header" style={{ alignItems: 'flex-start' }}>
        <div>
          <p style={{ margin: 0, color: 'var(--accent)', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', fontSize: '0.85rem' }}>
            Discover Events
          </p>
          <h2 style={{ margin: '12px 0', fontSize: '2.2rem', lineHeight: 1.05 }}>
            Campus events curated for your next great experience.
          </h2>
          <p style={{ margin: 0, maxWidth: '680px', color: 'var(--text)' }}>
            Browse upcoming workshops, academic talks, club socials, and sports events. Filter by category and register for the events that matter most.
          </p>
        </div>
      </div>

      <div style={{ margin: '24px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                padding: '10px 18px',
                borderRadius: '999px',
                border: activeCategory === category ? '1px solid var(--accent)' : '1px solid transparent',
                background: activeCategory === category ? 'var(--accent-bg)' : 'transparent',
                color: activeCategory === category ? 'var(--accent)' : 'var(--text-h)',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {filteredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            isRegistered={registeredIds.includes(event.id)}
            onRegister={handleToggleRegister}
          />
        ))}
      </div>
    </section>
  );
};

export default DiscoverPage;
