import React, { useEffect, useState } from 'react';
import { ExternalLink, Search } from 'lucide-react';
import { ApiService } from '../services/api';
import type { EntranceExam } from '../types';
import { Badge, Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';
import { cn } from '../lib/utils';

const STREAMS = ['ALL', 'PCM', 'PCB', 'COMMERCE', 'HUMANITIES', 'ANY'];
const STREAM_LABEL: Record<string, string> = {
  ALL: 'All streams', PCM: 'PCM', PCB: 'PCB', COMMERCE: 'Commerce', HUMANITIES: 'Humanities', ANY: 'Any stream',
};

export const ExamGuidePage: React.FC = () => {
  const [exams, setExams] = useState<EntranceExam[]>([]);
  const [search, setSearch] = useState('');
  const [stream, setStream] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      ApiService.getEntranceExams({ search: search.trim() || undefined, stream: stream === 'ALL' ? undefined : stream })
        .then((res) => setExams(res.exams || []))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search, stream]);

  return (
    <PageFrame className="flex flex-col gap-7">
      <div className="flex max-w-2xl flex-col gap-3">
        <p className="eyebrow">Discover · Entrance exams</p>
        <h1 className="h-display text-4xl sm:text-5xl">Entrance exam guide</h1>
        <p className="text-lg leading-relaxed text-ink-2">Who conducts each exam, who can take it, how it’s held and where to apply. Always confirm dates on the official portal.</p>
      </div>

      <div className="card flex flex-col gap-3 p-5">
        <div className="relative">
          <label htmlFor="exam-search" className="sr-only">Search exams</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <input id="exam-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="JEE, NEET, CLAT, CUET…" className="field-input pl-12" />
        </div>
        <div role="group" aria-label="Stream" className="flex gap-2 overflow-x-auto">
          {STREAMS.map((s) => (
            <button key={s} type="button" aria-pressed={stream === s} onClick={() => setStream(s)} className={cn('min-h-[40px] shrink-0 rounded-full px-4 text-sm font-semibold', stream === s ? 'bg-ink text-white' : 'border border-line-strong bg-white text-ink-2')}>
              {STREAM_LABEL[s]}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-60 rounded-3xl" />)}</div>
      ) : error ? (
        <div className="card"><StateMessage pose="think" title="Exams didn’t load" body="Please check your connection and refresh." /></div>
      ) : exams.length === 0 ? (
        <div className="card"><StateMessage pose="read" title="No exams match" body="Try a different name or stream." /></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {exams.map((e) => (
            <article key={e.id} className="card flex flex-col gap-4 p-6">
              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-2xl font-bold">{e.name}</h2>
                  {e.targetStreams.map((s) => <Badge key={s} tone="royal">{s}</Badge>)}
                </div>
                <p className="text-[15px] text-ink-2">{e.fullName}</p>
              </div>
              <dl className="grid gap-3 text-[15px] sm:grid-cols-2">
                <div><dt className="text-sm text-ink-3">Conducted by</dt><dd className="font-semibold">{e.conductingAuthority}</dd></div>
                <div><dt className="text-sm text-ink-3">Mode · frequency</dt><dd className="font-semibold">{e.examMode} · {e.examFrequency}</dd></div>
                <div className="sm:col-span-2"><dt className="text-sm text-ink-3">Leads to</dt><dd className="font-semibold">{e.eligibleCourses.join(', ')}</dd></div>
              </dl>
              <p className="rounded-2xl bg-saffron-50 px-4 py-3 text-[15px] leading-relaxed text-saffron-900">{e.importantDatesInfo}</p>
              {e.officialWebsite && (
                <a href={e.officialWebsite} target="_blank" rel="noopener noreferrer" className="link mt-auto inline-flex items-center gap-1.5">Official portal<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>
              )}
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  );
};
