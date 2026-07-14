import { useEffect, useState } from 'react';
import { getEvents } from '../services/eventService';
import { getRegistrations } from '../services/registrationService';
import type { EventItem, RegistrationItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const DashboardPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      setError('');
      setLoading(true);

      try {
        const [eventData, registrationData] = await Promise.all([
          getEvents(1, 4),
          getRegistrations(1, 4),
        ]);

        setEvents(eventData.items);
        setRegistrations(registrationData.items);
      } catch (err: any) {
        setError('Unable to load dashboard content. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="px-margin-desktop py-10 max-w-container-max mx-auto w-full">
      {error && <div className="message error">{error}</div>}

      {/* Welcome Hero (Stitch) */}
      <section className="relative mt-8 rounded overflow-hidden min-h-[460px] flex items-center p-8 md:p-16 hero-mesh border border-outline-variant shadow-sm mb-10">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-primary-container text-on-primary-container font-label-md text-label-md mb-6">
            <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            SMART RECOMMENDATIONS
          </div>
          <h2 className="font-display-lg text-display-lg text-on-background mb-8 leading-tight">The Future of <span className="text-gradient italic">Campus Life</span> Starts Here.</h2>
          <p className="text-body-lg text-on-surface-variant mb-8 leading-relaxed max-w-xl">A curated collective of immersive workshops, academic symposiums, and social galas tailored to your intellectual pursuit through our AI-driven portal.</p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-primary text-on-primary px-6 py-3 rounded font-semibold hover:shadow-md transition-all active:scale-95">Explore Trending</button>
            <button className="bg-transparent border border-outline text-on-background px-6 py-3 rounded font-semibold hover:bg-surface-container-low transition-all">My Schedule</button>
          </div>
        </div>
        <div className="hidden xl:block absolute right-16 top-1/2 -translate-y-1/2 w-[380px] h-[480px] rounded overflow-hidden shadow-2xl border-8 border-surface-container-highest rotate-2">
          <img alt="Innovation Hub" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYYobB6yRoBH9MdkyGf_ohSf4W1r6zX4cNsX8IQSLRltwdRD6_Ql383Zh4qe321M0fXAbytr6YT1HJTVJ_o_xJgLodOc5n35PyNziw5YGW0W36JWQG6oL70hmJVx4KshaAo5SVNPrG6U2pcPbB9z-bBGF-wdOq-QXXSvF2JZ9_LrfkQ1BO0XvvnAtUiof5_EI2Xy2NJIyQxVB3pC6vR4-xzLkcPMzOV0wW-YZWUpXwn-xQbkG7Cfk9KJB1cs3eKauOWm-ur5uLHhs" />
        </div>
      </section>

      {/* Curated For You */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h3 className="text-headline-sm">Curated for You</h3>
          </div>
          <button className="text-secondary text-body-md font-semibold hover:underline decoration-secondary/30">See all recommendations</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {events.slice(0,2).map((evt) => (
            <div key={evt._id} className="group glass-card p-5 rounded-[2rem] transition-all hover:scale-[1.01] hover:border-outline-variant">
              <div className="relative h-56 rounded-2xl overflow-hidden mb-6">
                <img alt={evt.title} className="w-full h-full object-cover grayscale-[20%] transition-transform duration-700 group-hover:scale-110" src={(evt as any).bannerUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAaQpPOm9RS2gqiStSRgr4XAZoVvo5KF1lvchUk_8zqTDszruvy4Odnq5rSgePoDW1whJg69DEVSqoCgZOtt3S4qeX17PmFpGPGKVEgQS1eMbqb1k4M09Wls4T4_Tamc9Oz2Jbb-14lsjV0of0hzFYNGQGzU48hbOQdVMMMcBp2dOMqluQy0kg-AZASHyy-GuTTQxY0ZAdiKZTdtINpLWpeDXwv2fzTbE99IBcliZvWbMrTBAF4UqNqLNwjdPYIeQ-fVmv693U_S-o'} />
                <span className="absolute top-4 right-4 bg-surface text-on-surface text-caption px-3 py-1 rounded-full shadow-sm tracking-widest font-bold">AI SUGGESTION</span>
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-headline-sm text-lg mb-2">{evt.title}</h4>
                  <p className="text-on-surface-variant text-body-md flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm">location_on</span> {evt.location?.venue || evt.location?.mode || 'Venue'} • {new Date(evt.schedule.startAt).toLocaleTimeString()}
                  </p>
                </div>
                <button className="material-symbols-outlined p-3 bg-surface-container-high text-on-surface-variant rounded-full hover:bg-primary hover:text-on-primary transition-all">add</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Participation Analytics */}
      <div className="bg-surface p-10 rounded-[2rem] border border-outline-variant/20 luxury-glow">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-headline-sm mb-1">Participation Analytics</h3>
            <p className="text-on-surface-variant text-body-md font-light">Campus engagement overview (last 6 months)</p>
          </div>
          <select className="bg-surface-container-low border-outline-variant/30 rounded-xl text-body-md focus:ring-secondary/20 px-4 py-2">
            <option>Last 6 Months</option>
            <option>Last Year</option>
          </select>
        </div>
        <div className="h-72 flex items-end justify-between gap-4 px-4 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <span className="material-symbols-outlined text-[240px]">insights</span>
          </div>
          <div className="w-full h-full flex items-end justify-between group">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-1 bg-secondary/10 hover:bg-secondary/20 transition-all rounded-t-xl relative" style={{ height: `${[40,65,55,85,70,95][i]}%` }}>
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 text-caption transition-opacity uppercase font-bold">{['JAN','FEB','MAR','APR','MAY','JUN'][i]}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-between mt-6 px-4 text-on-surface-variant text-caption tracking-widest font-bold">
          <span>JAN</span><span>FEB</span><span>MAR</span><span>APR</span><span>MAY</span><span>JUN</span>
        </div>
      </div>

      {/* Latest / Registrations lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-8">
        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20">
          <h3 className="mb-4 text-headline-sm">Latest events</h3>
          {events.length === 0 ? (
            <p>No events available yet.</p>
          ) : (
            <ul className="space-y-4">
              {events.map((event) => (
                <li key={event._id} className="flex justify-between items-center">
                  <div>
                    <strong className="block">{event.title}</strong>
                    <small className="text-on-surface-variant">{new Date(event.schedule.startAt).toLocaleString()}</small>
                  </div>
                  <div className="text-sm text-on-surface-variant">{event.location?.venue ?? event.location?.mode ?? ''}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-surface p-6 rounded-xl border border-outline-variant/20">
          <h3 className="mb-4 text-headline-sm">Recent registrations</h3>
          {registrations.length === 0 ? (
            <p>You don't have any registrations yet.</p>
          ) : (
            <ul className="space-y-4">
              {registrations.map((registration) => (
                <li key={registration._id} className="flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{registration.eventId}</div>
                    <small className="text-on-surface-variant">{registration.status}</small>
                  </div>
                  <div className="text-sm text-on-surface-variant">{new Date(registration.registeredAt || '').toLocaleDateString()}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
