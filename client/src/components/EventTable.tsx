import type { EventItem } from '../types/api';

interface EventTableProps {
  events: EventItem[];
  onView: (eventId: string) => void;
  onAttendance: (eventId: string) => void;
  onEdit: (event: EventItem) => void;
  onDelete: (eventId: string) => void;
}

const formatDate = (value?: string) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const statusLabel = (event: EventItem) => {
  const now = new Date();
  if (event.approval?.status === 'rejected') {
    return 'Cancelled';
  }

  if (event.schedule && new Date(event.schedule.endAt) < now) {
    return 'Completed';
  }

  if (event.schedule && new Date(event.schedule.startAt) > now) {
    return 'Upcoming';
  }

  return event.approval?.status || 'Draft';
};

const EventTable = ({ events, onView, onAttendance, onEdit, onDelete }: EventTableProps) => (
  <div className="table-container">
    <table className="data-table">
      <thead>
        <tr>
          <th>Event</th>
          <th>Date</th>
          <th>Status</th>
          <th>Registrations</th>
          <th>Checked in</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {events.map((event) => (
          <tr key={event._id}>
            <td>
              <strong>{event.title}</strong>
              <div className="table-row-detail">{event.description}</div>
            </td>
            <td>
              {formatDate(event.schedule?.startAt)}
              <div className="table-row-detail">{formatDate(event.schedule?.endAt)}</div>
            </td>
            <td>
              <span className={`status-badge status-${statusLabel(event).toLowerCase().replace(/\s+/g, '-')}`}>
                {statusLabel(event)}
              </span>
            </td>
            <td>{event.analytics?.registeredCount ?? 0}</td>
            <td>{event.analytics?.checkedInCount ?? 0}</td>
            <td className="action-cell">
              <button type="button" className="button button-link" onClick={() => onView(event._id)}>
                Details
              </button>
              <button type="button" className="button button-secondary" onClick={() => onAttendance(event._id)}>
                Attendance
              </button>
              <button type="button" className="button button-secondary" onClick={() => onEdit(event)}>
                Edit
              </button>
              <button type="button" className="button button-danger" onClick={() => onDelete(event._id)}>
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default EventTable;
