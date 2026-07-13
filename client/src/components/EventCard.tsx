import type { DiscoverEvent } from '../data/mockEvents';

interface EventCardProps {
  event: DiscoverEvent;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
}

const EventCard = ({ event, isRegistered, onRegister }: EventCardProps) => {
  return (
    <article className="card" style={{ display: 'grid', gap: '16px' }}>
      <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', minHeight: '220px' }}>
        <img
          src={event.imageUrl}
          alt={event.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
        <span
          style={{
            position: 'absolute',
            top: '14px',
            left: '14px',
            background: 'rgba(255,255,255,0.88)',
            color: '#111',
            padding: '6px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
          }}
        >
          {event.category}
        </span>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        <div>
          <p style={{ margin: 0, color: 'var(--accent)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.06em' }}>{event.date}</p>
          <h3 style={{ margin: '8px 0 0', fontSize: '1.25rem' }}>{event.title}</h3>
          <p style={{ margin: '8px 0 0', color: 'var(--text)' }}>{event.summary}</p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ margin: 0, color: 'var(--text-h)', fontWeight: 600 }}>{event.location}</p>
          <button
            type="button"
            onClick={() => onRegister(event.id)}
            style={{
              border: 'none',
              borderRadius: '999px',
              padding: '12px 18px',
              fontWeight: 700,
              cursor: 'pointer',
              background: isRegistered ? 'var(--border)' : 'var(--accent)',
              color: isRegistered ? 'var(--text-h)' : '#fff',
            }}
          >
            {isRegistered ? 'Registered' : 'Register'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
