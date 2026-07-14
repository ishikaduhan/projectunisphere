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
        setDepartment(user.profile.department);
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
    return <div className="page-section"><div className="message error">Unable to load profile.</div></div>;
  }

  return (
    <main className="max-w-container-max mx-auto px-6 lg:px-margin-desktop py-8">
      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      <div className="bg-surface p-6 rounded-xl border border-outline-variant mb-6 flex items-center gap-6">
        <div className="w-24 h-24 rounded-full bg-surface-dim flex items-center justify-center text-headline-md">{profile.name.first?.charAt(0)}</div>
        <div>
          <h2 className="text-headline-md mb-1">{profile.name.first} {profile.name.last}</h2>
          <p className="text-on-surface-variant">{profile.email}</p>
          <p className="text-on-surface-variant">{profile.profile.department} • Year {profile.profile.year ?? '—'}</p>
        </div>
      </div>

      <form className="grid grid-cols-1 lg:grid-cols-3 gap-6" onSubmit={handleSave}>
        <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="mb-4">University details</h3>
          <div className="space-y-4">
            <label className="block">
              <div className="text-label-md text-on-surface-variant mb-2">Department</div>
              <input className="w-full px-4 py-3 border rounded" value={department} onChange={(e) => setDepartment(e.target.value)} required />
            </label>

            <label className="block">
              <div className="text-label-md text-on-surface-variant mb-2">Year</div>
              <input className="w-full px-4 py-3 border rounded" type="number" min={1} value={year} onChange={(e) => setYear(e.target.value)} />
            </label>

            <label className="block">
              <div className="text-label-md text-on-surface-variant mb-2">Interests</div>
              <input className="w-full px-4 py-3 border rounded" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. music, design" />
            </label>

            <label className="block">
              <div className="text-label-md text-on-surface-variant mb-2">Timezone</div>
              <input className="w-full px-4 py-3 border rounded" value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
            </label>
          </div>

          <div className="mt-6">
            <button type="submit" className="px-6 py-3 bg-tertiary text-on-tertiary rounded font-semibold" disabled={saving}>{saving ? 'Saving…' : 'Save profile'}</button>
          </div>
        </div>

        <aside className="bg-surface p-6 rounded-xl border border-outline-variant">
          <h3 className="mb-4">Notifications</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span>Email notifications</span>
              <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            </label>
            <label className="flex items-center justify-between">
              <span>Push notifications</span>
              <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
            </label>
          </div>
        </aside>
      </form>
    </main>
  );
};

export default ProfilePage;
