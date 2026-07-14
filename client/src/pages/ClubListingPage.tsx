import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getClubs } from '../services/clubService';
import type { ClubItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ClubListingPage = () => {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClubs = async () => {
      setError('');
      setLoading(true);
      try {
        const response = await getClubs(1, 20);
        setClubs(response.items);
      } catch (err: any) {
        setError('Unable to load clubs.');
      } finally {
        setLoading(false);
      }
    };

    loadClubs();
  }, []);

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      <section className="mb-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between mb-6">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-background mb-3">Campus Clubs Directory</h1>
            <p className="font-body-lg text-on-surface-variant max-w-2xl">Connect with like-minded peers, discover new passions, and make the most of your student life.</p>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-[1.5rem] shadow-sm border border-outline-variant mb-8 bg-surface">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBO7fqaUYFSnmpSD_9zkg4hIcNX-z5Tw5fp0_3F5_Tvz0bJFMtvZ3nwKTDUv68FPaRgcxrSTP0Hn39WiqDr2ji5EE-A6CYIn1anUHKJDw5IgeMdSAIVxmb69_4hUeKcaRHLWa0xZ8wQump51xLcfw-kAo4Y5gbOAUZYynPPfyCcmtlTC153f_IUS_B-_4aB_YzNUOEEfWTNOvL_qcfsRdjpxwNjYZ_YWzitb5NlexuRPUqZcOlNiutWTEUcrDa4YOc0qGrI3oLRcH8')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent"></div>
          <div className="relative p-8 lg:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-secondary-fixed text-on-secondary-fixed px-3 py-1 text-caption uppercase tracking-[0.2em] font-semibold mb-3">Featured Club</span>
              <h2 className="font-headline-md text-white mb-3">The Robotics & AI Nexus</h2>
              <p className="font-body-md text-white/80 mb-6">Building the future of autonomous systems and neural interfaces. Weekly workshops and national competitions.</p>
              <div className="flex flex-wrap gap-3">
                <button className="rounded-full bg-white text-primary px-6 py-3 font-semibold hover:bg-surface-container-low transition-colors shadow-sm">Join Club</button>
                <button className="rounded-full border border-white/40 bg-white/10 text-white px-6 py-3 font-semibold hover:bg-white/15 transition-colors">View Details</button>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-[1.5rem] border border-white/20">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface" />
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface" />
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-[10px] text-on-secondary-container font-bold">+142</div>
              </div>
              <span className="font-semibold text-white">145 Members Active</span>
            </div>
          </div>
        </section>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-6">
          {error && <div className="message error">{error}</div>}
          {loading ? (
            <LoadingSpinner />
          ) : clubs.length === 0 ? (
            <div className="glass-card rounded-[1.5rem] border border-outline-variant p-8 text-center text-on-surface-variant">No clubs found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clubs.map((club) => (
                <article key={club._id} className="group glass-card rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest shadow-sm transition hover:-translate-y-1 hover:shadow-md overflow-hidden">
                  <div className="p-6 flex-1">
                    <h3 className="font-headline-sm text-[20px] text-on-background mb-3">{club.name}</h3>
                    <p className="text-body-md text-on-surface-variant mb-5">{club.description}</p>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      <span>{club.members?.length ?? '—'} members</span>
                    </div>
                  </div>
                  <div className="p-5 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="text-body-sm text-on-surface-variant">{club.category}</div>
                    <Link to={`/clubs/${club._id}`} className="text-primary font-semibold">View club</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-6 shadow-sm">
            <h4 className="font-headline-sm mb-3">AI Suggestions for You</h4>
            <p className="text-body-md text-on-surface-variant mb-4">Recommended based on your recent activity.</p>
            <div className="space-y-3">
              <div className="rounded-[1.25rem] border border-transparent bg-surface-container p-4 hover:border-secondary transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-caption uppercase tracking-[0.2em] text-on-surface-variant">NOV 02</span>
                  <span className="material-symbols-outlined text-on-surface-variant">arrow_forward</span>
                </div>
                <h4 className="font-headline-sm text-[16px] mb-1">Cyber-Physical Systems</h4>
                <p className="text-body-sm text-on-surface-variant">Robotics and IoT integration.</p>
              </div>
            </div>
            <button className="mt-4 w-full rounded-full border border-outline-variant bg-surface px-5 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-secondary hover:bg-surface-container transition-colors">
              Personalized Guide
            </button>
          </div>

          <div className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface overflow-hidden shadow-sm">
            <div className="h-40 bg-cover bg-center grayscale contrast-125" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDD7PEsUl45sznDuoi1MvEGT68xODtgpqNZ9y9D7BiuXUguNUtlGFfD6foRSXhr-dsGlNk3ywMoR9JUp41X35Y-X-Pb1bpS4xRdt0YgrME6Goe_J3HI_HXzf847z0xLm_d0C9Y36e7mqx7PDy3SW-y6UH2XdraokZvo_1Oo8cPvXTKDtx_TWLCtHZMZt6bcIlJPFOrsl7_iHJk3wJBacuYNyCHTHMZYY_Srbe3MilFtwP0olPStYLuvwNcFH0JKbU3ggHqwnlKLvE" }} />
            <div className="p-6">
              <h4 className="font-headline-sm text-[18px] mb-4">Location</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-secondary">pin_drop</span>
                  <div>
                    <p className="font-body-md font-semibold text-on-surface">Grand Auditorium</p>
                    <p className="font-body-sm text-on-surface-variant">Engineering Wing, Level 2</p>
                  </div>
                </div>
                <button className="w-full rounded-full border border-outline bg-surface px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-on-surface hover:bg-surface-container transition-colors">
                  Get Directions
                </button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default ClubListingPage;
