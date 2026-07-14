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
      current.includes(eventId)
        ? current.filter((id) => id !== eventId)
        : [...current, eventId]
    );
  };

  return (
    <div className="max-w-container-max mx-auto px-4 sm:px-6 lg:px-12 pb-16 lg:pb-12">

      {/* Hero */}
      <section className="relative mt-6 rounded-3xl overflow-hidden min-h-[350px] lg:min-h-[420px] flex items-center p-6 sm:p-8 lg:p-16 hero-mesh border border-outline-variant shadow-sm mb-10">
        <div className="relative z-10 max-w-2xl">

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-container text-on-primary-container text-xs sm:text-sm font-semibold mb-6">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            SMART RECOMMENDATIONS
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-on-background leading-tight mb-6">
            The Future of{' '}
            <span className="text-gradient italic">
              Campus Life
            </span>{' '}
            Starts Here.
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-on-surface-variant mb-8 leading-relaxed max-w-xl">
            A curated collective of immersive workshops,
            academic symposiums and social events tailored
            to your interests through our AI-driven portal.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="w-full sm:w-auto bg-primary text-on-primary px-6 py-3 rounded-lg font-semibold hover:shadow-md transition-all">
              Explore Trending
            </button>

            <button className="w-full sm:w-auto border border-outline text-on-background px-6 py-3 rounded-lg font-semibold hover:bg-surface-container-low transition-all">
              My Schedule
            </button>
          </div>

        </div>
      </section>

      {/* Category Filters */}

      <section className="mb-8">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          <div className="flex overflow-x-auto gap-2 no-scrollbar pb-2">

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-3 whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'border-b-2 border-primary text-primary font-semibold'
                    : 'border-b-2 border-transparent text-on-surface-variant hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}

          </div>

          <button className="self-start lg:self-auto flex items-center gap-2 text-primary font-semibold px-4 py-2 rounded-lg hover:bg-surface-container-high transition">
            <span className="material-symbols-outlined">
              filter_list
            </span>

            Refine Search
          </button>

        </div>

      </section>

      {/* Main Grid */}

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-8">

        {/* Events */}

        <div className="xl:col-span-2 space-y-6">

          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              isRegistered={registeredIds.includes(event.id)}
              onRegister={handleToggleRegister}
            />
          ))}

        </div>

        {/* Sidebar */}

        <aside className="bg-surface-container-high rounded-3xl p-6 border border-outline-variant flex flex-col">

          <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-primary">
              flare
            </span>
          </div>

          <h4 className="text-xl font-semibold text-on-background mb-4">
            Intellectual Insights
          </h4>

          <p className="text-sm text-on-surface-variant mb-6 italic">
            "Synthesizing your academic profile...
            we recommend the upcoming Neural Systems
            symposium for your research trajectory."
          </p>

          <div className="mt-auto p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant">

            <div className="flex items-center gap-3 mb-4">

              <div className="w-12 h-12 rounded bg-surface-dim"></div>

              <div>

                <p className="font-semibold">
                  Neural Networks 101
                </p>

                <p className="text-xs uppercase tracking-wider text-on-surface-variant">
                  NOV 2 • SCIENCE HALL 4
                </p>

              </div>

            </div>

            <button className="w-full py-3 rounded-lg border border-outline font-semibold hover:bg-surface-container-high transition">
              Remind Me
            </button>

          </div>

        </aside>

      </section>

    </div>
  );
};

export default DiscoverPage;