import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEvents, approveEvent, deleteEvent } from '../services/eventService';
import type { EventItem } from '../types/api';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import DataTable from '../components/DataTable';
import LoadingSkeleton from '../components/LoadingSkeleton';
import Toast from '../components/Toast';
import EmptyState from '../components/EmptyState';

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const loadEvents = async () => {
    setLoading(true);
    setError('');

    try {
      const status = statusFilter === 'all' ? undefined : statusFilter;
      const result = await getEvents(1, 50, search || undefined, status);
      setEvents(result.items);
    } catch (err: any) {
      setError('Unable to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [search, statusFilter]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadEvents();
  };

  const handleApproval = async (eventId: string, status: 'approved' | 'rejected') => {
    setError('');
    try {
      await approveEvent(eventId, status);
      setToast(`Event ${status} successfully.`);
      await loadEvents();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to update event status.');
    }
  };

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm('Delete this event permanently?');
    if (!confirmed) return;

    try {
      await deleteEvent(eventId);
      setToast('Event deleted successfully.');
      setEvents((current) => current.filter((item) => item._id !== eventId));
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to delete event.');
    }
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Admin Event Management</h2>
          <p>Review, approve, or remove campus events at scale.</p>
        </div>
      </div>

      <FilterBar>
        <SearchBar value={search} onChange={setSearch} onSubmit={handleSearch} placeholder="Search event titles or tags" />
        <label>
          Status
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="draft">Draft</option>
          </select>
        </label>
      </FilterBar>

      {error && <div className="message error">{error}</div>}
      {toast && <Toast message={toast} type="success" onClose={() => setToast('')} />}

      {events.length === 0 ? (
        <EmptyState title="No events match your search" description="Try a different status or keyword." />
      ) : (
        <DataTable headers={['Event', 'Date', 'Status', 'Registrations', 'Attendance', 'Actions']}>
          {events.map((event) => (
            <tr key={event._id}>
              <td>
                <strong>{event.title}</strong>
                <div className="table-row-detail">{event.description}</div>
              </td>
              <td>
                {new Date(event.schedule.startAt).toLocaleDateString()}
                <div className="table-row-detail">Ends {new Date(event.schedule.endAt).toLocaleDateString()}</div>
              </td>
              <td>
                <span className={`status-badge status-${event.approval?.status || 'draft'}`}>{event.approval?.status || 'draft'}</span>
              </td>
              <td>{event.analytics?.registeredCount ?? 0}</td>
              <td>{event.analytics?.checkedInCount ?? 0}</td>
              <td className="action-cell">
                <button type="button" className="button button-secondary" onClick={() => navigate(`/events/${event._id}`)}>
                  View
                </button>
                {event.approval?.status === 'pending' && (
                  <>
                    <button type="button" className="button" onClick={() => handleApproval(event._id, 'approved')}>
                      Approve
                    </button>
                    <button type="button" className="button button-danger" onClick={() => handleApproval(event._id, 'rejected')}>
                      Reject
                    </button>
                  </>
                )}
                <button type="button" className="button button-danger" onClick={() => handleDelete(event._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      )}
    </section>
  );
};

export default AdminEventsPage;
