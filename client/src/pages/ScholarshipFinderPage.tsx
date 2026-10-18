import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Scholarship } from '../types';
import {
  Award,
  Search,
  IndianRupee,
  Calendar,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

export const ScholarshipFinderPage: React.FC = () => {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getScholarships({ search: search || undefined });
      if (res.success && res.scholarships) {
        setScholarships(res.scholarships);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScholarships();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <Award className="w-3.5 h-3.5" />
            <span>Government & Merit Grants</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Higher Education Scholarship Finder
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Verified scholarships from the Ministry of Education, Department of Science & Technology, AICTE, and national trusts to finance undergraduate education.
          </p>
        </div>

        {/* Scholarships List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading verified scholarship schemes...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scholarships.map(sc => (
              <div
                key={sc.id}
                className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      {sc.benefitAmount}
                    </span>
                    <span className="text-[11px] text-slate-400">Verified {sc.lastVerifiedDate}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{sc.name}</h3>
                  <p className="text-xs text-cyan-300 font-medium">Provider: {sc.provider}</p>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-slate-400 block">Eligibility:</span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{sc.eligibility}</p>
                  </div>

                  {sc.incomeCeiling && (
                    <div className="text-xs text-slate-400">
                      <span>Income Limit: </span>
                      <strong className="text-white">{sc.incomeCeiling}</strong>
                    </div>
                  )}

                  <div className="text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">Required Documents: </span>
                    <span>{sc.requiredDocs?.join(', ')}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{sc.deadlineText}</span>
                  <a
                    href={sc.officialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Apply on Portal</span>
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
