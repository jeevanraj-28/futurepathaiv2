import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Copy, Search, Upload } from 'lucide-react';
import { ApiService } from '../services/api';
import { Character } from '../components/Character';
import { Alert, Badge, Button, PageHeader, ProgressBar, Segmented, Skeleton, StateMessage } from '../components/ui';
import { plainDimension } from '../lib/utils';

type ImportResult = {
  success: boolean;
  message: string;
  created: Array<{ name: string; email: string; inviteToken: string }>;
  skipped: Array<{ email: string; reason: string }>;
  errors: Array<{ row: number; email?: string; reason: string }>;
};

/** Minimal CSV reader for "name,email,rollNumber,class" rows exported from school spreadsheets. */
const parseCsv = (text: string) =>
  text
    .split(/\r?\n/)
    .map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')))
    .filter((cols) => cols.length >= 2 && cols[1].includes('@'))
    .map(([name, email, rollNumber, currentClass]) => ({ name, email, rollNumber, currentClass }));

export const SchoolPortalPage: React.FC = () => {
  const [school, setSchool] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED'>('ALL');
  const [message, setMessage] = useState<{ tone: 'leaf' | 'danger' | 'royal'; text: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    Promise.all([ApiService.getSchoolDashboard(), ApiService.getSchoolStudents()])
      .then(([d, s]) => { setSchool(d.school); setStudents(s.students || []); })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const filtered = useMemo(
    () => students.filter((s) =>
      (status === 'ALL' || s.assessmentStatus === status) &&
      `${s.name} ${s.email} ${s.rollNumber} ${s.classGroup}`.toLowerCase().includes(query.toLowerCase())
    ),
    [students, status, query]
  );
  const pendingCount = students.filter((s) => s.assessmentStatus !== 'COMPLETED').length;

  const importCsv = async (file: File) => {
    const rows = parseCsv(await file.text());
    if (!rows.length) {
      setMessage({ tone: 'danger', text: 'No students found. Use columns: name, email, roll number, class.' });
      return;
    }
    setImporting(true);
    try {
      const res = await ApiService.request<ImportResult>('/school/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ studentsList: rows }),
      });
      setResult(res);
      setMessage(null);
      await load();
    } catch (err: any) {
      setMessage({ tone: 'danger', text: err.message || 'Import failed.' });
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // one line per new student: name, email and personal link, ready to paste into a sheet or message
  const copyInvites = async () => {
    if (!result) return;
    const text = result.created.map((c) => [c.name, c.email, `${window.location.origin}/invite/${c.inviteToken}`].join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ tone: 'royal', text: `Copied ${result.created.length} invite links.` });
    } catch {
      setMessage({ tone: 'royal', text: 'Your browser blocked copying. Select the links from the import file instead.' });
    }
  };

  const copyReminder = async () => {
    const text = `Reminder from ${school?.name || 'school'}: please complete your FuturePath discovery test this week. It takes about 25 minutes: ${window.location.origin}/start`;
    try {
      await navigator.clipboard.writeText(text);
      setMessage({ tone: 'royal', text: 'Reminder copied. Paste it into your class WhatsApp group.' });
    } catch {
      setMessage({ tone: 'royal', text });
    }
  };

  if (loading) return <div className="flex flex-col gap-6"><Skeleton className="h-12 w-80" /><div className="grid gap-4 sm:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}</div><Skeleton className="h-96 rounded-3xl" /></div>;
  if (failed || !school) return <div className="card"><StateMessage pose="think" title="We couldn’t load your school" body="Please refresh. If it continues, contact support." /></div>;

  const importProblems = result
    ? [
        ...result.skipped.map((x) => ({ key: `s-${x.email}`, label: x.email, reason: x.reason })),
        ...result.errors.map((x) => ({ key: `e-${x.row}`, label: `Row ${x.row}${x.email ? ` · ${x.email}` : ''}`, reason: x.reason })),
      ]
    : [];
  const testRate = school.totalEnrolledStudents ? Math.round((school.completedAssessments / school.totalEnrolledStudents) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        leading={<Character who="harjeet" size={60} />}
        title={school.name}
        subtitle={`${school.board || 'Board'} · ${school.city}, ${school.state} · ${school.subscriptionTier || 'Pilot'} plan`}
        actions={
          <>
            <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" aria-label="Student list CSV file" id="csv-upload" onChange={(e) => e.target.files?.[0] && importCsv(e.target.files[0])} />
            <Button variant="secondary" size="sm" onClick={() => fileRef.current?.click()} loading={importing}><Upload className="h-4 w-4" aria-hidden="true" />Import students (CSV)</Button>
          </>
        }
      />

      {message && <Alert tone={message.tone}>{message.text}</Alert>}

      {result && (
        <section aria-labelledby="import-title" className="card flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="import-title" className="text-lg font-bold">Import results</h2>
            <button type="button" onClick={() => setResult(null)} className="link text-sm">Dismiss</button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge tone="leaf">{result.created.length} added</Badge>
            <Badge tone="saffron">{result.skipped.length} skipped</Badge>
            <Badge tone="danger">{result.errors.length} errors</Badge>
          </div>
          {result.created.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-leaf-50 p-4">
              <p className="text-[15px] text-leaf-900">Each new student needs their invite link to set a password. Links expire in 14 days.</p>
              <Button size="sm" variant="secondary" onClick={copyInvites}><Copy className="h-4 w-4" aria-hidden="true" />Copy invite links</Button>
            </div>
          )}
          {importProblems.length > 0 && (
            <ul className="divide-y divide-line rounded-2xl border border-line text-[15px]">
              {importProblems.map((x) => (
                <li key={x.key} className="flex flex-wrap justify-between gap-2 px-4 py-2.5"><span className="font-semibold">{x.label}</span><span className="text-ink-3">{x.reason}</span></li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section aria-label="Overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="card flex flex-col gap-2 p-5">
          <span className="text-sm text-ink-3">Students enrolled</span>
          <span className="font-display text-3xl font-bold">{school.totalEnrolledStudents}<span className="text-base font-medium text-ink-3"> / {school.maxStudents}</span></span>
          <ProgressBar value={school.totalEnrolledStudents} max={school.maxStudents || 1} label="Seats used" />
        </div>
        <div className="card flex flex-col gap-2 p-5">
          <span className="text-sm text-ink-3">Tests completed</span>
          <span className="font-display text-3xl font-bold">{school.completedAssessments}</span>
          <ProgressBar value={testRate} tone="leaf" label="Tests completed" />
        </div>
        <div className="card flex flex-col gap-1 p-5"><span className="text-sm text-ink-3">Still to take the test</span><span className="font-display text-3xl font-bold text-saffron-700">{pendingCount}</span>
          {pendingCount > 0 && <button type="button" onClick={copyReminder} className="link mt-1 inline-flex items-center gap-1.5 self-start text-sm"><Copy className="h-4 w-4" aria-hidden="true" />Copy WhatsApp reminder</button>}
        </div>
        <div className="card flex flex-col gap-1 p-5"><span className="text-sm text-ink-3">Batches</span><span className="font-display text-3xl font-bold">{school.batches?.length || 0}</span><span className="text-sm text-ink-3">{school.batches?.map((b: any) => b.name).join(', ')}</span></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section aria-labelledby="roster-title" className="card flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="roster-title" className="text-xl font-bold">Students</h2>
            <Segmented size="sm" label="Filter by test status" value={status} onChange={setStatus} options={[{ value: 'ALL', label: 'All' }, { value: 'PENDING', label: 'Not tested' }, { value: 'COMPLETED', label: 'Tested' }]} />
          </div>
          <div className="relative">
            <label htmlFor="roster-search" className="sr-only">Search students</label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input id="roster-search" type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name, email, roll number or class" className="field-input pl-12" />
          </div>
          {filtered.length === 0 ? (
            <StateMessage compact pose="read" title="No students match" body={students.length ? 'Try a different search or filter.' : 'Import your class list to get started.'} />
          ) : (
            <div role="region" aria-label="Students" tabIndex={0} className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[720px] border-collapse text-left text-[15px]">
                <thead className="bg-mist">
                  <tr>
                    {['Roll', 'Student', 'Class', 'Test', 'Strongest areas', 'Profile'].map((h) => <th key={h} scope="col" className="px-4 py-3 text-sm font-bold text-ink-2">{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-t border-line">
                      <td className="px-4 py-3 font-mono text-sm text-ink-3">{s.rollNumber}</td>
                      <td className="px-4 py-3"><span className="block font-semibold">{s.name}</span><span className="text-sm text-ink-3">{s.email}</span></td>
                      <td className="px-4 py-3">{s.classGroup}</td>
                      <td className="px-4 py-3">{s.assessmentStatus === 'COMPLETED' ? <Badge tone="leaf">Done</Badge> : <Badge tone="saffron">Not yet</Badge>}</td>
                      <td className="px-4 py-3 text-sm text-ink-2">{s.topStrengths?.length ? s.topStrengths.slice(0, 2).map(plainDimension).join(', ') : '—'}</td>
                      <td className="px-4 py-3 font-semibold">{s.completionScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section aria-labelledby="streams-title" className="card flex flex-col gap-4 self-start p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="streams-title" className="text-lg font-bold">Stream interest</h2>
            <span className="text-sm text-ink-3">{school.completedAssessments} tested</span>
          </div>
          {(school.streamDistribution || []).length === 0 && (
            <p className="text-[15px] text-ink-3">Appears once students finish the discovery test.</p>
          )}
          {(school.streamDistribution || []).map((d: any) => (
            <div key={d.stream} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[15px]"><span>{d.stream}</span><span className="font-bold">{d.percentage}%</span></div>
              <ProgressBar value={d.percentage} label={d.stream} />
            </div>
          ))}
          <p className="text-sm leading-relaxed text-ink-3">Use this in parent-teacher meetings to plan stream counselling sessions.</p>
        </section>
      </div>
    </div>
  );
};
