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

const pillClass = (label: string) => {
  if (label === 'Cancelled') return 'bg-error-container text-on-error-container';
  if (label === 'Completed') return 'bg-surface-container text-on-surface';
  if (label === 'Upcoming') return 'bg-primary-container text-on-primary-container';
  return 'bg-secondary-container text-on-secondary-container';
};

const EventTable = ({ events, onView, onAttendance, onEdit, onDelete }: EventTableProps) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-separate border-spacing-0">
      <thead>
        <tr className="bg-surface-container border-b border-outline-variant/40 text-left">
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Event</th>
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Date</th>
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Status</th>
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Registrations</th>
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Checked in</th>
          <th className="px-4 py-4 text-[10px] uppercase tracking-[0.25em] text-on-surface-variant">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-outline-variant/20">
        {events.map((event) => {
          const status = statusLabel(event);
          return (
            <tr key={event._id} className="hover:bg-surface-container-low transition-colors">
              <td className="px-4 py-5 align-top">
                <p className="font-semibold text-on-surface">{event.title}</p>
                <p className="text-caption text-on-surface-variant mt-1">{event.description}</p>
              </td>
              <td className="px-4 py-5 align-top">
                <p className="font-medium text-on-surface">{formatDate(event.schedule?.startAt)}</p>
                <p className="text-caption text-on-surface-variant mt-1">{formatDate(event.schedule?.endAt)}</p>
              </td>
              <td className="px-4 py-5 align-top">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.18em] uppercase ${pillClass(status)}`}>
                  {status}
                </span>
              </td>
              <td className="px-4 py-5 align-top text-on-surface">{event.analytics?.registeredCount ?? 0}</td>
              <td className="px-4 py-5 align-top text-on-surface">{event.analytics?.checkedInCount ?? 0}</td>
              <td className="px-4 py-5 align-top space-y-2">
                <button type="button" className="w-full rounded-full border border-outline-variant bg-surface py-2 text-[12px] font-semibold text-primary hover:bg-surface-container-low transition-colors" onClick={() => onView(event._id)}>
                  Details
                </button>
                <button type="button" className="w-full rounded-full border border-outline-variant bg-surface py-2 text-[12px] font-semibold text-secondary hover:bg-surface-container-low transition-colors" onClick={() => onAttendance(event._id)}>
                  Attendance
                </button>
                <button type="button" className="w-full rounded-full border border-outline-variant bg-surface py-2 text-[12px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors" onClick={() => onEdit(event)}>
                  Edit
                </button>
                <button type="button" className="w-full rounded-full border border-error text-error bg-surface py-2 text-[12px] font-semibold hover:bg-error/10 transition-colors" onClick={() => onDelete(event._id)}>
                  Delete
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  </div>
);

export default EventTable;
