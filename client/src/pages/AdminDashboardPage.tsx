import { useEffect, useState } from 'react';
import { getEvents, getEventAnalytics, approveEvent } from '../services/eventService';
import type { EventItem, AnalyticsSummary } from '../types/api';
import LoadingSpinner from '../components/LoadingSkeleton';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadDashboard = async () => {
    setError('');
    setLoading(true);
    try {
      const [analyticsData, pendingEventData] = await Promise.all([
        getEventAnalytics(),
        getEvents(1, 10, undefined, 'pending'),
      ]);

      setAnalytics(analyticsData);
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

  const heatmapColors = ['#f6f3ef', '#e5e2de', '#cdc4cb', '#7c757b', '#4b454b', '#1c1c1a'];
  const a: any = analytics;

  return (
    <main className="px-margin-desktop py-10 max-w-container-max mx-auto w-full">
      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      {/* Metric Cards (Stitch) */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="glass-card p-6 rounded-lg border-l-4 border-l-primary">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-2">Live Engagement</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-primary">{a?.liveEngagement ?? 0}</span>
              <div className="flex items-center text-xs text-on-secondary-fixed-variant">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+{a?.engagementDelta ?? 0}%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg border-l-4 border-l-secondary">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-2">Active Events</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-primary">{a?.activeEvents ?? 0}</span>
              <span className="text-xs text-on-surface-variant font-medium">/ {a?.zones ?? 0} zones</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg border-l-4 border-l-error">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-2">Pending Actions</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-error">{pendingEvents.length}</span>
              <span className="text-xs text-error/80 font-medium">{a?.urgentCount ?? 0} Urgent</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-lg border-l-4 border-l-tertiary">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.1em] mb-2">Resource Load</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-medium text-primary">{a?.resourceLoad ?? 0}%</span>
              <span className="text-xs text-on-surface-variant font-medium">Optimal</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento layout: heatmap + queue */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-8">
        <div className="lg:col-span-8 glass-card p-8 rounded-lg flex flex-col">
          <div className="flex justify-between items-center mb-8 pb-4 border-b border-outline-variant/10">
            <div>
              <h3 className="text-xl font-semibold text-on-surface">Campus Activity Profile</h3>
              <p className="text-xs text-on-surface-variant mt-1">Density heatmap across primary sectors</p>
            </div>
            <div className="flex bg-surface-container rounded-lg p-1">
              <button className="px-4 py-1.5 text-[10px] font-bold bg-white shadow-sm rounded-md">REAL-TIME</button>
              <button className="px-4 py-1.5 text-[10px] font-bold text-on-surface-variant hover:text-on-surface">HISTORY</button>
            </div>
          </div>

          <div className="flex-1 min-h-[320px] grid grid-cols-12 grid-rows-5 gap-2">
            {Array.from({ length: 60 }).map((_, i) => (
              <div
                key={i}
                className="heatmap-cell rounded-sm"
                style={{ backgroundColor: heatmapColors[i % heatmapColors.length] }}
                title={`Sector Load: ${(i % 6) * 20}%`} 
              />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase">Activity Intensity:</span>
              <div className="flex gap-1.5">
                {heatmapColors.map((c, idx) => (
                  <div key={idx} className="w-3 h-3 rounded-sm" style={{ backgroundColor: c, border: '1px solid rgba(0,0,0,0.04)' }} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary font-mono text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              LAST UPDATED: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 glass-card p-6 rounded-lg flex flex-col">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-on-surface">Queue</h3>
            <p className="text-xs text-on-surface-variant mt-1">Administrative verification required</p>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
            {pendingEvents.slice(0, 6).map((item) => (
              <div key={item._id} className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/20 hover:border-outline/50 transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <span className="px-2 py-0.5 bg-error-container text-on-error-container rounded text-[9px] font-bold uppercase tracking-wider">Urgent</span>
                  <span className="text-[10px] font-mono text-on-surface-variant">2h ago</span>
                </div>
                <h4 className="text-sm font-bold text-on-surface mb-1">{item.title}</h4>
                <p className="text-[11px] text-on-surface-variant leading-relaxed">{item.createdBy}</p>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 py-2 bg-primary text-on-primary rounded text-[11px] font-bold hover:opacity-90 transition-opacity" onClick={() => handleApproval(item._id, 'approved')}>AUTHORIZE</button>
                  <button className="px-3 py-2 border border-outline-variant rounded hover:bg-surface-variant transition-colors"> <span className="material-symbols-outlined text-[18px]">close</span></button>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 w-full py-2.5 text-[11px] font-bold text-primary border border-primary/20 rounded-lg hover:bg-primary/5 transition-colors uppercase tracking-widest">Full Queue</button>
        </div>
      </section>

      {/* User Management Table (summary) */}
      <section className="glass-card p-8 rounded-lg overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div>
            <h3 className="text-xl font-semibold text-on-surface">Administrative Directory</h3>
            <p className="text-xs text-on-surface-variant mt-1">Permission mapping and active sessions</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-outline-variant rounded-lg text-xs font-bold hover:bg-surface-container-low transition-colors">FILTER</button>
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-on-primary rounded-lg text-xs font-bold hover:opacity-95 transition-opacity">ADD USER</button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-outline-variant/30">
                <th className="py-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Administrator</th>
                <th className="py-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Access Level</th>
                <th className="py-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Status</th>
                <th className="py-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Last Auth</th>
                <th className="py-4 px-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Ops</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {/* Summary row examples - keep logic-driven population for a real table */}
              {Array.from({ length: 3 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center font-bold text-xs">{['JS','AL','DK'][idx]}</div>
                      <div>
                        <div className="text-sm font-bold text-on-surface">{['James Sterling','Amara Lawson','David Kim'][idx]}</div>
                        <div className="text-[11px] font-mono text-on-surface-variant">{['j.sterling@unisphere.edu','a.lawson@unisphere.edu','d.kim@unisphere.edu'][idx]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><span className="px-2.5 py-1 bg-primary-container text-on-primary-container rounded text-[10px] font-bold uppercase">{['Super Admin','Event Lead','Club Advisor'][idx]}</span></td>
                  <td className="py-4 px-4"><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span><span className="text-xs font-medium">Active</span></div></td>
                  <td className="py-4 px-4 text-xs font-mono text-on-surface-variant">{['2m ago','1h ago','3d ago'][idx]}</td>
                  <td className="py-4 px-4"><button className="p-2 opacity-40 group-hover:opacity-100 hover:text-primary transition-all"><span className="material-symbols-outlined text-[20px]">edit_note</span></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="flex items-center gap-2 px-8 py-3 text-[11px] font-bold text-secondary border border-outline-variant hover:bg-surface-container transition-colors rounded-lg uppercase tracking-[0.2em]">View Full Registry <span className="material-symbols-outlined text-[18px]">expand_more</span></button>
        </div>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
