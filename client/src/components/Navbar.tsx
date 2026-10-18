import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  Sparkles,
  User,
  LogOut,
  Menu,
  X,
  CreditCard,
  ChevronDown,
  GraduationCap,
  Building,
  Users,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Navbar: React.FC<{ onOpenCheckout?: (planCode: string) => void }> = ({ onOpenCheckout }) => {
  const { user, subscription, logout, demoLogin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleDemoSwitch = async (role: string) => {
    setDemoDropdownOpen(false);
    await demoLogin(role);
    if (role === 'STUDENT') navigate('/dashboard');
    else if (role === 'PARENT') navigate('/parent-portal');
    else if (role === 'SCHOOL_ADMIN') navigate('/school-portal');
    else if (role === 'COUNSELOR') navigate('/counselor-portal');
    else if (role === 'PLATFORM_ADMIN') navigate('/admin');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'STUDENT': return '/dashboard';
      case 'PARENT': return '/parent-portal';
      case 'SCHOOL_ADMIN': return '/school-portal';
      case 'COUNSELOR': return '/counselor-portal';
      case 'PLATFORM_ADMIN': return '/admin';
      default: return '/dashboard';
    }
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-brand-600 via-blue-500 to-cyan-400 p-0.5 shadow-lg glow-blue transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  FUTUREPATH
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-500/20 text-cyan-400 border border-brand-500/30 rounded">
                  AI
                </span>
              </div>
              <p className="text-[10px] tracking-wide text-slate-400 font-medium hidden sm:block">
                Evidence-Informed Career Intelligence • Classes 10 & 12
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/careers"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/careers' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Careers (50+)
            </Link>
            <Link
              to="/stream-guide"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/stream-guide' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Class 10 Streams
            </Link>
            <Link
              to="/assessment"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname.startsWith('/assessment') ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              16-D Assessment
            </Link>
            <Link
              to="/colleges"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/colleges' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Colleges & Exams
            </Link>
            <Link
              to="/scholarships"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/scholarships' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Scholarships
            </Link>
            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/pricing' ? 'text-cyan-400 bg-slate-800/60' : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              Pricing
            </Link>
          </div>

          {/* Action Buttons & Switchers */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Quick Demo Login Switcher */}
            <div className="relative">
              <button
                onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {demoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                    Switch Test Persona (1-Click)
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('STUDENT')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-600/20 hover:text-cyan-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      Student (Aarav - Class 10)
                    </span>
                    {user?.role === 'STUDENT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('PARENT')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-600/20 hover:text-cyan-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      Parent (Sunita Sharma)
                    </span>
                    {user?.role === 'PARENT' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('SCHOOL_ADMIN')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-600/20 hover:text-cyan-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-400" />
                      School Admin (DPS Pune)
                    </span>
                    {user?.role === 'SCHOOL_ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('COUNSELOR')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-600/20 hover:text-cyan-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-400" />
                      Counselor (Ananya Deshmukh)
                    </span>
                    {user?.role === 'COUNSELOR' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('PLATFORM_ADMIN')}
                    className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-brand-600/20 hover:text-cyan-300 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-rose-400" />
                      Platform Admin
                    </span>
                    {user?.role === 'PLATFORM_ADMIN' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3">
                {/* Active Plan Pill */}
                {subscription?.planCode === 'FREE' ? (
                  <button
                    onClick={() => onOpenCheckout ? onOpenCheckout('PREMIUM_STUDENT') : navigate('/pricing')}
                    className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 hover:brightness-110 transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Upgrade (₹999/yr)</span>
                  </button>
                ) : (
                  <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {subscription?.planName || 'Premium'}
                  </span>
                )}

                {/* Dashboard Button */}
                <Link
                  to={getDashboardLink()}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Workspace</span>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-sm overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name.charAt(0)
                      )}
                    </div>
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl p-2 z-50">
                      <div className="px-3 py-2 border-b border-slate-800">
                        <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold bg-slate-800 text-cyan-300 rounded border border-slate-700">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg mt-1"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/billing"
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-3 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800 rounded-lg"
                      >
                        Billing & Receipts
                      </Link>
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-medium text-rose-400 hover:bg-rose-500/10 rounded-lg flex items-center gap-2 mt-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white rounded-lg transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-blue-500 hover:from-brand-500 hover:to-blue-400 rounded-lg shadow-md glow-blue transition-all"
                >
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <Link
            to="/careers"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Careers Catalog (50+)
          </Link>
          <Link
            to="/stream-guide"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Class 10 Stream Selection
          </Link>
          <Link
            to="/assessment"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            16-Dimension Assessment
          </Link>
          <Link
            to="/colleges"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Colleges & Entrance Exams
          </Link>
          <Link
            to="/scholarships"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Scholarship Tracker
          </Link>
          <Link
            to="/pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Pricing & Plans
          </Link>
          
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white"
                >
                  Go to {user.role} Dashboard
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-center py-2 text-xs font-medium text-rose-400"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-slate-200 bg-slate-800 rounded-lg"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
