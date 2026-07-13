import { useEffect, useState } from 'react';
import { getClubs, createClub, updateClub, deleteClub } from '../services/clubService';
import type { ClubItem } from '../types/api';
import LoadingSkeleton from '../components/LoadingSkeleton';
import DataTable from '../components/DataTable';
import SearchBar from '../components/SearchBar';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';

interface ClubFormState {
  name: string;
  description: string;
  category: string;
  visibility: 'public' | 'university_only' | 'private';
  slug: string;
}

const defaultFormState: ClubFormState = {
  name: '',
  description: '',
  category: '',
  visibility: 'public',
  slug: '',
};

const AdminClubsPage = () => {
  const [clubs, setClubs] = useState<ClubItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClub, setEditingClub] = useState<ClubItem | null>(null);
  const [formState, setFormState] = useState<ClubFormState>(defaultFormState);

  const loadClubs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getClubs(1, 100);
      setClubs(response.items);
    } catch (err: any) {
      setError('Unable to load clubs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClubs();
  }, []);

  const handleOpenModal = (club?: ClubItem) => {
    if (club) {
      setEditingClub(club);
      setFormState({
        name: club.name,
        description: club.description,
        category: club.category,
        visibility: club.visibility as ClubFormState['visibility'],
        slug: club.slug || '',
      });
    } else {
      setEditingClub(null);
      setFormState(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingClub(null);
    setError('');
  };

  const handleSaveClub = async () => {
    setError('');
    try {
      if (editingClub) {
        await updateClub(editingClub._id, {
          name: formState.name,
          description: formState.description,
          category: formState.category,
          visibility: formState.visibility,
          slug: formState.slug || undefined,
        });
        setToast('Club updated successfully.');
      } else {
        await createClub({
          name: formState.name,
          description: formState.description,
          category: formState.category,
          visibility: formState.visibility,
          slug: formState.slug || undefined,
        });
        setToast('Club created successfully.');
      }
      await loadClubs();
      handleCloseModal();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to save club.');
    }
  };

  const handleDeleteClub = async (clubId: string) => {
    const confirmed = window.confirm('Delete this club? This action cannot be undone.');
    if (!confirmed) return;

    setError('');
    try {
      await deleteClub(clubId);
      setToast('Club deleted successfully.');
      setClubs((current) => current.filter((item) => item._id !== clubId));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to delete club.');
    }
  };

  const filteredClubs = clubs.filter((club) =>
    club.name.toLowerCase().includes(search.toLowerCase()) || club.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Admin Club Management</h2>
          <p>Create, edit, and archive student clubs across UniSphere.</p>
        </div>
        <button type="button" className="button" onClick={() => handleOpenModal()}>
          Add club
        </button>
      </div>

      {error && <div className="message error">{error}</div>}
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')} />}

      <SearchBar value={search} onChange={setSearch} onSubmit={(event) => { event.preventDefault(); }} placeholder="Search clubs" buttonLabel="Filter" />

      {filteredClubs.length === 0 ? (
        <EmptyState title="No clubs found" description="Create a new club or adjust the search filter." />
      ) : (
        <DataTable headers={['Club', 'Category', 'Visibility', 'Members', 'Actions']}>
          {filteredClubs.map((club) => (
            <tr key={club._id}>
              <td>
                <strong>{club.name}</strong>
                <div className="table-row-detail">{club.description}</div>
              </td>
              <td>{club.category}</td>
              <td>{club.visibility}</td>
              <td>{club.members?.length ?? 0}</td>
              <td className="action-cell">
                <button type="button" className="button" onClick={() => handleOpenModal(club)}>
                  Edit
                </button>
                <button type="button" className="button button-danger" onClick={() => handleDeleteClub(club._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}

      <Modal open={isModalOpen} title={editingClub ? 'Edit club' : 'Create club'} onClose={handleCloseModal} footer={
        <div className="modal-footer-actions">
          <button type="button" className="button button-secondary" onClick={handleCloseModal}>
            Cancel
          </button>
          <button type="button" className="button" onClick={handleSaveClub}>
            Save
          </button>
        </div>
      }>
        <div className="form-grid">
          <label>
            Name
            <input value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })} required />
          </label>
          <label>
            Category
            <input value={formState.category} onChange={(e) => setFormState({ ...formState, category: e.target.value })} required />
          </label>
          <label>
            Visibility
            <select value={formState.visibility} onChange={(e) => setFormState({ ...formState, visibility: e.target.value as ClubFormState['visibility'] })}>
              <option value="public">Public</option>
              <option value="university_only">University only</option>
              <option value="private">Private</option>
            </select>
          </label>
          <label>
            Slug
            <input value={formState.slug} onChange={(e) => setFormState({ ...formState, slug: e.target.value })} placeholder="optional" />
          </label>
        </div>
        <label>
          Description
          <textarea value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
        </label>
      </Modal>
    </section>
  );
};

export default AdminClubsPage;
