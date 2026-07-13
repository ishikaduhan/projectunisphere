import { useEffect, useState } from 'react';
import { getClubs } from '../services/clubService';
import { getEvents, getEventAnalytics, approveEvent } from '../services/eventService';
import type { EventItem, AnalyticsSummary } from '../types/api';
import LoadingSpinner from '../components/LoadingSkeleton';
import SummaryCard from '../components/SummaryCard';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [clubCount, setClubCount] = useState(0);
  const [topTags, setTopTags] = useState<AnalyticsSummary['topTags']>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    setError('');
    setLoading(true);
    try {
      const [analyticsData, clubsData, pendingEventData] = await Promise.all([
        getEventAnalytics(),
        getClubs(1, 100),
        getEvents(1, 10, undefined, 'pending'),
      ]);

      setAnalytics(analyticsData);
      setTopTags(analyticsData.topTags || []);
      setClubCount(clubsData.total);
      setPendingEvents(pendingEventData.items);
    } catch (err: any) {
      setError('Unable to load admin dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleApproval = async (eventId: string, status: 'approved' | 'rejected') => {
    setError('');
    setMessage('');
    try {
      await approveEvent(eventId, status);
      setMessage(`Event ${status} successfully.`);
      await loadDashboard();
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Unable to update event approval.');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Monitor approvals, club activity, and campus-wide event performance.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      <div className="summary-grid">
        <SummaryCard title="Total clubs" value={clubCount} subtitle="Active campus clubs" />
        <SummaryCard title="Pending approvals" value={pendingEvents.length} subtitle="Events waiting for review" />
        <SummaryCard title="Approved events" value={analytics?.approvedEvents ?? 0} subtitle="Events accepted by the admin team" />
        <SummaryCard title="Upcoming events" value={analytics?.upcomingEvents ?? 0} subtitle="Events scheduled in the future" />
      </div>

      <div className="card">
        <div className="panel-header">
          <div>
            <h3>Campus event analytics</h3>
            <p>High-level event metrics and interest trends across the platform.</p>
          </div>
        </div>

        {analytics ? (
          <div className="report-grid">
            <SummaryCard title="Average registrations" value={analytics.averageRegistrations.toFixed(1)} subtitle="Registrations per event" />
            <SummaryCard title="Avg. attendance" value={analytics.averageAttendance.toFixed(1)} subtitle="Checked-in attendees per event" />
            <SummaryCard title="Top tags" value={topTags.map((tag) => tag.tag).slice(0, 3).join(', ') || 'None'} subtitle="Trending event topics" />
            <SummaryCard title="Total events" value={analytics.totalEvents} subtitle="All events tracked" />
          </div>
        ) : (
          <EmptyState title="No analytics available" description="There is no event analytics data to display yet." />
        )}
      </div>

      <div className="card">
        <div className="panel-header">
          <div>
            <h3>Pending event approvals</h3>
            <p>Review and moderate events before they go live to students.</p>
          </div>
        </div>

        {pendingEvents.length === 0 ? (
          <EmptyState title="No pending events" description="All submitted events have been reviewed." />
        ) : (
          <DataTable headers={['Event', 'Date', 'Status', 'Actions']}>
            {pendingEvents.map((event) => (
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
                  <span className="status-badge status-pending">Pending</span>
                </td>
                <td className="action-cell">
                  <button type="button" className="button" onClick={() => handleApproval(event._id, 'approved')}>
                    Approve
                  </button>
                  <button type="button" className="button button-danger" onClick={() => handleApproval(event._id, 'rejected')}>
                    Reject
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        )}
      </div>
    </section>
  );
};

export default AdminDashboardPage;
