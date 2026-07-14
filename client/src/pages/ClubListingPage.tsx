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
        <div className="flex justify-between items-end mb-4">
          <div>
            <h1 className="font-display-lg text-headline-md text-on-background mb-2">Campus Clubs Directory</h1>
            <p className="text-body-lg text-on-surface-variant max-w-2xl font-normal">Connect with like-minded peers, discover new passions, and make the most of your student life.</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl h-[340px] group shadow-lg border border-outline-variant/30 mb-8">
          <div className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBO7fqaUYFSnmpSD_9zkg4hIcNX-z5Tw5fp0_3F5_Tvz0bJFMtvZ3nwKTDUv68FPaRgcxrSTP0Hn39WiqDr2ji5EE-A6CYIn1anUHKJDw5IgeMdSAIVxmb69_4hUeKcaRHLWa0xZ8wQump51xLcfw-kAo4Y5gbOAUZYynPPfyCcmtlTC153f_IUS_B-_4aB_YzNUOEEfWTNOvL_qcfsRdjpxwNjYZ_YWzitb5NlexuRPUqZcOlNiutWTEUcrDa4YOc0qGrI3oLRcH8')" }} />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="max-w-xl">
              <span className="bg-secondary-fixed text-on-secondary-fixed text-label-md px-3 py-1 rounded-full mb-2 inline-block font-bold">Featured Club</span>
              <h2 className="font-headline-md text-white mb-2">The Robotics &amp; AI Nexus</h2>
              <p className="text-white/80 font-body-md mb-4">Building the future of autonomous systems and neural interfaces. Weekly workshops and national competitions.</p>
              <div className="flex gap-3">
                <button className="bg-white text-primary font-bold px-6 py-2 rounded-lg hover:bg-surface-container-low transition-all shadow-md">Join Club</button>
                <button className="border border-white/40 backdrop-blur-md text-white font-bold px-6 py-2 rounded-lg hover:bg-white/10 transition-all">View Details</button>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-lg p-3 rounded-xl border border-white/20">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface overflow-hidden" />
                <div className="w-10 h-10 rounded-full border-2 border-primary bg-surface overflow-hidden" />
                <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-[10px] text-on-secondary-container font-bold">+142</div>
              </div>
              <span className="text-white font-bold text-body-md">145 Members Active</span>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-6">
          {error && <div className="message error">{error}</div>}
          {loading ? (
            <LoadingSpinner />
          ) : clubs.length === 0 ? (
            <div className="card">No clubs found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {clubs.map((club) => (
                <article key={club._id} className="group bg-surface-container-lowest rounded overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border border-outline-variant flex flex-col">
                  <div className="p-6 flex-1">
                    <h3 className="font-headline-sm text-[18px] mb-2">{club.name}</h3>
                    <p className="text-body-md text-on-surface-variant mb-4 line-clamp-3">{club.description}</p>
                    <div className="flex items-center gap-2 text-on-surface-variant text-sm">
                      <span className="material-symbols-outlined text-[18px]">group</span>
                      <span>{club.members?.length ?? '—'} members</span>
                    </div>
                  </div>
                  <div className="p-4 border-t border-outline-variant/30 flex items-center justify-between">
                    <div className="text-on-surface-variant text-sm">{club.category}</div>
                    <Link to={`/clubs/${club._id}`} className="text-primary font-semibold">View club</Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h4 className="font-headline-sm mb-2">AI Suggestions for You</h4>
            <p className="text-on-surface-variant mb-4">Recommended based on your recent activity.</p>
            <div className="space-y-3">
              <div className="p-4 bg-surface-container rounded-lg hover:border-secondary border border-transparent transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-widest">NOV 02</span>
                  <span className="material-symbols-outlined text-outline">arrow_forward</span>
                </div>
                <h4 className="font-headline-sm text-[16px] mb-1">Cyber-Physical Systems</h4>
                <p className="font-body-sm text-on-surface-variant line-clamp-1">Robotics and IoT integration.</p>
              </div>
            </div>
            <button className="w-full py-3 text-secondary font-label-md border-t border-outline-variant pt-4 hover:opacity-80 uppercase tracking-widest text-[11px]">Personalized Guide</button>
          </div>

          <div className="bg-surface rounded-xl overflow-hidden border border-outline-variant">
            <div className="h-40 relative grayscale contrast-125">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDD7PEsUl45sznDuoi1MvEGT68xODtgpqNZ9y9D7BiuXUguNUtlGFfD6foRSXhr-dsGlNk3ywMoR9JUp41X35Y-X-Pb1bpS4xRdt0YgrME6Goe_J3HI_HXzf847z0xLm_d0C9Y36e7mqx7PDy3SW-y6UH2XdraokZvo_1Oo8cPvXTKDtx_TWLCtHZMZt6bcIlJPFOrsl7_iHJk3wJBacuYNyCHTHMZYY_Srbe3MilFtwPZ0olPStYLuvwNcFH0JKbU3ggHqwnlKLvE" alt="" />
            </div>
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
                <button className="w-full py-3 bg-surface border border-outline text-on-surface rounded-lg font-label-md hover:bg-surface-container transition-all uppercase tracking-widest text-[11px]">Get Directions</button>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default ClubListingPage;
