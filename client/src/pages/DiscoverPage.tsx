import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Building2, ClipboardList, GraduationCap, Layers, Search, Users } from 'lucide-react';
import { Button } from '../components/ui';
import { Dhruv } from '../components/brand';
import { PageFrame } from '../components/layout/AppLayout';

const AREAS = [
  { to: '/careers', icon: Briefcase, title: 'Careers', body: '50+ careers with real responsibilities, salaries and entrance routes.' },
  { to: '/stream-guide', icon: Layers, title: 'Stream guide', body: 'PCM, PCB, PCMB, Commerce and Humanities compared side by side.' },
  { to: '/colleges', icon: Building2, title: 'Colleges', body: 'NIRF-ranked institutions with fees and admission routes.' },
  { to: '/exams', icon: ClipboardList, title: 'Entrance exams', body: 'JEE, NEET, CLAT, CUET, UCEED, NDA — eligibility and official portals.' },
  { to: '/scholarships', icon: GraduationCap, title: 'Scholarships', body: 'Central and state schemes with eligibility and income limits.' },
  { to: '/counselors', icon: Users, title: 'Counsellors', body: 'Verified experts for one-on-one family sessions.' },
];

export const DiscoverPage: React.FC = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  return (
    <PageFrame className="flex flex-col gap-8">
      <section className="flex flex-wrap items-center gap-8 rounded-4xl bg-mist p-7 sm:p-10">
        <div className="flex flex-1 basis-[360px] flex-col gap-4">
          <h1 className="h-display text-4xl sm:text-5xl">Discover</h1>
          <p className="max-w-xl text-lg leading-relaxed text-ink-2">Everything you need to research your next step — careers, streams, colleges, exams and funding.</p>
          <form
            role="search"
            onSubmit={(e) => { e.preventDefault(); navigate(`/careers${q.trim() ? `?search=${encodeURIComponent(q.trim())}` : ''}`); }}
            className="flex max-w-xl gap-2"
          >
            <label htmlFor="discover-search" className="sr-only">Search careers</label>
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
              <input id="discover-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search careers: pilot, CA, doctor…" className="field-input bg-white pl-11" />
            </div>
            <Button type="submit">Search</Button>
          </form>
        </div>
        <Dhruv pose="read" size={150} className="hidden sm:block" decorative />
      </section>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {AREAS.map(({ to, icon: Icon, title, body }) => (
          <Link key={to} to={to} className="card group flex flex-col gap-3 p-6 hover:border-royal-300">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-royal-50 text-royal-500"><Icon className="h-6 w-6" aria-hidden="true" /></span>
            <span className="text-xl font-bold group-hover:text-royal-500">{title}</span>
            <span className="leading-relaxed text-ink-2">{body}</span>
          </Link>
        ))}
      </div>
    </PageFrame>
  );
};
