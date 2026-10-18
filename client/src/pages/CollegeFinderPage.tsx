import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { College } from '../types';
import {
  Building,
  Search,
  MapPin,
  Award,
  IndianRupee,
  ExternalLink,
  Bookmark,
  GraduationCap
} from 'lucide-react';

export const CollegeFinderPage: React.FC = () => {
  const [colleges, setColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');

  const states = ['ALL', 'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Gujarat', 'Rajasthan'];

  const fetchColleges = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getColleges({
        search: search || undefined,
        state: selectedState
      });
      if (res.success && res.colleges) {
        setColleges(res.colleges);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColleges();
  }, [selectedState]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <Building className="w-3.5 h-3.5" />
            <span>Verified Institutions</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Indian College & University Finder
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Search premier institutions across India with verified NIRF rankings, fee structures in INR, admission entrance tests, and official links.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-4">
          <form onSubmit={(e) => { e.preventDefault(); fetchColleges(); }} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by college name, city or admission exam (e.g. IIT Bombay, AIIMS, CUET)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-28 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-lg bg-brand-600 text-white font-bold text-xs"
            >
              Filter
            </button>
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-semibold">State:</span>
            {states.map(st => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedState === st
                    ? 'bg-brand-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading verified institutions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {colleges.map(col => (
              <div
                key={col.id}
                className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      {col.nirfRank && (
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          NIRF Rank #{col.nirfRank}
                        </span>
                      )}
                      <h3 className="text-lg font-bold text-white mt-1.5">{col.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{col.city}, {col.state} • {col.accreditation}</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <span className="font-semibold text-slate-400">Featured Courses:</span>
                    <div className="flex flex-wrap gap-1">
                      {col.courses?.map((c, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Annual Fee Estimate</span>
                      <span className="font-bold text-emerald-400">
                        ₹{(col.feeMinINR / 1000).toLocaleString('en-IN')}k – ₹{(col.feeMaxINR / 100000).toFixed(1)}L
                      </span>
                    </div>
                    <span className="text-slate-300">
                      Admission: <strong className="text-cyan-400">{col.admissionRoute}</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Verified: {col.verifiedDate}</span>
                  <a
                    href={col.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Official Portal</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
