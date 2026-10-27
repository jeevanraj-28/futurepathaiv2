import React, { useEffect, useState } from 'react';
import { Bookmark, BookmarkCheck, ExternalLink, MapPin, Search } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { College } from '../types';
import { Alert, Badge, Button, Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';
import { formatINR } from '../lib/utils';

const STATES = ['ALL', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];
const FEE_CAPS = [
  { value: '', label: 'Any fee' },
  { value: '100000', label: 'Up to ₹1 lakh / yr' },
  { value: '300000', label: 'Up to ₹3 lakh / yr' },
  { value: '600000', label: 'Up to ₹6 lakh / yr' },
];

export const CollegeFinderPage: React.FC = () => {
  const { user } = useAuth();
  const [colleges, setColleges] = useState<College[]>([]);
  const [search, setSearch] = useState('');
  const [state, setState] = useState('ALL');
  const [maxFee, setMaxFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      ApiService.getColleges({ search: search.trim() || undefined, state: state === 'ALL' ? undefined : state, maxFee: maxFee ? Number(maxFee) : undefined })
        .then((res) => setColleges(res.colleges || []))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search, state, maxFee]);

  const save = async (id: string) => {
    if (user?.role !== 'STUDENT') { setNotice('Log in as a student to save colleges to your shortlist.'); return; }
    try {
      const res = await ApiService.toggleSaveCollege(id);
      setSaved((s) => ({ ...s, [id]: res.saved }));
    } catch (err: any) {
      setNotice(err.message || 'Could not save right now.');
    }
  };

  return (
    <PageFrame className="flex flex-col gap-7">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="eyebrow">Discover · Colleges</p>
        <h1 className="h-display text-4xl sm:text-5xl">Find colleges</h1>
        <p className="text-lg leading-relaxed text-ink-2">Verified institutions with NIRF rank, yearly fees and how to get in.</p>
      </div>

      <div className="card grid gap-3 p-5 md:grid-cols-[1fr_200px_200px]">
        <div className="relative">
          <label htmlFor="college-search" className="sr-only">Search colleges</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input id="college-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, city or course" className="field-input pl-12" />
        </div>
        <label className="sr-only" htmlFor="college-state">State</label>
        <select id="college-state" value={state} onChange={(e) => setState(e.target.value)} className="field-input">
          {STATES.map((s) => <option key={s} value={s}>{s === 'ALL' ? 'All states' : s}</option>)}
        </select>
        <label className="sr-only" htmlFor="college-fee">Fee</label>
        <select id="college-fee" value={maxFee} onChange={(e) => setMaxFee(e.target.value)} className="field-input">
          {FEE_CAPS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
      </div>

      {notice && <Alert tone="royal">{notice}</Alert>}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-3xl" />)}</div>
      ) : error ? (
        <div className="card"><StateMessage pose="think" title="Colleges didn’t load" body="Please check your connection and refresh." /></div>
      ) : colleges.length === 0 ? (
        <div className="card"><StateMessage pose="read" title="No colleges match" body="Try another state or a higher fee limit." action={<Button variant="secondary" onClick={() => { setSearch(''); setState('ALL'); setMaxFee(''); }}>Clear filters</Button>} /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {colleges.map((c) => (
            <article key={c.id} className="card flex flex-col gap-4 p-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1.5">
                  {c.nirfRank ? <Badge tone="royal" className="self-start">NIRF #{c.nirfRank}</Badge> : null}
                  <h2 className="text-lg font-bold leading-snug">{c.name}</h2>
                  <span className="flex items-center gap-1.5 text-sm text-ink-3"><MapPin className="h-4 w-4" aria-hidden="true" />{c.city}, {c.state}</span>
                </div>
                <button
                  type="button"
                  onClick={() => save(c.id)}
                  aria-pressed={!!saved[c.id]}
                  aria-label={saved[c.id] ? `Remove ${c.name} from shortlist` : `Save ${c.name} to shortlist`}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-line hover:bg-mist"
                >
                  {saved[c.id] ? <BookmarkCheck className="h-5 w-5 text-royal-500" aria-hidden="true" /> : <Bookmark className="h-5 w-5" aria-hidden="true" />}
                </button>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-[15px]">
                <div><dt className="text-sm text-ink-3">Yearly fees</dt><dd className="font-semibold">{formatINR(c.feeMinINR)} – {formatINR(c.feeMaxINR)}</dd></div>
                <div><dt className="text-sm text-ink-3">How to get in</dt><dd className="font-semibold">{c.admissionRoute}</dd></div>
              </dl>
              {c.courses?.length > 0 && <div className="flex flex-wrap gap-2">{c.courses.slice(0, 5).map((x) => <Badge key={x}>{x}</Badge>)}</div>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm text-ink-3">
                <span>{c.accreditation} · checked {c.verifiedDate}</span>
                {c.websiteUrl && <a href={c.websiteUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1">Official site<ExternalLink className="h-3.5 w-3.5" aria-hidden="true" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  );
};
