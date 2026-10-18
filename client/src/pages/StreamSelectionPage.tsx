import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  IndianRupee,
  Layers,
  GraduationCap,
  Sparkles
} from 'lucide-react';

export const StreamSelectionPage: React.FC = () => {
  const [streams, setStreams] = useState<any[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>(['PCM', 'PCB']);

  useEffect(() => {
    ApiService.getStreamGuide().then(res => {
      if (res.success && res.streams) {
        setStreams(res.streams);
      }
    });
  }, []);

  const toggleCompare = (streamId: string) => {
    if (selectedForCompare.includes(streamId)) {
      if (selectedForCompare.length > 1) {
        setSelectedForCompare(selectedForCompare.filter(id => id !== streamId));
      }
    } else {
      if (selectedForCompare.length < 3) {
        setSelectedForCompare([...selectedForCompare, streamId]);
      } else {
        setSelectedForCompare([selectedForCompare[1], selectedForCompare[2], streamId]);
      }
    }
  };

  const comparedStreams = streams.filter(s => selectedForCompare.includes(s.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header */}
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Class 10 Decision Architecture</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Class 10 Stream Selection Intelligence
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Selecting your Class 11 stream is an exploratory step, not a life sentence. Compare CBSE, CISCE, and State Board academic streams side by side with objective pros, trade-offs, college degrees, and career families.
          </p>
        </div>

        {/* Stream Selector Chips */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Select 2 or 3 Streams to Compare Side-by-Side:
            </span>
            <span className="text-xs text-cyan-400 font-semibold">
              Comparing ({selectedForCompare.length} / 3)
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {streams.map(s => {
              const active = selectedForCompare.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggleCompare(s.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    active
                      ? 'bg-brand-600 text-white border-brand-500 shadow-md'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${active ? 'bg-cyan-300' : 'bg-slate-600'}`}></span>
                  <span>{s.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Side-by-Side Comparison Matrix */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {comparedStreams.map(st => (
            <div
              key={st.id}
              className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-6 flex flex-col justify-between"
            >
              <div className="space-y-5">
                <div>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-cyan-400 border border-brand-500/30">
                    {st.badge}
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">{st.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{st.suitedFor}</p>
                </div>

                {/* Core Subjects */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-300 block">Core Subjects:</span>
                  <div className="flex flex-wrap gap-1">
                    {st.coreSubjects.map((sub: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-medium">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Degree Pathways */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-300 block">Common Degree Pathways:</span>
                  <ul className="space-y-1 text-slate-300">
                    {st.majorDegrees.map((deg: string, i: number) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span>{deg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Key Entrance Exams */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-300 block">Key Entrance Exams:</span>
                  <div className="flex flex-wrap gap-1">
                    {st.keyExams.map((exam: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {exam}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Pros & Trade-offs */}
                <div className="space-y-2 text-xs pt-3 border-t border-slate-800">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{st.pros}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{st.cons}</span>
                  </div>
                </div>

                {/* Cost range */}
                <div className="text-xs text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800">
                  <span>Higher Ed Cost Range:</span>
                  <strong className="text-white">{st.costRangeINR}</strong>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800">
                <Link
                  to={`/careers?stream=${st.id}`}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Explore {st.id} Careers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Assessment Callout Banner */}
        <div className="p-8 rounded-2xl glass-panel bg-gradient-to-r from-brand-950/60 via-slate-900 to-slate-900 border border-brand-500/30 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Uncertain which stream matches your cognitive stamina?</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              Take our 40-question 16-dimension assessment. We benchmark numerical, spatial, and deductive traits to reveal your natural stream affinity before admission forms close.
            </p>
          </div>
          <Link
            to="/assessment"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md glow-blue transition-all whitespace-nowrap flex items-center gap-2"
          >
            <Compass className="w-4 h-4" />
            <span>Launch Stream Diagnostic</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
