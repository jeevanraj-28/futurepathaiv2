import React, { useEffect, useState } from 'react';
import { ExternalLink, FileText, Search } from 'lucide-react';
import { ApiService } from '../services/api';
import type { Scholarship } from '../types';
import { Dhruv } from '../components/brand';
import { Skeleton, StateMessage } from '../components/ui';
import { PageFrame } from '../components/layout/AppLayout';

export const ScholarshipFinderPage: React.FC = () => {
  const [items, setItems] = useState<Scholarship[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setLoading(true);
      setError(false);
      ApiService.getScholarships({ search: search.trim() || undefined })
        .then((res) => setItems(res.scholarships || []))
        .catch(() => setError(true))
        .finally(() => setLoading(false));
    }, 250);
    return () => window.clearTimeout(t);
  }, [search]);

  return (
    <PageFrame className="flex flex-col gap-7">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex max-w-2xl flex-col gap-3">
          <p className="eyebrow">Discover · Funding</p>
          <h1 className="h-display text-4xl sm:text-5xl">Scholarships</h1>
          <p className="text-lg leading-relaxed text-ink-2">Central and state schemes with who can apply, how much they give and the documents you need.</p>
        </div>
        <Dhruv pose="love" size={110} className="hidden sm:block" decorative />
      </div>

      <div className="relative">
        <label htmlFor="scholarship-search" className="sr-only">Search scholarships</label>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
        <input id="scholarship-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, provider or eligibility" className="field-input pl-12" />
      </div>

      {loading ? (
        <div className="flex flex-col gap-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-44 rounded-3xl" />)}</div>
      ) : error ? (
        <div className="card"><StateMessage pose="think" title="Scholarships didn’t load" body="Please check your connection and refresh." /></div>
      ) : items.length === 0 ? (
        <div className="card"><StateMessage pose="read" title="No scholarships match" body="Try a broader search, like “merit” or “engineering”." /></div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((s) => (
            <article key={s.id} className="card grid gap-5 p-6 lg:grid-cols-[1fr_260px]">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="text-xl font-bold">{s.name}</h2>
                  <p className="text-[15px] text-ink-3">{s.provider}</p>
                </div>
                <p className="leading-relaxed text-ink-2"><strong className="text-ink">Who can apply:</strong> {s.eligibility}</p>
                {s.requiredDocs?.length > 0 && (
                  <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2">
                    <FileText className="h-4 w-4 text-ink-3" aria-hidden="true" />{s.requiredDocs.join(' · ')}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-3 rounded-2xl bg-leaf-50 p-5">
                <div><span className="text-sm text-leaf-700">Benefit</span><p className="text-lg font-bold text-leaf-900">{s.benefitAmount}</p></div>
                {s.incomeCeiling && <div><span className="text-sm text-leaf-700">Family income limit</span><p className="font-semibold text-leaf-900">{s.incomeCeiling}</p></div>}
                <div><span className="text-sm text-leaf-700">Deadline</span><p className="font-semibold text-leaf-900">{s.deadlineText}</p></div>
                {s.officialUrl && <a href={s.officialUrl} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5">Apply on official site<ExternalLink className="h-4 w-4" aria-hidden="true" /></a>}
              </div>
            </article>
          ))}
        </div>
      )}
    </PageFrame>
  );
};
