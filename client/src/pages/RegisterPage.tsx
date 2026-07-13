import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register as registerApi } from '../services/authService';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [interests, setInterests] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerApi({
        name: { first: firstName, last: lastName },
        email,
        password,
        universityId,
        profile: {
          department,
          year: year ? Number(year) : undefined,
          interests: interests.split(',').map((value) => value.trim()).filter(Boolean),
        },
      });

      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-shell">
      <div className="card">
        <h2>Create an account</h2>
        <p>Join UniSphere to browse events, manage your registrations, and stay connected.</p>
        {error && <div className="message error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              First Name
              <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </label>
            <label>
              Last Name
              <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </label>
          </div>

          <label>
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>

          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
          </label>

          <label>
            University ID
            <input type="text" value={universityId} onChange={(e) => setUniversityId(e.target.value)} required />
          </label>

          <label>
            Department
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} required />
          </label>

          <div className="form-grid">
            <label>
              Year
              <input type="number" value={year} onChange={(e) => setYear(e.target.value)} min={1} />
            </label>
            <label>
              Interests
              <input type="text" value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="e.g. music, design" />
            </label>
          </div>

          <button type="submit" className="button" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="form-note">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
