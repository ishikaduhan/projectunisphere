import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getEvent, registerForEvent } from '../services/eventService';
import { getRegistrations } from '../services/registrationService';
import type { EventItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
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

  const banner = (event as any).bannerUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw7pw7KJyidvMYY40iJsT3iNlWXB-BTOgIrVepRR0wCRiJa7Rr9Ew-mWs9yeihqGZKVP_H_FVEDtD92i5MaxBe-3OMvstKCsukP_Ll_tWlpwzh7abmiYzFAXynuA95wjTAyP765XChiuDPu8s9lns0qSO2UmhgngvCN-HQEgkt6g4GQHWRD_7Lh0eQdAQ_-O9PG12LuiHtDH-o2g3xhnjovcdLicGIueZA6S12Y5TSmfaxamKh01f2cxlCzjAN9UDd7e-Mx0g375k';
  const speakers = (event as any).speakers || [];
    const avatarFallback = 'https://lh3.googleusercontent.com/aida-public/AB6AXuBBPGvK5j30M7jYUevT6AatfG-2KW17mzg-T9J9CvEnahbjIff1jMGn_H--vL1zI5gN21HMa781nxOBz0Ca9Zf1QqIqd8sL-cTsvCbhymP63Imi6zstIEP5MdXt2wN71LwmeGNiuy83TYh4Cul8nWEqGr1aNBvoYxP4RPPMql06mqJW2CVSNmqg2hJfAEWGjf8RspF2kB12dJ-NqFQwD7s4ea0CeqMgj-0qDvTRF3wcGG00J0GGQkRsQiivccULHOH5gVUpERNL53g';

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      {/* Hero */}
      <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden shadow-md mb-8 border border-outline-variant">
        <img className="w-full h-full object-cover grayscale-[0.2] contrast-125" src={banner} alt={event.title} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 lg:p-12">
          <div className="flex flex-wrap gap-3 mb-4">
            {(event.tags || []).slice(0,2).map((t) => (
              <span key={t} className="px-4 py-1.5 bg-tertiary text-on-tertiary rounded font-label-md text-label-md uppercase tracking-widest">{t}</span>
            ))}
          </div>
          <h2 className="font-display-lg text-display-lg-mobile lg:text-display-lg text-white mb-4 lg:max-w-3xl">{event.title}</h2>
          <div className="flex flex-wrap items-center gap-8 text-white/80">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">schedule</span>
              <span className="font-body-md text-body-md">{new Date(event.schedule.startAt).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">location_on</span>
              <span className="font-body-md text-body-md">{event.location.venue || event.location.mode}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">group</span>
              <span className="font-body-md text-body-md">{event.analytics?.registeredCount ?? '—'} Registered</span>
            </div>
          </div>
        </div>
        <div className="absolute top-8 right-8">
          <button className="luxury-glass px-6 py-2.5 rounded-lg text-primary font-label-md flex items-center gap-2 shadow-sm hover:bg-surface transition-all">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 300" }}>share</span>
            SHARE
          </button>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <div className="lg:col-span-8 space-y-8">
          <section className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h3 className="font-headline-sm mb-4">About the Event</h3>
            <div className="font-body-lg text-on-surface-variant leading-relaxed space-y-4">
              <p>{event.description}</p>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-headline-sm border-b border-outline-variant pb-4">Event Agenda</h3>
            <div className="space-y-6">
              {/* Use schedule blocks if available - placeholder items otherwise */}
              <div className="flex gap-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-primary mt-1.5" />
                  <div className="w-px h-full bg-outline-variant my-2" />
                </div>
                <div className="pb-10 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-label-md text-label-md text-primary uppercase tracking-widest">{new Date(event.schedule.startAt).toLocaleTimeString()} — {new Date(event.schedule.endAt).toLocaleTimeString()}</p>
                    <span className="px-2 py-0.5 bg-surface-container-highest text-on-surface-variant rounded text-[10px] uppercase font-label-md">{event.location.venue || 'Venue'}</span>
                  </div>
                  <h4 className="font-headline-sm text-[20px] mb-2 text-on-surface">Main Session</h4>
                  <p className="font-body-md text-on-surface-variant leading-relaxed">{event.description}</p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h3 className="font-headline-sm border-b border-outline-variant pb-4">Featured Speakers</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {/* Speakers would be derived from event data if available */}
              <div className="group">
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden mb-4 grayscale hover:grayscale-0 transition-all duration-500 border border-outline-variant">
                  <img className="w-full h-full object-cover" src={speakers?.[0]?.photo || avatarFallback} alt={speakers?.[0]?.name || 'Speaker'} />
                </div>
                <h4 className="font-headline-sm text-[18px] text-on-surface">{speakers?.[0]?.name || 'TBA'}</h4>
                <p className="font-label-md text-caption text-on-surface-variant uppercase tracking-tighter">{speakers?.[0]?.title || ''}</p>
              </div>
            </div>
          </section>
        </div>

        <aside className="lg:col-span-4 space-y-8">
          <section className="bg-surface p-6 rounded-xl border border-outline-variant space-y-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">verified</span>
              <h3 className="font-headline-sm text-[20px]">Curated Picks</h3>
            </div>
            <p className="font-body-md text-on-surface-variant">Recommended based on your interest.</p>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container rounded-lg hover:border-secondary border border-transparent transition-all cursor-pointer group">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">NOV 02</span>
                  <span className="material-symbols-outlined text-outline group-hover:text-secondary transition-colors">arrow_forward</span>
                </div>
                <h4 className="font-headline-sm text-[16px] mb-1">Cyber-Physical Systems</h4>
                <p className="font-body-sm text-on-surface-variant line-clamp-1">Robotics and IoT integration.</p>
              </div>
            </div>
            <button className="w-full py-3 text-secondary font-label-md border-t border-outline-variant pt-4 hover:opacity-80 uppercase tracking-widest text-[11px]">Personalized Guide</button>
          </section>

          <section className="bg-surface p-6 rounded-xl border border-outline-variant">
            {registered ? (
              <div className="space-y-3">
                <button disabled className="w-full py-3 bg-surface-container text-on-surface rounded-lg">Registered</button>
                {status && <p className="text-caption text-on-surface-variant">Status: {status}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <button onClick={handleRegister} disabled={actionLoading} className="w-full py-3 bg-primary text-on-primary rounded-lg">{actionLoading ? 'Registering...' : 'Register'}</button>
                {status && <p className="text-caption text-on-surface-variant">Status: {status}</p>}
              </div>
            )}
          </section>

          <section className="bg-surface rounded-xl overflow-hidden border border-outline-variant p-6">
            <h4 className="font-headline-sm text-[18px] mb-4">Location</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-secondary">pin_drop</span>
                <div>
                  <p className="font-body-md font-semibold text-on-surface">{event.location.venue || event.location.mode}</p>
                  <p className="font-body-sm text-on-surface-variant">{event.location.room || ''}</p>
                </div>
              </div>
              {event.location.meetingUrl && (
                <a href={event.location.meetingUrl} target="_blank" rel="noreferrer" className="w-full inline-block py-3 bg-primary text-on-primary rounded-lg text-center">Join online meeting</a>
              )}
            </div>
          </section>

          <section className="px-2">
            <h4 className="font-label-md text-caption text-on-surface-variant uppercase tracking-widest mb-4">Friends Attending</h4>
            <div className="flex items-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"><img className="w-full h-full object-cover" src={avatarFallback} alt="" /></div>
                                <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"><img className="w-full h-full object-cover" src={avatarFallback} alt="" /></div>
                                <div className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"><img className="w-full h-full object-cover" src={avatarFallback} alt="" /></div>
                <div className="w-10 h-10 rounded-full bg-secondary text-on-secondary flex items-center justify-center text-[10px] font-bold border-2 border-background uppercase">+244</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
};

export default EventDetailsPage;
