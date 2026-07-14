import type { DiscoverEvent } from '../data/mockEvents';

interface EventCardProps {
  event: DiscoverEvent;
  isRegistered: boolean;
  onRegister: (eventId: string) => void;
}

const EventCard = ({ event, isRegistered, onRegister }: EventCardProps) => {
  return (
    <article className="glass-card rounded-[2rem] overflow-hidden border border-outline-variant shadow-sm transition-transform duration-300 hover:-translate-y-1 h-full flex flex-col">
      {/* Event Image */}
      <div className="relative h-56 sm:h-64 lg:h-72 overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-full object-cover transition duration-700 hover:scale-105 grayscale-[20%]"
        />

        <span className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-surface-container text-on-surface text-xs sm:text-caption uppercase tracking-[0.2em] font-bold px-3 py-1 rounded-full shadow-sm">
          {event.category}
        </span>
      </div>

      {/* Card Content */}
      <div className="flex flex-col justify-between flex-1 p-4 sm:p-6 space-y-4">
        <div className="space-y-2">
          <p className="text-xs sm:text-sm uppercase tracking-[0.14em] text-secondary font-medium">
            {event.date}
          </p>

          <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-on-background leading-tight">
            {event.title}
          </h3>

          <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
            {event.summary}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
          <p className="text-sm sm:text-base font-semibold text-on-surface">
            {event.location}
          </p>

          <button
            type="button"
            onClick={() => onRegister(event.id)}
            className={`w-full sm:w-auto rounded-full px-5 py-3 text-sm font-semibold transition ${
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