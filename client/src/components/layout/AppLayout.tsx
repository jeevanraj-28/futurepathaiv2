import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Settings, Wallet, X } from 'lucide-react';
import { useAuth } from '../../context/auth';
import { Dhruv, Logo } from '../brand';
import { Button, Spinner } from '../ui';
import { Character } from '../Character';
import { characterForRole } from '../../lib/characters';
import { cn } from '../../lib/utils';
import { homePathForRole, isActive, navForRole } from './nav';
import { InAppContext, useInApp } from './inApp';

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'Student', PARENT: 'Parent', SCHOOL_ADMIN: 'School admin', COUNSELOR: 'Counsellor', PLATFORM_ADMIN: 'Platform admin',
};

const AccountMenu: React.FC<{ compactOnTablet?: boolean }> = ({ compactOnTablet }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);

  if (!user) return null;
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className="flex w-full items-center gap-2.5 rounded-xl p-1.5 text-left hover:bg-mist"
      >
        <Character who={characterForRole(user.role)} size={40} />
        <span className={cn('flex min-w-0 flex-col', compactOnTablet && 'hidden lg:flex')}>
          <span className="truncate text-[15px] font-semibold">{user.name}</span>
          <span className="truncate text-[13px] text-ink-3">{ROLE_LABEL[user.role] || user.role}</span>
        </span>
      </button>
      {open && (
        <div role="menu" className="animate-pop absolute bottom-full left-0 z-50 mb-2 w-60 rounded-2xl border border-line bg-white p-2 shadow-lift md:left-0">
          <p className="truncate px-3 py-2 text-sm text-ink-3">{user.email}</p>
          {user.role === 'STUDENT' && (
            <Link role="menuitem" to="/onboarding" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] hover:bg-mist">
              <Settings className="h-4 w-4" aria-hidden="true" /> Profile and settings
            </Link>
          )}
          <Link role="menuitem" to="/billing" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[15px] hover:bg-mist">
            <Wallet className="h-4 w-4" aria-hidden="true" /> Plan and billing
          </Link>
          <button
            role="menuitem"
            type="button"
            onClick={() => { logout(); navigate('/'); }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[15px] text-danger-600 hover:bg-danger-50"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </div>
      )}
    </div>
  );
};

const PlanCard: React.FC = () => {
  const { subscription } = useAuth();
  const free = !subscription || subscription.planCode === 'FREE';
  return (
    <div className="hidden flex-col gap-1.5 rounded-2xl border border-line p-4 lg:flex">
      <span className="text-[15px] font-bold">{subscription?.planName || 'Free Explorer'}</span>
      {free ? (
        <Link to="/pricing" className="link text-sm">Upgrade for the full report →</Link>
      ) : (
        <Link to="/billing" className="text-sm text-ink-3 hover:text-royal-500">Manage plan</Link>
      )}
    </div>
  );
};

/** Floating Dhruv chat entry for students; hidden on the mentor page itself. */
const MentorLauncher: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ask = (q: string) => { setOpen(false); navigate(`/mentor?q=${encodeURIComponent(q)}`); };
  return (
    <div className="fixed bottom-[88px] right-4 z-30 flex flex-col items-end gap-3 md:bottom-6 md:right-6 print:hidden">
      {open && (
        <div role="dialog" aria-label="Quick chat with Dhruv" className="animate-pop w-[340px] max-w-[calc(100vw-32px)] overflow-hidden rounded-3xl border border-line bg-white shadow-lift">
          <div className="flex items-center gap-3 bg-ink px-4 py-3 text-white">
            <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white"><Dhruv pose="wave" size={46} decorative /></span>
            <span className="flex flex-1 flex-col"><span className="font-bold">Dhruv</span><span className="text-[13px] text-night-text">Knows your report and plan</span></span>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="flex h-10 w-10 items-center justify-center rounded-lg bg-night-2">
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-col gap-2.5 p-4">
            <p className="rounded-[4px_16px_16px_16px] bg-royal-50 px-4 py-3 text-[15px] leading-relaxed">Hi! What would you like help with?</p>
            {['Which stream suits me best?', 'What should I do this week?', 'Explain my report simply'].map((q) => (
              <button key={q} type="button" onClick={() => ask(q)} className="min-h-[44px] self-end rounded-full border border-line-strong px-4 text-sm font-semibold hover:bg-mist">
                {q}
              </button>
            ))}
            <Link to="/mentor" onClick={() => setOpen(false)} className="link mt-1 text-[15px]">Open full chat →</Link>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-full bg-royal-500 py-1.5 pl-1.5 text-[15px] font-bold text-white shadow-royal md:pr-5"
      >
        <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white"><Dhruv pose="wave" size={46} decorative /></span>
        <span className="hidden md:inline">{open ? 'Hide chat' : 'Ask Dhruv'}</span>
        <span className="sr-only md:hidden">Chat with Dhruv</span>
      </button>
    </div>
  );
};

/** Page container for screens shared by the public site and the app: adds site padding only outside the app. */
export const PageFrame: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  const inApp = useInApp();
  return <div className={cn(!inApp && 'page py-10 sm:py-12', className)}>{children}</div>;
};

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { pathname } = useLocation();
  const items = navForRole(user?.role);
  const isStudent = user?.role === 'STUDENT';

  return (
    <div className="flex min-h-screen bg-mist">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>

      {/* Desktop sidebar, tablet icon rail */}
      <aside className="sticky top-0 hidden h-screen print:!hidden shrink-0 flex-col gap-7 border-r border-line bg-white px-2.5 py-6 md:flex md:w-[84px] lg:w-[256px] lg:px-4">
        <Link to={homePathForRole(user?.role)} className="flex items-center justify-center px-1 lg:justify-start" aria-label="FuturePath AI home">
          <span className="lg:hidden"><Logo variant="icon" height={44} /></span>
          <span className="hidden lg:inline"><Logo height={28} /></span>
        </Link>
        <nav aria-label="App" className="flex flex-col gap-1">
          {items.map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? 'page' : undefined}
                title={item.label}
                className={cn(
                  'flex min-h-[48px] items-center justify-center gap-3 rounded-xl px-3 text-base lg:justify-start',
                  active ? 'bg-royal-50 font-bold text-royal-600' : 'font-medium text-ink-2 hover:bg-mist hover:text-ink'
                )}
              >
                <Icon className="h-[22px] w-[22px] shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
                <span className="sr-only lg:hidden">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <PlanCard />
          <AccountMenu compactOnTablet />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Phone top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white px-4 md:hidden print:hidden">
          <Link to={homePathForRole(user?.role)} aria-label="FuturePath AI home"><Logo height={24} /></Link>
          <div className="w-14"><AccountMenu /></div>
        </header>
        <main id="main" className="flex-1 px-4 pb-28 pt-6 sm:px-6 md:px-8 md:pb-12 md:pt-8 lg:px-10">
          <div className="mx-auto w-full max-w-[1240px]">
            <InAppContext.Provider value>{children}</InAppContext.Provider>
          </div>
        </main>
      </div>

      {/* Phone tab bar */}
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-white px-2 pb-3 pt-1.5 md:hidden print:hidden" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((item) => {
          const active = isActive(item, pathname);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-current={active ? 'page' : undefined}
              className={cn('flex min-h-[52px] flex-col items-center justify-center gap-1 text-xs', active ? 'font-bold text-royal-600' : 'font-semibold text-ink-3')}
            >
              <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {isStudent && pathname !== '/mentor' && <MentorLauncher />}
    </div>
  );
};

/** Signed-in area. Sends visitors to log in and back here afterwards. */
export const AppLayout: React.FC<{ roles?: string[] }> = ({ roles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Spinner label="Loading your account" className="min-h-screen" />;
  if (!user) return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <AppShell>
        <div className="card flex flex-col items-center gap-3 p-10 text-center">
          <Dhruv pose="think" size={120} decorative />
          <h1 className="font-display text-2xl font-bold">This area isn’t part of your account</h1>
          <p className="text-ink-2">Switch to the right account, or head back to your home.</p>
          <Button to={homePathForRole(user.role)}>Go to my home</Button>
        </div>
      </AppShell>
    );
  }
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};

/** Discovery pages: inside the app for signed-in users, on the public site for visitors. */
export const AdaptiveLayout: React.FC<{ publicLayout: React.ReactNode }> = ({ publicLayout }) => {
  const { user, loading } = useAuth();
  if (loading) return <Spinner className="min-h-screen" />;
  if (!user) return <>{publicLayout}</>;
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
};
