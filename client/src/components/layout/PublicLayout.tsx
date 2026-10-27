import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from '../brand';
import { Button } from '../ui';
import { Character, characterForRole } from '../Character';
import { cn } from '../../lib/utils';
import { homePathForRole } from './nav';

const LINKS = [
  { to: '/careers', label: 'Explore careers' },
  { to: '/stream-guide', label: 'Stream guide' },
  { to: '/colleges', label: 'Colleges & exams' },
  { to: '/for-parents', label: 'For parents' },
  { to: '/for-schools', label: 'For schools' },
  { to: '/pricing', label: 'Pricing' },
];

export const PublicHeader: React.FC = () => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="page flex h-[72px] items-center gap-6">
        <Link to="/" aria-label="FuturePath AI home" className="shrink-0">
          <Logo height={30} />
        </Link>
        <nav aria-label="Main" className="hidden flex-1 items-center gap-1 whitespace-nowrap xl:flex">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn('rounded-lg px-3 py-2.5 text-[15px] font-medium', isActive ? 'bg-royal-50 text-royal-600' : 'text-ink-2 hover:text-ink')
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <Link to={homePathForRole(user.role)} className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-3 hover:bg-mist">
              <Character who={characterForRole(user.role)} size={36} animate={false} />
              <span className="hidden text-[15px] font-semibold sm:inline">My home</span>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden px-3 py-2.5 text-[15px] font-semibold text-ink sm:inline">Log in</Link>
              <Button to="/start" size="sm" className="sm:min-h-[44px] sm:px-5 sm:text-[15px]">Start free test</Button>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-line xl:hidden"
          >
            {open ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Main" className="border-t border-line bg-white xl:hidden">
          <div className="page flex flex-col py-3">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className="rounded-lg px-3 py-3 text-base font-medium text-ink hover:bg-mist">
                {l.label}
              </NavLink>
            ))}
            {!user && <Link to="/login" className="rounded-lg px-3 py-3 text-base font-semibold text-royal-500">Log in</Link>}
          </div>
        </nav>
      )}
    </header>
  );
};

export const PublicFooter: React.FC = () => (
  <footer className="border-t border-line bg-mist">
    <div className="page flex flex-col gap-10 py-14">
      <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <Logo variant="lockup" height={26} />
          <p className="max-w-xs text-sm leading-relaxed text-ink-3">Career guidance for students in India, made with counsellors and families.</p>
        </div>
        <FooterCol title="Explore" links={[['/careers', 'Careers'], ['/stream-guide', 'Stream guide'], ['/colleges', 'Colleges'], ['/exams', 'Entrance exams'], ['/scholarships', 'Scholarships']]} />
        <FooterCol title="For" links={[['/start', 'Students'], ['/for-parents', 'Parents'], ['/for-schools', 'Schools'], ['/for-counselors', 'Counsellors']]} />
        <FooterCol title="Company" links={[['/about', 'About'], ['/how-it-works', 'How it works'], ['/contact', 'Contact'], ['/privacy-policy', 'Privacy'], ['/terms', 'Terms'], ['/refund-policy', 'Refunds']]} />
      </div>
      <div className="flex flex-wrap justify-between gap-3 border-t border-line pt-6 text-sm text-ink-3">
        <span>© {new Date().getFullYear()} FuturePath AI. Recommendations are possibilities to explore, not admission or job guarantees.</span>
        <span>DPDP Act 2023 compliant · We never sell student data</span>
      </div>
    </div>
  </footer>
);

const FooterCol: React.FC<{ title: string; links: Array<[string, string]> }> = ({ title, links }) => (
  <div className="flex flex-col gap-2.5 text-[15px]">
    <span className="font-bold">{title}</span>
    {links.map(([to, label]) => (
      <Link key={to} to={to} className="text-ink-2 hover:text-royal-500">{label}</Link>
    ))}
  </div>
);

export const PublicLayout: React.FC = () => (
  <div className="flex min-h-screen flex-col">
    <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">Skip to content</a>
    <PublicHeader />
    <main id="main" className="flex-1">
      <Outlet />
    </main>
    <PublicFooter />
  </div>
);
