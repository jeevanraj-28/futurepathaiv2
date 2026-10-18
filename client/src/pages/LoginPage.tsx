import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  Lock,
  Mail,
  GraduationCap,
  Users,
  Building,
  User,
  ShieldCheck,
  Loader2,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login({ email, password });
      navigate(redirect);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: string) => {
    setLoading(true);
    setError(null);
    try {
      await demoLogin(role);
      if (role === 'STUDENT') navigate('/dashboard');
      else if (role === 'PARENT') navigate('/parent-portal');
      else if (role === 'SCHOOL_ADMIN') navigate('/school-portal');
      else if (role === 'COUNSELOR') navigate('/counselor-portal');
      else if (role === 'PLATFORM_ADMIN') navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
          </Link>
          <h2 className="text-2xl font-black text-white tracking-tight">Sign in to FuturePath AI</h2>
          <p className="text-xs text-slate-400">Access your student workspace, roadmaps, and reports</p>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Instant Persona Login Section */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
          <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block text-center">
            ⚡ Quick 1-Click Test Persona Login
          </span>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleDemo('STUDENT')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-cyan-300 font-semibold flex items-center gap-1.5 justify-center border border-slate-700 transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student (Aarav)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('PARENT')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-amber-300 font-semibold flex items-center gap-1.5 justify-center border border-slate-700 transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Parent (Sunita)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('SCHOOL_ADMIN')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-indigo-300 font-semibold flex items-center gap-1.5 justify-center border border-slate-700 transition-colors"
            >
              <Building className="w-3.5 h-3.5" />
              <span>School Admin</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('COUNSELOR')}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-750 text-emerald-300 font-semibold flex items-center gap-1.5 justify-center border border-slate-700 transition-colors"
            >
              <User className="w-3.5 h-3.5" />
              <span>Counselor</span>
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleDemo('PLATFORM_ADMIN')}
            className="w-full py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[11px] font-semibold text-rose-300 border border-slate-750 flex items-center gap-1.5 justify-center transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Platform Admin Console</span>
          </button>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="text-slate-300 font-semibold block mb-1">Email Address:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@futurepath.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1">Password:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>Sign In</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:underline">
            Register here
          </Link>
        </p>

      </div>
    </div>
  );
};
