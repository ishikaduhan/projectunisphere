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
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Clubs</h2>
          <p>Explore university clubs and discover communities that match your interests.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}
      {loading ? (
        <LoadingSpinner />
      ) : clubs.length === 0 ? (
        <div className="card">No clubs found.</div>
      ) : (
        <div className="grid-layout">
          {clubs.map((club) => (
            <article key={club._id} className="card card-preview">
              <div>
                <h3>{club.name}</h3>
                <p>{club.description}</p>
              </div>
              <div className="card-footer">
                <span>{club.category}</span>
                <span>{club.visibility}</span>
              </div>
              <Link to={`/clubs/${club._id}`} className="button button-link">
                View club
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default ClubListingPage;
