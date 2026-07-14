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
        <div className="relative z-10 max-w-lg">
          <h2 className="text-display-lg-mobile md:text-headline-md mb-2 leading-tight">Organizer Dashboard</h2>
          <p className="text-body-lg opacity-80">Review your event performance, registrations and attendance from a single view.</p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <SummaryCard title="Total events" value={dashboardStats.totalEvents} subtitle="Events you created or organize." />
        <SummaryCard title="Upcoming events" value={dashboardStats.upcomingEvents} subtitle="Events scheduled for the future." />
        <SummaryCard title="Total registrations" value={dashboardStats.totalRegistrations} subtitle="All registrations across your events." />
        <SummaryCard title="Attendance rate" value={`${dashboardStats.attendancePercentage}%`} subtitle="Average attendee check-in across your events." />
      </div>

      <div className="card organizer-panel p-6 rounded-xl border border-outline-variant">
        <div className="panel-header flex items-center justify-between">
          <div>
            <h3>My events</h3>
            <p>Manage your created events and open attendance reports.</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="button" onClick={() => navigate('/organizer/events')}>Manage events</button>
          </div>
        </div>

        <div className="mt-6">
          {events.length === 0 ? (
            <div className="empty-state">
              <p>No organizer events found yet.</p>
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
        </div>
      </div>

      {reportError && <div className="message error mt-6">{reportError}</div>}

      {attendanceReport && (
        <div className="card attendance-report-card mt-6 p-6 rounded-xl border border-outline-variant">
          <div className="panel-header">
            <div>
              <h3>Attendance report</h3>
              <p>{attendanceReport.event.title}</p>
            </div>
          </div>

          <div className="report-grid mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
            <SummaryCard title="Registered" value={attendanceReport.statistics.totalRegistered} subtitle="Total registered attendees." />
            <SummaryCard title="Present" value={attendanceReport.statistics.totalCheckedIn} subtitle="Attendees checked in." />
            <SummaryCard title="Absent" value={attendanceReport.statistics.totalAbsent} subtitle="Attendees not checked in." />
            <SummaryCard title="Attendance" value={`${attendanceReport.statistics.attendanceRate}%`} subtitle="Event attendance percentage." />
          </div>
        </div>
      )}
    </main>
  );
};

export default OrganizerDashboardPage;
