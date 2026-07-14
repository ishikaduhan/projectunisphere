import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getEvents } from '../services/eventService';
import { getEventAttendanceReport } from '../services/attendanceService';
import type { EventItem, AttendanceReport } from '../types/api';
import SummaryCard from '../components/SummaryCard';
import EventTable from '../components/EventTable';
import LoadingSpinner from '../components/LoadingSpinner';

const OrganizerDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [attendanceReport, setAttendanceReport] = useState<AttendanceReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
        setError('Unable to load organizer events. Please refresh the page.');
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [user]);

  const dashboardStats = useMemo(() => {
    const totalEvents = events.length;
    const upcomingEvents = events.filter((event) => event.schedule && new Date(event.schedule.startAt) > new Date()).length;
    const totalRegistrations = events.reduce((sum, event) => sum + (event.analytics?.registeredCount ?? 0), 0);
    const totalCheckedIn = events.reduce((sum, event) => sum + (event.analytics?.checkedInCount ?? 0), 0);
    const attendancePercentage = totalRegistrations > 0 ? Math.round((totalCheckedIn / totalRegistrations) * 100) : 0;

    return {
      totalEvents,
      upcomingEvents,
      totalRegistrations,
      totalCheckedIn,
      attendancePercentage,
    };
  }, [events]);

  const handleViewDetails = (eventId: string) => {
    navigate(`/events/${eventId}`);
  };

  const handleViewAttendance = async (eventId: string) => {
    setReportError('');

    try {
      const report = await getEventAttendanceReport(eventId);
      setAttendanceReport(report);
    } catch (err: any) {
      setReportError('Unable to load attendance report.');
      setAttendanceReport(null);
    }
  };

  const handleEdit = () => {
    navigate('/organizer/events');
  };

  const handleDelete = () => {
    navigate('/organizer/events');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <main className="px-margin-desktop py-10 max-w-container-max mx-auto w-full">
      {error && <div className="message error">{error}</div>}

      <section className="relative overflow-hidden rounded-[1.5rem] bg-inverse-surface p-8 text-inverse-on-surface luxury-glow mb-8">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container text-on-surface text-[10px] uppercase tracking-[0.18em] font-semibold mb-4">
            Organizer view
          </span>
          <h2 className="font-display-lg-mobile md:text-display-lg text-inverse-on-surface mb-4 leading-tight">Organizer Dashboard</h2>
          <p className="font-body-lg text-inverse-on-surface/80 max-w-2xl">Review your event performance, registrations, and attendance from a single intelligent workspace.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Total events" value={dashboardStats.totalEvents} subtitle="Events you created or organize." />
        <SummaryCard title="Upcoming events" value={dashboardStats.upcomingEvents} subtitle="Events scheduled for the future." />
        <SummaryCard title="Total registrations" value={dashboardStats.totalRegistrations} subtitle="All registrations across your events." />
        <SummaryCard title="Attendance rate" value={`${dashboardStats.attendancePercentage}%`} subtitle="Average attendee check-in across your events." />
      </div>

      <section className="glass-card rounded-[1.5rem] border border-outline-variant p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <p className="text-label-md uppercase tracking-[0.2em] text-secondary mb-2">My events</p>
            <h3 className="font-headline-sm text-[28px] text-on-background">Manage your created events</h3>
            <p className="text-body-md text-on-surface-variant mt-2">Review event listings, registration details, and attendance reports in one place.</p>
          </div>
          <button
            type="button"
            className="rounded-full bg-primary text-on-primary px-6 py-3 text-sm font-semibold hover:bg-primary/90 transition-colors"
            onClick={() => navigate('/organizer/events')}
          >
            Manage events
          </button>
        </div>

        {events.length === 0 ? (
          <div className="rounded-[1.25rem] border border-outline-variant/20 bg-surface-container p-8 text-center text-on-surface-variant">
            No organizer events found yet.
          </div>
        ) : (
          <EventTable
            events={events.slice(0, 8)}
            onView={handleViewDetails}
            onAttendance={handleViewAttendance}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </section>

      {reportError && <div className="message error mt-6">{reportError}</div>}

      {attendanceReport && (
        <section className="glass-card rounded-[1.5rem] border border-outline-variant p-6 shadow-sm mt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
            <div>
              <p className="text-label-md uppercase tracking-[0.2em] text-secondary">Attendance report</p>
              <h3 className="font-headline-sm text-[24px] text-on-background">{attendanceReport.event.title}</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Registered" value={attendanceReport.statistics.totalRegistered} subtitle="Total registered attendees." />
            <SummaryCard title="Present" value={attendanceReport.statistics.totalCheckedIn} subtitle="Attendees checked in." />
            <SummaryCard title="Absent" value={attendanceReport.statistics.totalAbsent} subtitle="Attendees not checked in." />
            <SummaryCard title="Attendance" value={`${attendanceReport.statistics.attendanceRate}%`} subtitle="Event attendance percentage." />
          </div>
        </section>
      )}
    </main>
  );
};

export default OrganizerDashboardPage;
