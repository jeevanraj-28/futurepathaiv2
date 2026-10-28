import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ChevronDown, GraduationCap, Search, ShieldCheck } from 'lucide-react';
import { ApiService } from '../services/api';
import type { Career } from '../types';
import { Badge, Button, SectionHeader } from '../components/ui';
import { Dhruv } from '../components/brand';
import { Character, type CharacterId } from '../components/Character';
import { cn, formatLPA } from '../lib/utils';

const PATHS: Array<{ id: 'c10' | 'c12' | 'parent'; who: CharacterId; title: string; sub: string; cta: string; to: string }> = [
  { id: 'c10', who: 'aarav', title: 'Class 9–10', sub: 'Pick the right stream', cta: 'Find my stream', to: '/start?class=10' },
  { id: 'c12', who: 'meera', title: 'Class 11–12', sub: 'Choose degree and career', cta: 'Find my career', to: '/start?class=12' },
  { id: 'parent', who: 'rajesh', title: 'I’m a parent', sub: 'Guide my child', cta: 'Start as a parent', to: '/register?role=PARENT' },
];

const MILESTONES = {
  c10: {
    title: 'Choosing a stream for Class 11',
    body: 'Compare every stream on what you would study, where it leads, what it costs, and how well it suits the way you think.',
    points: ['Board eligibility shown separately from personal fit', 'Four-year cost estimates in ₹ for each stream', 'Careers each stream keeps open — and closes'],
    cta: 'Compare streams', to: '/stream-guide',
    options: [
      ['Science (PCM)', 'Engineering, data, architecture, defence'],
      ['Science (PCB)', 'Medicine, allied health, biotech'],
      ['Science (PCMB)', 'Keeps engineering and medicine open'],
      ['Commerce', 'CA, finance, business, economics'],
      ['Humanities', 'Law, design, civil services, media'],
      ['Vocational', 'Skill-based careers with early work'],
    ],
  },
  c12: {
    title: 'Choosing a degree and career',
    body: 'Explore 50+ careers with real responsibilities, entrance exams, top colleges and salary ranges — matched to your report.',
    points: ['Entrance exam guide: JEE, NEET, CLAT, CUET, UCEED, NDA', 'College finder with NIRF rank, fees and admission route', 'Scholarships matched to eligibility and family income'],
    cta: 'Explore careers', to: '/careers',
    options: [
      ['Engineering & tech', 'JEE Main, JEE Advanced, BITSAT'],
      ['Medicine & health', 'NEET UG'],
      ['Law', 'CLAT, AILET'],
      ['Design', 'UCEED, NID DAT, NIFT'],
      ['Commerce & finance', 'CA Foundation, CUET UG'],
      ['Defence', 'NDA'],
    ],
  },
};

const FEATURES = [
  { tag: 'Career library', title: '50+ careers, explained', body: 'What the work is really like, subjects needed, degrees, colleges and verified salary ranges.', link: 'Browse careers', to: '/careers' },
  { tag: 'Stream guide', title: 'Stream comparison', body: 'PCM, PCB, PCMB, Commerce, Humanities and Vocational compared on fit, scope and cost.', link: 'Compare streams', to: '/stream-guide' },
  { tag: 'Colleges', title: 'College finder', body: 'IITs, AIIMS, NLUs, IIMs, NID, BITS and more — NIRF rank, fees and how to get in.', link: 'Find colleges', to: '/colleges' },
  { tag: 'Exams', title: 'Entrance exam guide', body: 'Eligibility, pattern and official portals for every major entrance exam in one place.', link: 'See exams', to: '/exams' },
  { tag: 'Funding', title: 'Scholarship finder', body: 'Central and state schemes filtered by marks, category and family income.', link: 'Find scholarships', to: '/scholarships' },
  { tag: 'Support', title: 'Dhruv and real counsellors', body: 'Ask the AI mentor any time, then book a verified counsellor when you need a person.', link: 'Meet the counsellors', to: '/counselors' },
];

const FAQS = [
  ['How is this different from a free online career quiz?', 'Quizzes usually give you one label without explaining it. FuturePath measures 16 areas — reasoning, interests, values and working style — and shows which of your strengths led to each recommendation, alongside board requirements and real salary data.'],
  ['Will it decide my future for me?', 'No. Your report shows possibilities, trade-offs and alternative routes so that you, your parents and your counsellor can decide together. It never guarantees admission or a job.'],
  ['Which boards and classes is it for?', 'Students in Classes 9 to 12 on CBSE, CISCE and State boards. Class 9–10 students get stream guidance; Class 11–12 students get degree, exam and career guidance.'],
  ['How does parent access and consent work?', 'A parent requests a link from their account. Only after the student approves can the parent see the report and planner. Either side can remove the link at any time.'],
  ['Is my child’s data safe?', 'We follow the Digital Personal Data Protection Act 2023, collect only what guidance needs, and never sell student data to coaching centres or advertisers.'],
];

const PREVIEW_STRENGTHS: Array<[string, number]> = [['Logical reasoning', 82], ['Numerical reasoning', 78], ['Scientific thinking', 74], ['Creative thinking', 61]];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [path, setPath] = useState<'c10' | 'c12' | 'parent'>('c10');
  const [tab, setTab] = useState<'c10' | 'c12'>('c10');
  const [faq, setFaq] = useState(0);
  const [query, setQuery] = useState('');
  const [careers, setCareers] = useState<Career[]>([]);

  useEffect(() => {
    ApiService.getCareers()
      .then((res) => res.success && setCareers(res.careers.slice(0, 6)))
      .catch(() => setCareers([]));
  }, []);

  const current = PATHS.find((p) => p.id === path)!;
  const milestone = MILESTONES[tab];

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line bg-mist">
        <div className="page grid items-center gap-14 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-20">
          <div className="flex flex-col gap-7">
            <Badge tone="saffron" className="self-start text-sm"><GraduationCap className="h-4 w-4" aria-hidden="true" />Built for Classes 9–12 in India</Badge>
            <h1 className="h-display text-[40px] sm:text-5xl lg:text-[60px]">
              Choose your stream and career with <span className="text-royal-500">confidence</span>, not guesswork.
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-ink-2 sm:text-[19px]">
              A 25-minute discovery test maps how you think and what you enjoy, then shows the streams, degrees and careers that fit — with the reasons, costs and exams for each.
            </p>
            <div className="flex flex-col gap-3">
              <p className="text-[15px] font-semibold">Where are you right now?</p>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {PATHS.map((p) => {
                  const on = p.id === path;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => { setPath(p.id); if (p.id !== 'parent') setTab(p.id); }}
                      className={cn(
                        'flex min-h-[44px] flex-col items-start gap-1 rounded-xl p-4 text-left transition-colors',
                        on ? 'border-2 border-royal-500 bg-royal-50 p-[15px]' : 'border border-line-strong bg-white hover:border-royal-300'
                      )}
                    >
                      <Character who={p.who} size={44} animate={false} />
                      <span className="mt-1 font-bold">{p.title}</span>
                      <span className="text-sm text-ink-3">{p.sub}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button to={current.to} size="lg">{current.cta}<ArrowRight className="h-5 w-5" aria-hidden="true" /></Button>
              <Button to="/how-it-works" size="lg" variant="secondary" className="font-semibold">How it works</Button>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
              {['Free to start', 'CBSE, CISCE & State boards', 'Your data is never sold'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-leaf-600" aria-hidden="true" />{t}</li>
              ))}
            </ul>
          </div>

          {/* Product preview */}
          <div className="relative sm:pt-16 lg:pt-0">
            <Dhruv eager pose="wave" size={120} className="absolute -top-2 right-4 z-10 hidden sm:block lg:-top-[104px]" bob decorative />
            <div className="flex flex-col gap-5 rounded-3xl border border-line bg-white p-7 shadow-lift">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.06em] text-ink-3">Sample report · Class 10, CBSE</p>
                  <p className="mt-1.5 font-display text-2xl font-bold">Recommended stream: Science (PCM)</p>
                </div>
                <Badge tone="leaf">Strong fit</Badge>
              </div>
              <div className="flex flex-col gap-3">
                <p className="text-[15px] font-semibold">Top strengths</p>
                {PREVIEW_STRENGTHS.map(([label, v]) => (
                  <div key={label} className="grid grid-cols-[150px_1fr] items-center gap-3 text-sm">
                    <span className="text-ink-2">{label}</span>
                    <span className="block h-2 overflow-hidden rounded-full bg-[#EDF0F5]"><span className="block h-full rounded-full bg-royal-500" style={{ width: `${v}%` }} /></span>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-2.5 border-t border-line pt-4">
                <p className="text-[15px] font-semibold">Careers that fit</p>
                {[['Data Scientist', 'Numbers + logic + curiosity', 'Strong fit'], ['AI & ML Engineer', 'Logic + problem solving', 'Strong fit'], ['Actuary', 'Numerical reasoning + risk', 'Good fit']].map(([t, why, band]) => (
                  <div key={t} className="flex items-center justify-between gap-3 rounded-xl bg-mist px-4 py-3">
                    <span className="flex flex-col"><span className="font-semibold">{t}</span><span className="text-[13px] text-ink-3">{why}</span></span>
                    <Badge tone={band === 'Strong fit' ? 'leaf' : 'royal'}>{band}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-b border-line">
        <div className="page flex flex-wrap items-center gap-x-8 gap-y-3 py-7">
          <p className="text-sm font-medium text-ink-3">Guidance referenced from official sources</p>
          <div className="flex flex-wrap gap-x-7 gap-y-2 font-display text-lg font-bold text-ink-2">
            {['CBSE', 'NTA', 'NMC', 'AICTE', 'NIRF', 'Consortium of NLUs', 'UGC'].map((s) => <span key={s}>{s}</span>)}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="page flex flex-col gap-12 py-24">
        <SectionHeader eyebrow="How it works" title="From “I don’t know” to a plan you can act on" />
        <div className="grid gap-6 md:grid-cols-3">
          {[
            ['Take the discovery test', '40 questions across 16 areas — reasoning, interests, values and working style. No sign-up needed to start.', 'About 25 minutes'],
            ['Read your report', 'Your strengths, the stream that suits you, and career matches — each with a plain-language reason, salary range and exams.', 'Share it on WhatsApp'],
            ['Follow your plan', 'A step-by-step plan for the next 30 days, 90 days and year: subjects, exams, books and scholarships.', 'Ask Dhruv at any step'],
          ].map(([title, body, foot], i) => (
            <div key={title} className="card flex flex-col gap-3.5 p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-royal-50 font-display text-xl font-extrabold text-royal-500">{i + 1}</span>
              <h3 className="text-[21px] font-bold">{title}</h3>
              <p className="leading-relaxed text-ink-2">{body}</p>
              <p className="mt-auto text-sm font-semibold text-ink-3">{foot}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Two decisions */}
      <section className="border-y border-line bg-mist">
        <div className="page flex flex-col gap-10 py-24">
          <SectionHeader
            eyebrow="Two big decisions"
            title="Guidance for the exact moment you’re in"
            action={
              <div role="tablist" aria-label="Choose your class" className="inline-flex rounded-xl border border-line bg-white p-1">
                {(['c10', 'c12'] as const).map((id) => (
                  <button
                    key={id}
                    role="tab"
                    type="button"
                    aria-selected={tab === id}
                    onClick={() => setTab(id)}
                    className={cn('min-h-[44px] rounded-[9px] px-4 text-[15px] font-semibold', tab === id ? 'bg-ink text-white' : 'text-ink-2')}
                  >
                    {id === 'c10' ? 'After Class 10' : 'After Class 12'}
                  </button>
                ))}
              </div>
            }
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card flex flex-col gap-5 p-9">
              <h3 className="font-display text-3xl font-bold tracking-tight">{milestone.title}</h3>
              <p className="text-[17px] leading-relaxed text-ink-2">{milestone.body}</p>
              <ul className="flex flex-col gap-3">
                {milestone.points.map((pt) => (
                  <li key={pt} className="flex gap-3"><Check className="mt-0.5 h-5 w-5 shrink-0 text-royal-500" aria-hidden="true" />{pt}</li>
                ))}
              </ul>
              <Button to={milestone.to} variant="dark" className="mt-2 self-start">{milestone.cta}</Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {milestone.options.map(([name, leads]) => (
                <div key={name} className="card flex flex-col gap-1.5 p-5">
                  <span className="font-bold">{name}</span>
                  <span className="text-sm leading-snug text-ink-3">{leads}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Careers from the library */}
      {careers.length > 0 && (
        <section className="page flex flex-col gap-10 py-24">
          <SectionHeader
            eyebrow="Explore"
            title="Careers students are reading about"
            action={
              <form
                role="search"
                onSubmit={(e) => { e.preventDefault(); navigate(`/careers${query.trim() ? `?search=${encodeURIComponent(query.trim())}` : ''}`); }}
                className="flex w-full max-w-md gap-2"
              >
                <label htmlFor="home-search" className="sr-only">Search careers</label>
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
                  <input id="home-search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Doctor, pilot, CA, designer…" className="field-input pl-11" />
                </div>
                <Button type="submit">Search</Button>
              </form>
            }
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {careers.map((c) => (
              <Link key={c.id} to={`/careers/${c.slug}`} className="card group flex flex-col gap-2.5 p-6 hover:border-royal-300">
                <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-saffron-700">{c.category}</span>
                <span className="text-lg font-bold group-hover:text-royal-500">{c.title}</span>
                <span className="line-clamp-2 text-[15px] leading-relaxed text-ink-2">{c.shortDescription}</span>
                <span className="mt-auto pt-2 text-sm font-semibold text-ink-3">{formatLPA(c.salaryMinINR, c.salaryMaxINR)}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Features */}
      <section className={cn('page flex flex-col gap-12 pb-24', careers.length === 0 && 'pt-24')}>
        <SectionHeader eyebrow="Everything in one place" title="Research that usually takes months, organised for you" />
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Link key={f.title} to={f.to} className="card group flex flex-col gap-2.5 p-7 hover:border-royal-300">
              <span className="text-[13px] font-bold uppercase tracking-[0.06em] text-saffron-700">{f.tag}</span>
              <span className="text-xl font-bold">{f.title}</span>
              <span className="leading-relaxed text-ink-2">{f.body}</span>
              <span className="mt-auto pt-2 font-semibold text-royal-500 group-hover:text-royal-600">{f.link} →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Parents */}
      <section className="bg-night text-white">
        <div className="page grid items-center gap-14 py-24 lg:grid-cols-2">
          <div className="flex flex-col gap-5">
            <div className="flex gap-2.5">
              <Character who="sunita" size={72} />
              <Character who="rajesh" mood="wave" size={72} />
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-saffron-300">For parents</p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-[44px] sm:leading-[1.1]">Be part of the decision, with the facts in front of you</h2>
            <p className="text-lg leading-relaxed text-night-text">Link to your child’s profile with their consent. Read the same report, compare streams, and plan four years of fees, hostel and coaching costs.</p>
            <div className="mt-2 flex flex-wrap gap-3">
              <Button to="/for-parents" variant="white">Explore the parent portal</Button>
              <Button to="/privacy-policy" className="border border-night-3 bg-transparent text-white hover:bg-night-2">How consent works</Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[['Shared report', 'Strengths, matches and reasons — in plain language.'], ['Cost planner', 'Four-year estimates in ₹ for each path and city.'], ['Scholarships', 'CSSS, INSPIRE, Pragati and more, matched to eligibility.'], ['Talk to a counsellor', 'Book verified experts for a 1-on-1 family session.']].map(([t, b]) => (
              <div key={t} className="flex flex-col gap-2 rounded-2xl border border-night-3 bg-night-2 p-6">
                <span className="font-display text-xl font-bold">{t}</span>
                <span className="text-[15px] leading-relaxed text-night-text">{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promise */}
      <section className="page grid gap-8 py-24 lg:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-3.5">
          <p className="eyebrow">Our promise</p>
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-[40px] sm:leading-[1.12]">Honest guidance, not a sales funnel</h2>
          <p className="text-[17px] leading-relaxed text-ink-2">Recommendations are possibilities to explore together — never guarantees of admission or jobs.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[['Explains every match', 'You see which strengths drove each recommendation.'], ['Cites its sources', 'Salary and exam data link to the source and the date checked.'], ['DPDP Act 2023 compliant', 'Minimal data, parental consent, no ad profiling.'], ['No coaching-centre spam', 'We never sell student contacts to third parties.']].map(([t, b]) => (
            <div key={t} className="card-muted flex flex-col gap-2 p-6">
              <span className="flex items-center gap-2 text-[17px] font-bold"><ShieldCheck className="h-5 w-5 text-leaf-600" aria-hidden="true" />{t}</span>
              <span className="text-[15px] leading-relaxed text-ink-2">{b}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-y border-line bg-mist">
        <div className="page flex flex-col gap-10 py-24">
          <SectionHeader title="Start free. Upgrade when you’re ready." action={<Link to="/pricing" className="link">Compare all plans →</Link>} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Explorer', '₹0', '', 'Discovery test, top 3 matches, career library.'],
              ['Career Report', '₹299', 'once', 'Every match with reasons, PDF for parents.'],
              ['Premium', '₹999', '/ year', 'Personal plan, unlimited Dhruv, scholarships.'],
              ['Family', '₹2,499', '/ year', 'Premium + parent portal + a counsellor session.'],
            ].map(([name, price, per, body]) => {
              const featured = name === 'Premium';
              return (
                <div key={name} className={cn('relative flex flex-col gap-2.5 rounded-2xl bg-white p-6', featured ? 'border-2 border-royal-500' : 'border border-line')}>
                  {featured && <span className="absolute -top-3 left-6 rounded-full bg-royal-500 px-2.5 py-1 text-xs font-bold text-white">Most chosen</span>}
                  <span className="text-[17px] font-bold">{name}</span>
                  <span className="font-display text-4xl font-bold">{price} <span className="font-sans text-[15px] font-medium text-ink-3">{per}</span></span>
                  <span className="text-[15px] leading-relaxed text-ink-2">{body}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-24 sm:px-6">
        <h2 className="h-section text-center">Questions families ask</h2>
        <div className="border-t border-line">
          {FAQS.map(([q, a], i) => {
            const open = faq === i;
            return (
              <div key={q} className="border-b border-line">
                <h3>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() => setFaq(open ? -1 : i)}
                    className="flex min-h-[64px] w-full items-center justify-between gap-4 py-5 text-left text-lg font-semibold"
                  >
                    {q}
                    <ChevronDown className={cn('h-5 w-5 shrink-0 text-royal-500 transition-transform', open && 'rotate-180')} aria-hidden="true" />
                  </button>
                </h3>
                {open && <p className="max-w-2xl pb-6 leading-relaxed text-ink-2">{a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* Final CTA */}
      <section className="page pb-24">
        <div className="flex flex-wrap items-center justify-between gap-8 rounded-4xl bg-royal-500 px-8 py-14 text-white sm:px-12">
          <div className="flex max-w-xl flex-col gap-3">
            <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-[40px] sm:leading-[1.1]">Your next step takes 25 minutes</h2>
            <p className="text-lg text-royal-100">Start the free discovery test today. Pause whenever you like.</p>
          </div>
          <div className="flex items-center gap-6">
            <Button to="/start" size="lg" variant="white" className="text-royal-600">Start free test</Button>
            <span className="hidden h-[136px] w-[136px] items-center justify-center rounded-full bg-white sm:flex"><Dhruv pose="cheer" size={120} decorative /></span>
          </div>
        </div>
      </section>
    </>
  );
};
