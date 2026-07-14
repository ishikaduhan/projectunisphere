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
    <div className="max-w-container-max mx-auto px-4 md:px-12 pb-24 lg:pb-12">
      {/* Hero */}
      <section className="relative mt-8 rounded overflow-hidden min-h-[420px] flex items-center p-8 md:p-16 hero-mesh border border-outline-variant shadow-sm mb-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-container text-on-primary-container font-label-md text-label-md mb-6"> 
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            SMART RECOMMENDATIONS
          </div>
          <h2 className="font-display-lg text-display-lg text-on-background mb-6 leading-tight">The Future of <span className="text-gradient italic">Campus Life</span> Starts Here.</h2>
          <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed max-w-xl">A curated collective of immersive workshops, academic symposiums, and social galas tailored to your intellectual pursuit through our AI-driven portal.</p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-on-primary px-6 py-3 rounded font-semibold hover:shadow-md transition-all active:scale-95">Explore Trending</button>
            <button className="bg-transparent border border-outline text-on-background px-6 py-3 rounded font-semibold hover:bg-surface-container-low transition-all">My Schedule</button>
          </div>
        </div>
      </section>

      {/* Category Filters */}
      <section className="mt-4 mb-6">
        <div className="flex items-center justify-between mb-6 overflow-x-auto pb-4 no-scrollbar gap-8">
          <div className="flex gap-1 shrink-0 border-b border-outline-variant">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-3 ${activeCategory === cat ? 'border-b-2 border-primary text-primary font-semibold' : 'border-b-2 border-transparent text-on-surface-variant hover:text-primary'}`}>
                {cat}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 text-primary font-semibold px-4 py-2 hover:bg-surface-container-high rounded transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-[20px]">filter_list</span>
            Refine Search
          </button>
        </div>
      </section>

      {/* Event grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} isRegistered={registeredIds.includes(event.id)} onRegister={handleToggleRegister} />
          ))}
        </div>

        <aside className="bg-surface-container-high rounded p-6 border border-outline-variant hidden lg:flex flex-col">
          <div className="w-12 h-12 rounded bg-primary-container/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary text-headline-sm">flare</span>
          </div>
          <h4 className="text-headline-sm text-on-background mb-4">Intellectual Insights</h4>
          <p className="text-body-md text-on-surface-variant mb-6 italic">"Synthesizing your academic profile... we recommend the upcoming 'Neural Systems' symposium for your research trajectory."</p>
          <div className="mt-auto p-4 rounded bg-surface-container-lowest border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded bg-surface-dim" />
              <div>
                <p className="text-body-md font-bold text-on-surface">Neural Networks 101</p>
                <p className="text-caption text-on-surface-variant uppercase tracking-wider">NOV 2 / SCIENCE HALL 4</p>
              </div>
            </div>
            <button className="w-full py-3 border border-outline text-on-background rounded font-semibold hover:bg-surface-container-high transition-colors">Remind Me</button>
          </div>
        </aside>
      </section>
    </div>
  );
};

export default DiscoverPage;
