import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty'>('student');
  const [remember, setRemember] = useState(false);
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
      // pass role/remember through if backend expects them in the future
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen overflow-hidden bg-background text-on-background font-body-md">
      {/* Image Section (Visible on MD+) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-primary">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAwWl_8n3AVVa6VB_vToJrVpRsJxQGou-gpQ41c4eGnn-PyErb0It7RWxdLHD7Qwo9hEJk4sPGVSwfkxf8cn5iNc5_IlupIsQdXnUwV5ScY_bMnt8toN43hrDVUNn7gPCGTJCcXTPZ8eP7pzWWlPAe0TtzohR_ZDf8IBTVRmVtV2p2K6UmScMc9JZGvskVCp7wrwJtXcHIA6PotCoNt9K2owmCmmLCStdN_YGJNlKTXWELqGX1c2lZ3P40142x3XleOT4RXEAfx4s4')",
          }}
        />
        <div className="absolute inset-0 z-10 bg-tertiary/40 mix-blend-multiply" />
        <div className="absolute inset-0 z-20 bg-gradient-to-t from-tertiary via-transparent to-transparent opacity-80" />
        <div className="absolute inset-0 z-30 flex flex-col justify-between p-16">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-surface/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <span className="material-symbols-outlined text-white text-3xl">school</span>
            </div>
            <span className="font-headline-md text-white font-semibold tracking-tight">UniSphere</span>
          </div>
          <div className="max-w-xl animate-float">
            <h1 className="font-display-lg text-display-lg text-white mb-6">Redefining academic precision.</h1>
            <p className="font-body-lg text-white/80 leading-relaxed max-w-lg">
              Step into a refined digital ecosystem where scholarly pursuits meet sophisticated technology. Manage your academic excellence with unparalleled clarity.
            </p>
          </div>
          <div className="flex gap-12">
            <div className="flex flex-col">
              <span className="font-headline-sm text-white">12k+</span>
              <span className="font-label-md text-white/60 uppercase">Students</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-white">450+</span>
              <span className="font-label-md text-white/60 uppercase">Institutions</span>
            </div>
            <div className="flex flex-col">
              <span className="font-headline-sm text-white">99%</span>
              <span className="font-label-md text-white/60 uppercase">Retention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="w-full md:w-1/2 lg:w-2/5 bg-surface flex items-center justify-center p-8 md:p-12 lg:p-24 relative overflow-y-auto">
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary-fixed/30 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="w-full max-w-md z-10">
          <div className="mb-10">
            <div className="md:hidden flex items-center gap-3 mb-8">
              <span className="material-symbols-outlined text-primary text-3xl">school</span>
              <span className="font-headline-sm text-primary">UniSphere</span>
            </div>
            <h2 className="font-headline-md text-on-surface mb-2">Welcome back</h2>
            <p className="text-on-surface-variant font-body-md">Sign in to your institutional portal.</p>
          </div>

          {/* Role Selection Toggle */}
          <div className="flex p-1 bg-surface-container rounded-lg mb-8 relative">
            <div
              className="absolute top-1 left-1 bottom-1 w-[calc(50%-4px)] bg-surface-container-lowest rounded shadow-sm transition-all duration-300 ease-in-out"
              style={{ left: role === 'student' ? '4px' : 'calc(50% - 0px)' }}
            />
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`relative z-10 flex-1 py-3 text-center font-label-md transition-colors duration-200 ${
                role === 'student' ? 'text-tertiary font-bold' : ''
              }`}
            >
              STUDENT
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`relative z-10 flex-1 py-3 text-center font-label-md transition-colors duration-200 ${
                role === 'faculty' ? 'text-tertiary font-bold' : 'text-on-surface-variant'
              }`}
            >
              FACULTY
            </button>
          </div>

          <div className="glass-panel p-8 rounded-lg shadow-sm border border-outline/10" id="authContainer">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block font-label-md text-on-surface-variant mb-2 uppercase text-[10px]">Institutional Email</label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-tertiary transition-colors">alternate_email</span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all font-body-md"
                    placeholder="jane.doe@university.edu"
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-md text-on-surface-variant uppercase text-[10px]">Password</label>
                  <Link to="#" className="font-label-md text-tertiary hover:underline transition-all">Forgot?</Link>
                </div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-tertiary transition-colors">lock</span>
                  <input
                    className="w-full pl-12 pr-4 py-3.5 bg-white border border-outline/20 rounded focus:ring-1 focus:ring-tertiary/20 focus:border-tertiary outline-none transition-all font-body-md"
                    placeholder="••••••••"
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  className="w-4 h-4 rounded border-outline text-tertiary focus:ring-tertiary"
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="font-body-md text-on-surface-variant cursor-pointer text-sm" htmlFor="remember">Maintain session for 30 days</label>
              </div>

              {error && <div className="text-sm text-error">{error}</div>}

              <button
                className="w-full py-4 bg-tertiary text-on-tertiary font-label-md rounded shadow-md hover:bg-tertiary/90 transition-all duration-200 uppercase tracking-widest"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-outline/10 text-center">
              <p className="font-body-md text-on-surface-variant text-sm">
                New to UniSphere?
                <Link to="/register" className="text-tertiary font-semibold hover:underline ml-1">Request Access</Link>
              </p>
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

export default LoginPage;
