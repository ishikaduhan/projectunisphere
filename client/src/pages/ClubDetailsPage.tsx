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
      {error && <div className="message error">{error}</div>}

      <div className="relative w-full rounded-xl overflow-hidden shadow-md mb-8 border border-outline-variant">
        <div className="w-full h-64 bg-cover bg-center" style={{ backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBO7fqaUYFSnmpSD_9zkg4hIcNX-z5Tw5fp0_3F5_Tvz0bJFMtvZ3nwKTDUv68FPaRgcxrSTP0Hn39WiqDr2ji5EE-A6CYIn1anUHKJDw5IgeMdSAIVxmb69_4hUeKcaRHLWa0xZ8wQump51xLcfw-kAo4Y5gbOAUZYynPPfyCcmtlTC153f_IUS_B-_4aB_YzNUOEEfWTNOvL_qcfsRdjpxwNjYZ_YWzitb5NlexuRPUqZcOlNiutWTEUcrDa4YOc0qGrI3oLRcH8')` }} />
        <div className="p-6 bg-surface-container-low">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-surface">
              <div className="w-full h-full bg-surface-dim flex items-center justify-center">{club.name?.charAt(0)}</div>
            </div>
            <div className="flex-1">
              <h1 className="text-headline-md mb-1">{club.name}</h1>
              <p className="text-on-surface-variant mb-3">{club.description}</p>
              <div className="flex items-center gap-4">
                <span className="text-on-surface-variant">{club.members?.length || 0} members</span>
                <span className="text-on-surface-variant">{club.visibility}</span>
                <button className="ml-auto bg-primary text-on-primary px-4 py-2 rounded-lg font-semibold">Join Club</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h3 className="font-headline-sm mb-4">About</h3>
            <p className="text-on-surface-variant leading-relaxed">{club.description}</p>
          </section>

          <section className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h3 className="font-headline-sm mb-4">Upcoming Activities</h3>
            <p className="text-on-surface-variant">No upcoming activities found.</p>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h4 className="font-headline-sm mb-2">Club Details</h4>
            <div className="space-y-3 text-on-surface-variant">
              <div><strong>Category:</strong> {club.category}</div>
              <div><strong>Visibility:</strong> {club.visibility}</div>
              <div><strong>Members:</strong> {club.members?.length || 0}</div>
            </div>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-outline-variant">
            <h4 className="font-headline-sm mb-2">Leadership</h4>
            <p className="text-on-surface-variant">Club officers not listed.</p>
          </div>
        </aside>
      </div>

      <div className="mt-6">
        <button type="button" className="button button-link" onClick={() => navigate('/clubs')}>
          Back to club listing
        </button>
      </div>
    </main>
  );
};

export default ClubDetailsPage;
