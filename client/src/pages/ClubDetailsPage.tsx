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
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>{club.name}</h2>
          <p>{club.description}</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="card details-card">
        <div>
          <h3>Category</h3>
          <p>{club.category}</p>
        </div>
        <div>
          <h3>Visibility</h3>
          <p>{club.visibility}</p>
        </div>
        {club.members?.length ? (
          <div>
            <h3>Members</h3>
            <p>{club.members.length} members</p>
          </div>
        ) : null}
      </div>

      <button type="button" className="button button-link" onClick={() => navigate('/clubs')}>
        Back to club listing
      </button>
    </section>
  );
};

export default ClubDetailsPage;
