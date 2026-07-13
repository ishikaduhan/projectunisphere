import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createEvent, deleteEvent, getEvents, updateEvent } from '../services/eventService';
import { getEventAttendanceReport } from '../services/attendanceService';
import type { EventItem, AttendanceReport } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import EventTable from '../components/EventTable';
import ParticipantTable from '../components/ParticipantTable';
import SummaryCard from '../components/SummaryCard';

type EventFormState = {
  title: string;
  description: string;
  mode: 'offline' | 'online' | 'hybrid';
  venue: string;
  room: string;
  meetingUrl: string;
  startAt: string;
  endAt: string;
  tags: string;
};

const defaultFormState: EventFormState = {
  title: '',
  description: '',
  mode: 'offline',
  venue: '',
  room: '',
  meetingUrl: '',
  startAt: '',
  endAt: '',
  tags: '',
};

const MyEventsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState(defaultFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeEvent, setActiveEvent] = useState<EventItem | null>(null);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      setError('');
      setLoading(true);
      try {
        const response = await getEvents(1, 100);
        const myEvents = response.items.filter(
          (item) =>
            item.createdBy === user?.id || item.organizers?.some((organizer) => organizer === user?.id)
        );
        setEvents(myEvents);
      } catch (err: any) {
        setError('Unable to load organizer events. Please refresh.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  useEffect(() => {
    const now = new Date();
    const filtered = events.filter((event) => {
      const eventStart = new Date(event.schedule?.startAt || '');
      const eventEnd = new Date(event.schedule?.endAt || '');
      if (statusFilter === 'upcoming' && eventStart <= now) return false;
      if (statusFilter === 'completed' && eventEnd > now) return false;
      if (statusFilter === 'cancelled' && event.approval?.status !== 'rejected') return false;
      return (
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.description.toLowerCase().includes(search.toLowerCase()) ||
        event.tags?.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    });

    setFilteredEvents(filtered);
  }, [events, search, statusFilter]);

  const handleOpenForm = () => {
    setActiveEvent(null);
    setFormState(defaultFormState);
    setIsFormOpen(true);
  };

  const handleEdit = (event: EventItem) => {
    setActiveEvent(event);
    setFormState({
      title: event.title || '',
      description: event.description || '',
      mode: (event.location?.mode as EventFormState['mode']) || 'offline',
      venue: event.location?.venue || '',
      room: event.location?.room || '',
      meetingUrl: event.location?.meetingUrl || '',
      startAt: event.schedule?.startAt ? new Date(event.schedule.startAt).toISOString().slice(0, 16) : '',
      endAt: event.schedule?.endAt ? new Date(event.schedule.endAt).toISOString().slice(0, 16) : '',
      tags: event.tags?.join(', ') || '',
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setActiveEvent(null);
    setFormState(defaultFormState);
    setIsFormOpen(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title: formState.title,
      description: formState.description,
      tags: formState.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      schedule: {
        startAt: formState.startAt,
        endAt: formState.endAt,
        timezone: 'Asia/Kolkata',
      },
      location: {
        mode: formState.mode,
        venue: formState.venue,
        room: formState.room,
        meetingUrl: formState.meetingUrl,
      },
    };

    try {
      if (activeEvent) {
        await updateEvent(activeEvent._id, payload);
      } else {
        await createEvent(payload);
      }
      const refreshed = await getEvents(1, 100);
      const myEvents = refreshed.items.filter(
        (item) =>
          item.createdBy === user?.id || item.organizers?.some((organizer) => organizer === user?.id)
      );
      setEvents(myEvents);
      resetForm();
    } catch (err: any) {
      setError('Unable to save event. Please check the values and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    const confirmed = window.confirm('Delete this event and all related data?');
    if (!confirmed) return;

    setError('');
    setLoading(true);
    try {
      await deleteEvent(eventId);
      setEvents((current) => current.filter((event) => event._id !== eventId));
      setAttendanceReport(null);
    } catch (err: any) {
      setError('Unable to delete event.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleViewAttendance = async (eventId: string) => {
    setReportError('');
    setReportLoading(true);

    try {
      const report = await getEventAttendanceReport(eventId);
      setAttendanceReport(report);
    } catch (err: any) {
      setAttendanceReport(null);
      setReportError('Unable to load attendance report.');
    } finally {
      setReportLoading(false);
    }
  };

  const summary = useMemo(() => {
    const totalEvents = events.length;
    const totalRegistrations = events.reduce((sum, event) => sum + (event.analytics?.registeredCount ?? 0), 0);
    const totalCheckedIn = events.reduce((sum, event) => sum + (event.analytics?.checkedInCount ?? 0), 0);
    return { totalEvents, totalRegistrations, totalCheckedIn };
  }, [events]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>My Events</h2>
          <p>Manage your organizer events, registrations, and attendance reports.</p>
        </div>
        <button type="button" className="button" onClick={handleOpenForm}>
          Create Event
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      <div className="summary-grid">
        <SummaryCard title="Created events" value={summary.totalEvents} subtitle="Events you are managing." />
        <SummaryCard title="Total registrations" value={summary.totalRegistrations} subtitle="All registrations for your events." />
        <SummaryCard title="Checked in" value={summary.totalCheckedIn} subtitle="Attendance recorded across your events." />
      </div>

      <div className="card filter-panel">
        <div className="filter-row">
          <div className="filter-group">
            <label>
              Search events
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by title or tags" />
            </label>
          </div>
          <div className="filter-group">
            <label>
              Status
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
                <option value="all">All</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>
        </div>
      </div>

      <div className="card">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <p>No events match your search and filters.</p>
          </div>
        ) : (
          <EventTable
            events={filteredEvents}
            onView={handleViewDetails}
            onAttendance={handleViewAttendance}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>

      {isFormOpen && (
        <div className="card form-card">
          <div className="panel-header">
            <div>
              <h3>{activeEvent ? 'Edit event' : 'Create new event'}</h3>
              <p>{activeEvent ? 'Update your event details below.' : 'Fill in the fields to create a new event.'}</p>
            </div>
            <button type="button" className="button button-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleSubmit} className="event-form">
            <div className="form-grid">
              <label>
                Title
                <input value={formState.title} onChange={(e) => setFormState({ ...formState, title: e.target.value })} required />
              </label>
              <label>
                Location mode
                <select
                  value={formState.mode}
                  onChange={(e) => setFormState({ ...formState, mode: e.target.value as EventFormState['mode'] })}
                >
                  <option value="offline">Offline</option>
                  <option value="online">Online</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </label>
            </div>

            <label>
              Description
              <textarea value={formState.description} onChange={(e) => setFormState({ ...formState, description: e.target.value })} required />
            </label>

            <div className="form-grid">
              <label>
                Start date
                <input type="datetime-local" value={formState.startAt} onChange={(e) => setFormState({ ...formState, startAt: e.target.value })} required />
              </label>
              <label>
                End date
                <input type="datetime-local" value={formState.endAt} onChange={(e) => setFormState({ ...formState, endAt: e.target.value })} required />
              </label>
            </div>

            <div className="form-grid">
              <label>
                Venue
                <input value={formState.venue} onChange={(e) => setFormState({ ...formState, venue: e.target.value })} />
              </label>
              <label>
                Room
                <input value={formState.room} onChange={(e) => setFormState({ ...formState, room: e.target.value })} />
              </label>
            </div>

            <label>
              Meeting URL
              <input value={formState.meetingUrl} onChange={(e) => setFormState({ ...formState, meetingUrl: e.target.value })} placeholder="Optional for online/hybrid events" />
            </label>

            <label>
              Tags
              <input value={formState.tags} onChange={(e) => setFormState({ ...formState, tags: e.target.value })} placeholder="Comma-separated tags" />
            </label>

            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving...' : activeEvent ? 'Update event' : 'Create event'}
            </button>
          </form>
        </div>
      )}

      {reportError && <div className="message error">{reportError}</div>}
      {reportLoading && <LoadingSpinner />}
      {attendanceReport && (
        <div className="card attendance-report-card">
          <div className="panel-header">
            <div>
              <h3>Attendance report</h3>
              <p>{attendanceReport.event.title}</p>
            </div>
          </div>

          <div className="report-grid">
            <SummaryCard title="Registered" value={attendanceReport.statistics.totalRegistered} subtitle="Total registered attendees." />
            <SummaryCard title="Checked in" value={attendanceReport.statistics.totalCheckedIn} subtitle="Visitors present at the event." />
            <SummaryCard title="Absent" value={attendanceReport.statistics.totalAbsent} subtitle="Registered attendees missing the event." />
            <SummaryCard title="Rate" value={`${attendanceReport.statistics.attendanceRate}%`} subtitle="Overall attendance percentage." />
          </div>

          <ParticipantTable records={attendanceReport.attendance} />
        </div>
      )}
    </section>
  );
};

export default MyEventsPage;
