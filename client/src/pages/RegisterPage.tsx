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
    <main className="flex min-h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Reuse the right-side form panel from the Stitch design for a consistent experience */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-surface flex items-center justify-center p-8 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-full max-w-md z-10">
          <div className="mb-10">
            <div className="md:hidden flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
              <span className="font-headline-sm text-primary">UniSphere</span>
            </div>
            <h2 className="font-headline-md text-on-surface mb-2">Request Access</h2>
            <p className="text-on-surface-variant font-body-md">
  Create your UniSphere account to get started.
</p>
          </div>

          <div className="glass-panel p-8 rounded-lg shadow-sm border border-outline/10">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">
          First Name
  </label>
                  <input
                    className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                    placeholder="Jane"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Last Name</label>
                  <input
                    className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                    placeholder="Doe"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Identification Number</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                  placeholder="ST-2024-001"
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Email Address</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                  placeholder="example@gmail.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Secure Password</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                  placeholder="••••••••"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Department</label>
                  <input
                    className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                    placeholder="Computer Science"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Year</label>
                  <input
                    className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                    placeholder="2"
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Interests</label>
                <input
                  className="w-full px-4 py-3 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none font-body-md"
                  placeholder="e.g. music, design"
                  type="text"
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              {error && <div className="text-sm text-error">{error}</div>}

              <button
                className="w-full py-4 bg-tertiary text-on-tertiary font-label-md rounded shadow-md hover:bg-tertiary/90 transition-all mt-4 uppercase tracking-widest"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Registering…' : 'Register Account'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link to="/login" className="text-on-surface-variant font-label-md hover:text-tertiary transition-colors flex items-center justify-center gap-2 mx-auto text-xs">
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                RETURN TO SIGN IN
              </Link>
            </div>
          </div>

          <div className="mt-12 flex justify-center gap-8 border-t border-outline/5 pt-8">
            <a className="font-label-md text-on-surface-variant hover:text-tertiary transition-colors text-[10px] uppercase" href="#">Concierge</a>
            <a className="font-label-md text-on-surface-variant hover:text-tertiary transition-colors text-[10px] uppercase" href="#">Directory</a>
            <a className="font-label-md text-on-surface-variant hover:text-tertiary transition-colors text-[10px] uppercase" href="#">Privacy</a>
          </div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
