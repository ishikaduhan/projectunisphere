import type { DiscoverEvent } from '../data/mockEvents';

interface EventCardProps {
  event: DiscoverEvent;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
}

const EventCard = ({ event, isRegistered, onRegister }: EventCardProps) => {
  return (
    <article className="glass-card rounded-[2rem] overflow-hidden border border-outline-variant shadow-sm transition-transform duration-300 hover:-translate-y-1">
      <div className="relative h-72 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition duration-700 hover:scale-105 grayscale-[20%]"
        />
        <span className="absolute top-4 left-4 bg-surface-container text-on-surface text-caption uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full shadow-sm">
          {event.category}
        </span>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <p className="font-label-md uppercase tracking-[0.14em] text-secondary">{event.date}</p>
          <h3 className="font-headline-sm text-[20px] text-on-background">{event.title}</h3>
          <p className="text-body-md text-on-surface-variant leading-relaxed">{event.summary}</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-body-md font-semibold text-on-surface">{event.location}</p>
          <button
            type="button"
            onClick={() => onRegister(event.id)}
            className={`rounded-full px-5 py-3 text-sm font-semibold transition ${
              isRegistered
                ? 'bg-surface-container-high border border-outline text-on-surface'
                : 'bg-primary text-on-primary hover:bg-primary/90'
            }`}
          >
            {isRegistered ? 'Registered' : 'Register'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default EventCard;
