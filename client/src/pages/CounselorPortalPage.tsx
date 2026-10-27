import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Languages, Star, Video, X } from 'lucide-react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Dhruv } from '../components/brand';
import { Character } from '../components/Character';
import { Alert, Badge, Button, Field, Modal, PageHeader, Skeleton, StateMessage } from '../components/ui';
import { cn, formatINR } from '../lib/utils';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Turn weekly slots like "Mon 16:00-17:00" into real dates over the next two weeks. */
const upcomingSlots = (slots: string[]) => {
  const out: Array<{ date: string; label: string; time: string }> = [];
  const today = new Date();
  for (let d = 1; d <= 14; d++) {
    const day = new Date(today);
    day.setDate(today.getDate() + d);
    slots.forEach((s) => {
      const [dow, time] = s.split(' ');
      if (DAY[day.getDay()] === dow) {
        const iso = day.toISOString().slice(0, 10);
        out.push({
          date: iso,
          time: time.replace('-', ' - '),
          label: `${day.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })} · ${time.replace('-', '–')}`,
        });
      }
    });
  }
  return out;
};

const BookingDialog: React.FC<{ counselor: any; onClose: () => void; onBooked: () => void }> = ({ counselor, onClose, onBooked }) => {
  const options = useMemo(() => upcomingSlots(counselor.availableSlots || []), [counselor]);
  const [pick, setPick] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<any>(null);

  const book = async () => {
    const slot = options[pick];
    if (!slot) return;
    setSaving(true);
    setError(null);
    try {
      const res = await ApiService.bookCounselor({ counselorId: counselor.id, scheduledDate: slot.date, slotTime: slot.time, studentNotes: notes });
      if (res.success) { setDone(res.booking); onBooked(); }
    } catch (err: any) {
      setError(err.message || 'We couldn’t book that slot. Please try another.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Book a session with ${counselor.name}`} onClose={onClose}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <h2 className="text-lg font-bold">Book a session</h2>
        <button type="button" onClick={onClose} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-mist"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      {done ? (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <Dhruv pose="celebrate" size={130} decorative />
          <h3 className="font-display text-2xl font-bold">You’re booked!</h3>
          <p className="text-ink-2">{done.scheduledDate} · {done.slotTime} with {counselor.name}</p>
          <Button href={done.meetingLink} variant="secondary"><Video className="h-4 w-4" aria-hidden="true" />Meeting link</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5 px-6 py-6">
          <div className="flex items-center gap-3">
            <Character who="ananya" size={52} animate={false} />
            <div className="flex flex-col"><span className="font-bold">{counselor.name}</span><span className="text-sm text-ink-3">{formatINR(counselor.hourlyRateINR)} · 60 minutes · video call</span></div>
          </div>
          {options.length === 0 ? (
            <Alert tone="saffron">No open slots in the next two weeks. Please check back soon.</Alert>
          ) : (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-2 text-[15px] font-semibold">Choose a time</legend>
              <div className="grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                {options.map((o, i) => (
                  <button key={o.date + o.time} type="button" role="radio" aria-checked={pick === i} onClick={() => setPick(i)} className={cn('min-h-[48px] rounded-xl px-3 text-left text-[15px] font-semibold', pick === i ? 'border-2 border-royal-500 bg-royal-50 text-royal-600' : 'border border-line-strong hover:border-royal-300')}>
                    {o.label}
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          <Field label="What would you like to talk about? (optional)" htmlFor="booking-notes">
            <textarea id="booking-notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} className="field-input" placeholder="e.g. Choosing between PCM and PCMB" />
          </Field>
          {error && <Alert>{error}</Alert>}
          <Button size="lg" onClick={book} loading={saving} disabled={!options.length}>Confirm booking</Button>
        </div>
      )}
    </Modal>
  );
};

export const CounselorPortalPage: React.FC<{ mode: 'marketplace' | 'counselor' }> = ({ mode }) => {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  const load = () =>
    Promise.all([
      ApiService.getCounselors().catch(() => ({ counselors: [] })),
      ApiService.request<{ success: boolean; bookings: any[] }>('/counselors/my-bookings').catch(() => ({ bookings: [] })),
    ])
      .then(([c, b]: any) => { setCounselors(c.counselors || []); setBookings(b.bookings || []); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  if (loading) return <div className="flex flex-col gap-6"><Skeleton className="h-12 w-72" /><Skeleton className="h-64 rounded-3xl" /></div>;

  if (mode === 'counselor') {
    return (
      <div className="flex flex-col gap-6">
        <PageHeader leading={<Character who="ananya" size={60} />} title={`Welcome, ${user?.name?.split(',')[0]}`} subtitle="Your upcoming sessions with students and families." />
        {bookings.length === 0 ? (
          <div className="card"><StateMessage pose="relax" title="No sessions booked yet" body="When students book you, their sessions and notes appear here." /></div>
        ) : (
          <div className="flex flex-col gap-3">
            {bookings.map((b) => (
              <article key={b.id} className="card flex flex-wrap items-center gap-4 p-5">
                <Character who="aarav" size={48} animate={false} />
                <div className="flex flex-1 basis-[240px] flex-col gap-1">
                  <span className="font-bold">{b.student?.user?.name || 'Student'}</span>
                  <span className="text-sm text-ink-3">{b.scheduledDate} · {b.slotTime}</span>
                  {b.studentNotes && <span className="text-[15px] text-ink-2">“{b.studentNotes}”</span>}
                </div>
                <Badge tone={b.status === 'CONFIRMED' ? 'leaf' : 'neutral'}>{b.status === 'CONFIRMED' ? 'Confirmed' : b.status}</Badge>
                {b.meetingLink && <Button href={b.meetingLink} size="sm" variant="secondary"><Video className="h-4 w-4" aria-hidden="true" />Join</Button>}
              </article>
            ))}
          </div>
        )}
      </div>
    );
  }

  const canBook = user?.role === 'STUDENT';

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Talk to a counsellor" subtitle="Verified experts for stream choice, exams and college applications — one-on-one, by video." />

      {!canBook && <Alert tone="royal">Sessions are booked from the student’s account so notes and reports stay together. Ask your child to book, or log in as the student.</Alert>}

      {bookings.length > 0 && (
        <section aria-labelledby="mine-title" className="card flex flex-col gap-3 p-6">
          <h2 id="mine-title" className="text-lg font-bold">Your sessions</h2>
          {bookings.map((b) => (
            <div key={b.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-mist px-4 py-3">
              <span className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-royal-500" aria-hidden="true" />{b.scheduledDate} · {b.slotTime} · {b.counselor?.user?.name}</span>
              {b.meetingLink && <a href={b.meetingLink} target="_blank" rel="noopener noreferrer" className="link inline-flex items-center gap-1.5"><Video className="h-4 w-4" aria-hidden="true" />Join</a>}
            </div>
          ))}
        </section>
      )}

      {counselors.length === 0 ? (
        <div className="card"><StateMessage pose="think" title="No counsellors available right now" body="Please check back soon." /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {counselors.map((c) => (
            <article key={c.id} className="card flex flex-col gap-4 p-6">
              <div className="flex items-start gap-4">
                <Character who="ananya" size={64} />
                <div className="flex flex-1 flex-col gap-1">
                  <h2 className="text-lg font-bold">{c.name}</h2>
                  <p className="text-[15px] text-ink-2">{c.title}</p>
                  <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
                    <span className="inline-flex items-center gap-1"><Star className="h-4 w-4 fill-saffron-500 text-saffron-500" aria-hidden="true" /><strong className="text-ink">{c.rating}</strong> rating</span>
                    <span>{c.experienceYears} years</span>
                    {c.languages?.length > 0 && <span className="inline-flex items-center gap-1"><Languages className="h-4 w-4" aria-hidden="true" />{c.languages.join(', ')}</span>}
                  </p>
                </div>
                <Badge tone="leaf">Verified</Badge>
              </div>
              <p className="leading-relaxed text-ink-2">{c.bio}</p>
              <div className="flex flex-wrap gap-2">{c.specializations?.map((s: string) => <Badge key={s}>{s}</Badge>)}</div>
              {c.degrees?.length > 0 && <p className="text-sm text-ink-3">{c.degrees.join(' · ')}</p>}
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <span><span className="font-display text-2xl font-bold">{formatINR(c.hourlyRateINR)}</span> <span className="text-sm text-ink-3">per hour</span></span>
                <Button onClick={() => setBooking(c)} disabled={!canBook}>See available times</Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {booking && <BookingDialog counselor={booking} onClose={() => setBooking(null)} onBooked={load} />}
    </div>
  );
};
