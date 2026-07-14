import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { fetchProfile, updateProfile } from '../services/authService';
import LoadingSpinner from '../components/LoadingSpinner';
import type { UserProfile } from '../types/api';

const ProfilePage = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [interests, setInterests] = useState('');
  const [notifyEmail, setNotifyEmail] = useState(true);
  const [notifyPush, setNotifyPush] = useState(true);
  const [timezone, setTimezone] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setError('');
      setLoading(true);
      try {
        const user = await fetchProfile();
        setProfile(user);
        setDepartment(user.profile.department || '');
        setYear(user.profile.year?.toString() || '');
        setInterests(user.profile.interests.join(', '));
        setNotifyEmail(user.settings.notifyEmail);
        setNotifyPush(user.settings.notifyPush);
        setTimezone(user.settings.timezone);
      } catch (err: any) {
        setError('Unable to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);

    try {
      await updateProfile({
        profile: {
          department,
          year: year ? Number(year) : undefined,
          interests: interests.split(',').map((value) => value.trim()).filter(Boolean),
        },
        settings: {
          notifyEmail,
          notifyPush,
          timezone,
        },
      });
      setMessage('Profile updated successfully.');
    } catch (err: any) {
      setError('Unable to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!profile) {
    return (
      <div className="page-section">
        <div className="message error">Unable to load profile.</div>
      </div>
    );
  }

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      {error && <div className="message error mb-6">{error}</div>}
      {message && <div className="message success mb-6">{message}</div>}

      <div className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-6 shadow-sm mb-6 flex flex-col lg:flex-row items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-surface-dim flex items-center justify-center text-headline-md text-primary">
          {profile.name.first?.charAt(0)}
        </div>
        <div>
          <h2 className="font-headline-md text-[28px] text-on-background mb-1">{profile.name.first} {profile.name.last}</h2>
          <p className="text-body-md text-on-surface-variant">{profile.email}</p>
          <p className="text-body-md text-on-surface-variant mt-2">{profile.profile.department} • Year {profile.profile.year ?? '—'}</p>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-gutter" onSubmit={handleSave}>
        <div className="lg:col-span-2 glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-8 shadow-sm">
          <h3 className="font-headline-sm text-[24px] mb-6">University details</h3>
          <div className="space-y-5">
            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-[0.18em]">Department</span>
              <input
                className="w-full rounded-xl border border-outline px-4 py-3 bg-surface-container text-on-surface text-body-md focus:border-primary focus:ring-primary/20 focus:outline-none"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                required
              />
            </label>

            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-[0.18em]">Year</span>
              <input
                className="w-full rounded-xl border border-outline px-4 py-3 bg-surface-container text-on-surface text-body-md focus:border-primary focus:ring-primary/20 focus:outline-none"
                type="number"
                min={1}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-[0.18em]">Interests</span>
              <input
                className="w-full rounded-xl border border-outline px-4 py-3 bg-surface-container text-on-surface text-body-md focus:border-primary focus:ring-primary/20 focus:outline-none"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. music, design"
              />
            </label>

            <label className="block">
              <span className="text-label-md text-on-surface-variant mb-2 block uppercase tracking-[0.18em]">Timezone</span>
              <input
                className="w-full rounded-xl border border-outline px-4 py-3 bg-surface-container text-on-surface text-body-md focus:border-primary focus:ring-primary/20 focus:outline-none"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-8 rounded-full bg-tertiary text-on-tertiary px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] hover:bg-tertiary/90 transition-colors"
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save profile'}
          </button>
        </div>

        <aside className="glass-card rounded-[1.5rem] border border-outline-variant bg-surface p-8 shadow-sm">
          <h3 className="font-headline-sm text-[22px] mb-5">Notification preferences</h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4">
              <span className="text-body-md text-on-surface">Email notifications</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-primary"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
              />
            </label>
            <label className="flex items-center justify-between gap-4 rounded-xl bg-surface-container p-4">
              <span className="text-body-md text-on-surface">Push notifications</span>
              <input
                type="checkbox"
                className="h-5 w-5 accent-primary"
                checked={notifyPush}
                onChange={(e) => setNotifyPush(e.target.checked)}
              />
            </label>
          </div>
        </aside>
      </form>
    </main>
  );
};

export default ProfilePage;
