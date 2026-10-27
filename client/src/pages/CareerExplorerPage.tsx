import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { ApiService } from '../services/api';
import type { Career } from '../types';
import { Badge, Button, Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';
import { cn, demandLabel, formatLPA } from '../lib/utils';

const STREAMS = [
  { id: 'ALL', label: 'All streams' },
  { id: 'PCM', label: 'Science (PCM)' },
  { id: 'PCB', label: 'Science (PCB)' },
  { id: 'PCMB', label: 'Science (PCMB)' },
  { id: 'COMMERCE', label: 'Commerce' },
  { id: 'HUMANITIES', label: 'Humanities' },
  { id: 'ANY', label: 'Any stream' },
];
const CATEGORIES = ['ALL', 'Computing/AI', 'Engineering', 'Medical', 'Healthcare', 'Commerce', 'Law', 'Design', 'Humanities', 'Aviation', 'Defence', 'Applied Science'];

export const CareerExplorerPage: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get('search') || '');
  const [stream, setStream] = useState(params.get('stream') || 'ALL');
  const [category, setCategory] = useState(params.get('category') || 'ALL');
  const [highDemand, setHighDemand] = useState(params.get('demand') === 'VERY_HIGH');
  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    // debounce typing so a slow connection isn’t flooded with requests
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      const next: Record<string, string> = {};
      if (search.trim()) next.search = search.trim();
      if (stream !== 'ALL') next.stream = stream;
      if (category !== 'ALL') next.category = category;
      if (highDemand) next.demand = 'VERY_HIGH';
      setParams(next, { replace: true });
      ApiService.getCareers({
        search: next.search,
        stream: next.stream,
        category: next.category,
        demand: next.demand,
      })
        .then((res) => setCareers(res.success ? res.careers : []))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search, stream, category, highDemand, setParams, attempt]);

  const reset = () => { setSearch(''); setStream('ALL'); setCategory('ALL'); setHighDemand(false); };

  return (
    <PageFrame className="flex flex-col gap-7">
      <div className="flex flex-col gap-3">
        <p className="eyebrow">Discover · Careers</p>
        <h1 className="h-display text-4xl sm:text-5xl">Explore careers</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-ink-2">Real responsibilities, salary ranges, entrance exams and colleges for 50+ careers in India — with the source for every number.</p>
      </div>

      <div className="card flex flex-col gap-4 p-5">
        <div className="relative">
          <label htmlFor="career-search" className="sr-only">Search careers</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input id="career-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by career, subject or skill" className="field-input pl-12" />
        </div>
        <div className="flex flex-col gap-3">
          <div role="group" aria-label="Stream" className="flex gap-2 overflow-x-auto pb-1">
            {STREAMS.map((s) => (
              <button
                key={s.id}
                type="button"
                aria-pressed={stream === s.id}
                onClick={() => setStream(s.id)}
                className={cn('min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold', stream === s.id ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink-2 hover:border-royal-300')}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-ink-3" aria-hidden="true" />
            <label htmlFor="career-category" className="sr-only">Category</label>
            <select id="career-category" value={category} onChange={(e) => setCategory(e.target.value)} className="min-h-[40px] rounded-lg border border-line-strong bg-white px-3 text-sm font-semibold">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All categories' : c}</option>)}
            </select>
            <label className="flex min-h-[40px] cursor-pointer items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={highDemand} onChange={(e) => setHighDemand(e.target.checked)} className="h-5 w-5 accent-royal-500" />
              Very high demand only
            </label>
            {!loading && <span className="ml-auto text-sm text-ink-3" aria-live="polite">{careers.length} careers</span>}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-56 rounded-2xl" />)}</div>
      ) : error ? (
        <div className="card"><StateMessage pose="think" title="Careers didn’t load" body="Please check your connection and try again." action={<Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>} /></div>
      ) : careers.length === 0 ? (
        <div className="card"><StateMessage pose="read" title="No careers match those filters" body="Try a different word or clear the filters." action={<Button variant="secondary" onClick={reset}>Clear filters</Button>} /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {careers.map((c) => (
            <Link key={c.id} to={`/careers/${c.slug}`} className="card group flex flex-col gap-3 p-6 hover:border-royal-300">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-saffron-700">{c.category}</span>
                {c.futureDemand === 'VERY_HIGH' && <Badge tone="leaf" className="text-xs">Very high demand</Badge>}
              </div>
              <h2 className="text-lg font-bold leading-snug group-hover:text-royal-500">{c.title}</h2>
              <p className="line-clamp-3 text-[15px] leading-relaxed text-ink-2">{c.shortDescription}</p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3 text-sm">
                <span className="font-bold">{formatLPA(c.salaryMinINR, c.salaryMaxINR)}</span>
                <span className="text-ink-3">Stream: {c.stream} · Demand: {demandLabel(c.futureDemand)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </PageFrame>
  );
};
