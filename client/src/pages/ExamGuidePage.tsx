import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { EntranceExam } from '../types';
import {
  FileText,
  Search,
  Calendar,
  ExternalLink,
  GraduationCap,
  Layers,
  CheckCircle2
} from 'lucide-react';

export const ExamGuidePage: React.FC = () => {
  const [exams, setExams] = useState<EntranceExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL');

  useEffect(() => {
    ApiService.getEntranceExams({ search: search || undefined, stream: streamFilter }).then(res => {
      if (res.success && res.exams) {
        setExams(res.exams);
      }
    }).finally(() => setLoading(false));
  }, [streamFilter]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <FileText className="w-3.5 h-3.5" />
            <span>National & State Entrance Tests</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Indian Entrance Examination Intelligence
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Essential facts, conducting bodies (NTA, UPSC, Consortium of NLUs), modes, eligibility streams, and official links for major entrance tests across India.
          </p>
        </div>

        {/* Exams List */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">Loading entrance exam data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exams.map(exam => (
              <div
                key={exam.id}
                className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 text-xs font-bold rounded-lg bg-brand-600/30 text-cyan-300 border border-brand-500/30">
                      {exam.name}
                    </span>
                    <span className="text-xs text-slate-400">{exam.examMode}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{exam.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    Conducting Authority: <strong className="text-slate-200">{exam.conductingAuthority}</strong>
                  </p>

                  <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-cyan-400 block">Eligible Degree Programs:</span>
                    <p className="text-[11px] text-slate-400">{exam.eligibleCourses?.join(', ')}</p>
                  </div>

                  <div className="text-xs text-slate-300 space-y-1">
                    <span className="font-semibold text-slate-400">Schedule & Frequency:</span>
                    <p className="text-[11px] text-slate-300">{exam.importantDatesInfo}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">{exam.examFrequency}</span>
                  <a
                    href={exam.officialWebsite}
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
