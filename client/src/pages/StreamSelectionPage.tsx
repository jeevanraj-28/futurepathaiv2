import React, { useEffect, useState } from 'react';
import { Check, Minus } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/auth';
import { Dhruv } from '../components/brand';
import { Badge, Button, FitBadge, Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';
import { cn } from '../lib/utils';

const READINESS_KEY: Record<string, string> = {
  PCM: 'Science (PCM)', PCB: 'Science (PCB)', COMMERCE: 'Commerce', HUMANITIES: 'Humanities & Social Sciences',
};

const ROWS: Array<[string, string]> = [
  ['suitedFor', 'Best for'],
  ['coreSubjects', 'Core subjects'],
  ['keyExams', 'Key entrance exams'],
  ['majorDegrees', 'Common degrees'],
  ['careerFamilies', 'Career families'],
  ['costRangeINR', 'Typical cost of higher studies'],
  ['pros', 'Upside'],
  ['cons', 'Watch out for'],
];

export const StreamSelectionPage: React.FC = () => {
  const { user } = useAuth();
  const [streams, setStreams] = useState<any[]>([]);
  const [readiness, setReadiness] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<string[]>(['PCM', 'PCB']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    ApiService.getStreamGuide()
      .then((res) => setStreams(res.streams || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
    if (user?.role === 'STUDENT') {
      ApiService.getAssessmentResults().then((r) => setReadiness(r.result?.readinessProfile || {})).catch(() => undefined);
    }
  }, [user]);

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? [...s.slice(1), id] : [...s, id]));

  const compared = streams.filter((s) => selected.includes(s.id));
  const fitFor = (id: string) => readiness[READINESS_KEY[id]];

  return (
    <PageFrame className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="eyebrow">Discover · After Class 10</p>
          <h1 className="h-display text-4xl sm:text-5xl">Compare streams</h1>
          <p className="text-lg leading-relaxed text-ink-2">See what each stream involves, where it leads, and what it costs. Pick up to three to compare side by side.</p>
        </div>
        {Object.keys(readiness).length === 0 && (
          <div className="flex items-center gap-4 rounded-3xl bg-royal-50 p-5">
            <Dhruv pose="think" size={72} decorative />
            <div className="flex flex-col gap-2">
              <span className="font-bold">Not sure which suits you?</span>
              <Button to="/start" size="sm">Take the free test</Button>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-52 rounded-3xl" />)}</div>
      ) : error ? (
        <div className="card"><StateMessage pose="think" title="The stream guide didn’t load" body="Please check your connection and refresh." /></div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {streams.map((s) => {
              const on = selected.includes(s.id);
              const fit = fitFor(s.id);
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(s.id)}
                  className={cn('flex flex-col gap-3 rounded-3xl p-6 text-left transition-colors', on ? 'border-2 border-royal-500 bg-royal-50 p-[23px]' : 'border border-line bg-white hover:border-royal-300')}
                >
                  <div className="flex w-full items-start justify-between gap-3">
                    <Badge tone="saffron">{s.badge}</Badge>
                    <span className={cn('flex h-7 w-7 items-center justify-center rounded-md border-2', on ? 'border-royal-500 bg-royal-500 text-white' : 'border-line-strong bg-white')}>
                      {on && <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />}
                    </span>
                  </div>
                  <span className="text-xl font-bold leading-snug">{s.name}</span>
                  <span className="line-clamp-3 text-[15px] leading-relaxed text-ink-2">{s.suitedFor}</span>
                  {fit !== undefined && <FitBadge score={fit} className="mt-auto" />}
                </button>
              );
            })}
          </div>

          {compared.length > 0 && (
            <section aria-labelledby="compare-title" className="flex flex-col gap-4">
              <h2 id="compare-title" className="font-display text-[28px] font-bold">Side by side</h2>
              <div role="region" aria-label="Stream comparison" tabIndex={0} className="overflow-x-auto rounded-3xl border border-line bg-white">
                <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
                  <thead>
                    <tr className="bg-mist">
                      <th scope="col" className="w-48 px-5 py-4 font-bold">&nbsp;</th>
                      {compared.map((s) => <th key={s.id} scope="col" className="px-5 py-4 text-base font-bold">{s.name}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map(([key, label]) => (
                      <tr key={key} className="border-t border-line align-top">
                        <th scope="row" className="px-5 py-4 font-semibold text-ink-2">{label}</th>
                        {compared.map((s) => {
                          const v = s[key];
                          return (
                            <td key={s.id} className="px-5 py-4 leading-relaxed">
                              {Array.isArray(v) ? (
                                <ul className="flex flex-col gap-1">{v.map((x: string) => <li key={x} className="flex gap-2"><Minus className="mt-1 h-3.5 w-3.5 shrink-0 text-ink-3" aria-hidden="true" />{x}</li>)}</ul>
                              ) : v}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-ink-3">Board eligibility and personal fit are different things. A stream you’re eligible for may still not suit how you like to think.</p>
            </section>
          )}
        </>
      )}
    </PageFrame>
  );
};
