import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClub } from '../services/clubService';
import type { ClubItem } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';

const ClubDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [club, setClub] = useState<ClubItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadClub = async () => {
      if (!id) return;
      setLoading(true);
      setError('');

      try {
        const response = await getClub(id);
        setClub(response);
      } catch (err: any) {
        setError('Unable to load club details.');
      } finally {
        setLoading(false);
      }
    };

    loadClub();
  }, [id]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!club) {
    return (
      <section className="page-section">
        <div className="message error">Club not found.</div>
      </section>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      {error && <div className="message error mb-6">{error}</div>}

      <section className="relative overflow-hidden rounded-[1.5rem] shadow-sm border border-outline-variant mb-8 bg-surface">
        <div className="relative h-72 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBO7fqaUYFSnmpSD_9zkg4hIcNX-z5Tw5fp0_3F5_Tvz0bJFMtvZ3nwKTDUv68FPaRgcxrSTP0Hn39WiqDr2ji5EE-A6CYIn1anUHKJDw5IgeMdSAIVxmb69_4hUeKcaRHLWa0xZ8wQump51xLcfw-kAo4Y5gbOAUZYynPPfyCcmtlTC153f_IUS_B-_4aB_YzNUOEEfWTNOvL_qcfsRdjpxwNjYZ_YWzitb5NlexuRPUqZcOlNiutWTEUcrDa4YOc0qGrI3oLRcH8')" }}>
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent" />
        </div>
        <div className="relative p-8 lg:p-10">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-3xl bg-surface-dim flex items-center justify-center text-headline-md text-primary">
              {club.name?.charAt(0)}
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary-container text-on-secondary-container text-caption uppercase tracking-[0.2em] font-semibold mb-3">
                {club.category}
              </span>
              <h1 className="font-display-lg-mobile md:text-display-lg text-on-background mb-3">{club.name}</h1>
              <p className="text-body-lg text-on-surface-variant max-w-2xl">{club.description}</p>
            </div>
            <button className="rounded-full bg-primary text-on-primary px-6 py-3 font-semibold text-sm hover:bg-primary/90 transition-colors">
              Join Club
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-6">
          <section className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-8 shadow-sm">
            <h3 className="font-headline-sm text-[24px] mb-4">About</h3>
            <p className="text-body-md text-on-surface-variant leading-relaxed">{club.description}</p>
          </section>

          <section className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-8 shadow-sm">
            <h3 className="font-headline-sm text-[24px] mb-4">Upcoming Activities</h3>
            <p className="text-body-md text-on-surface-variant">No upcoming activities found.</p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-6 shadow-sm">
            <h4 className="font-headline-sm mb-4">Club details</h4>
            <div className="space-y-3 text-on-surface-variant">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-on-surface">Category</span>
                <span>{club.category}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-on-surface">Visibility</span>
                <span>{club.visibility}</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-on-surface">Members</span>
                <span>{club.members?.length || 0}</span>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-6 shadow-sm">
            <h4 className="font-headline-sm mb-4">Leadership</h4>
            <p className="text-body-md text-on-surface-variant">Club officers not listed.</p>
          </div>
        </aside>
      </div>

      <div className="mt-8">
        <button
          type="button"
          className="rounded-full border border-outline px-6 py-3 text-sm font-semibold text-primary hover:bg-surface-container transition-colors"
          onClick={() => navigate('/clubs')}
        >
          Back to club listing
        </button>
      </div>
    </main>
  );
};

export default ClubDetailsPage;
