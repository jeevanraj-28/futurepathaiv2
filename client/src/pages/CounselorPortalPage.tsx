import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  IndianRupee,
  Star,
  Video,
  ShieldCheck,
  Loader2
} from 'lucide-react';

export const CounselorPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [counselors, setCounselors] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedCounselor, setSelectedCounselor] = useState<any>(null);
  const [slotDate, setSlotDate] = useState('2026-03-20');
  const [slotTime, setSlotTime] = useState('16:00 - 17:00');
  const [notes, setNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

  const fetchCounselorData = async () => {
    try {
      const [cRes, bRes] = await Promise.all([
        ApiService.getCounselors(),
        user ? ApiService.request<{ success: boolean; bookings: any[] }>('/counselors/my-bookings') : Promise.resolve({ success: true, bookings: [] })
      ]);
      if (cRes.success && cRes.counselors) setCounselors(cRes.counselors);
      if (bRes.success && bRes.bookings) setMyBookings(bRes.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounselorData();
  }, [user]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCounselor) return;

    setBookingLoading(true);
    setBookingSuccess(null);
    try {
      const res = await ApiService.bookCounselor({
        counselorId: selectedCounselor.id,
        scheduledDate: slotDate,
        slotTime,
        studentNotes: notes
      });

      if (res.success) {
        setBookingSuccess('Session successfully booked! Meeting link generated.');
        await fetchCounselorData();
        setTimeout(() => {
          setBookingModalOpen(false);
          setBookingSuccess(null);
        }, 1500);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Loading Certified Counselor Network...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Vetted & Certified Practitioners</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            1-on-1 Career Counselor Network
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Connect with certified educational psychologists and career counselors for stream selection, college applications, and tailored roadmap review.
          </p>
        </div>

        {/* Existing Scheduled Sessions */}
        {myBookings.length > 0 && (
          <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>Your Scheduled Consultations ({myBookings.length})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {myBookings.map((b, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Date: {b.scheduledDate}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                      {b.status}
                    </span>
                  </div>
                  <p className="text-slate-400">Time: {b.slotTime} (60 mins)</p>
                  {b.meetingLink && (
                    <a
                      href={b.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-cyan-400 hover:underline pt-1 font-semibold"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Secure Video Consultation</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Counselor Profiles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {counselors.map(c => (
            <div
              key={c.id}
              className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center font-bold text-white text-xl overflow-hidden shadow-md flex-shrink-0">
                    {c.avatarUrl ? (
                      <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      c.name.charAt(0)
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-lg font-bold text-white">{c.name}</h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <p className="text-xs text-cyan-300 font-medium">{c.title}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{c.rating}</span>
                      </span>
                      <span>•</span>
                      <span>{c.experienceYears} Years Exp</span>
                      <span>•</span>
                      <span>Languages: {c.languages?.join(', ')}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed font-normal">
                  {c.bio}
                </p>

                {/* Specializations & Degrees */}
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px] mb-1">Specializations:</span>
                    <div className="flex flex-wrap gap-1">
                      {c.specializations?.map((sp: string, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 text-[11px]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block text-[11px] mb-1">Degrees & Credentials:</span>
                    <p className="text-slate-300 text-[11px]">{c.degrees?.join(' • ')}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Session Fee (60 mins)</span>
                  <span className="text-lg font-bold text-white">₹{c.hourlyRateINR}</span>
                </div>

                <button
                  onClick={() => {
                    setSelectedCounselor(c);
                    setBookingModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors"
                >
                  Book Consultation
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Booking Dialog */}
      {bookingModalOpen && selectedCounselor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl space-y-5">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">Schedule 1-on-1 Consultation</h3>
              <p className="text-xs text-slate-400">
                With {selectedCounselor.name} ({selectedCounselor.title})
              </p>
            </div>

            <form onSubmit={handleBook} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Select Consultation Date:</label>
                <input
                  type="date"
                  value={slotDate}
                  onChange={(e) => setSlotDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Available Time Slot:</label>
                <select
                  value={slotTime}
                  onChange={(e) => setSlotTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                >
                  <option value="16:00 - 17:00">16:00 – 17:00 IST (Evening)</option>
                  <option value="17:00 - 18:00">17:00 – 18:00 IST (Evening)</option>
                  <option value="11:00 - 12:00">11:00 – 12:00 IST (Morning)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">Notes for the Counselor:</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Discussing PCM vs Commerce options, reviewing JEE preparation roadmap..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                />
              </div>

              {bookingSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                  {bookingSuccess}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="font-bold text-white text-sm">Fee: ₹{selectedCounselor.hourlyRateINR}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5"
                  >
                    {bookingLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Confirm & Book</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
