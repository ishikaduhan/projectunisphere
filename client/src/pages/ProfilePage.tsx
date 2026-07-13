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
    <section className="page-section">
      <div className="page-header">
        <div>
          <h2>Profile</h2>
          <p>Manage your student profile, notification settings, and university details.</p>
        </div>
      </div>

      {error && <div className="message error">{error}</div>}
      {message && <div className="message success">{message}</div>}

      <div className="card">
        <h3>Account</h3>
        <p>
          {profile.name.first} {profile.name.last}
        </p>
        <p>{profile.email}</p>
      </div>

      <form className="card form-card" onSubmit={handleSave}>
        <label>
          Department
          <input value={department} onChange={(e) => setDepartment(e.target.value)} required />
        </label>
        <label>
          Year
          <input type="number" min={1} value={year} onChange={(e) => setYear(e.target.value)} />
        </label>
        <label>
          Interests
          <input value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. music, design" />
        </label>
        <label>
          Timezone
          <input value={timezone} onChange={(e) => setTimezone(e.target.value)} required />
        </label>

        <div className="checkbox-row">
          <label>
            <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
            Email notifications
          </label>
          <label>
            <input type="checkbox" checked={notifyPush} onChange={(e) => setNotifyPush(e.target.checked)} />
            Push notifications
          </label>
        </div>

        <button type="submit" className="button" disabled={saving}>
          {saving ? 'Saving…' : 'Save profile'}
        </button>
      </form>
    </section>
  );
};

export default ProfilePage;
