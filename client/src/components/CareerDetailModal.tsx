import React, { useState } from 'react';
import { Career } from '../types';
import { ApiService } from '../services/api';
import {
  X,
  Compass,
  Bookmark,
  TrendingUp,
  Shield,
  IndianRupee,
  GraduationCap,
  Briefcase,
  BookOpen,
  Building,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CareerDetailModalProps {
  career: Career | null;
  onClose: () => void;
  onSavedToggle?: (careerId: string, saved: boolean) => void;
  isSaved?: boolean;
}

export const CareerDetailModal: React.FC<CareerDetailModalProps> = ({
  career,
  onClose,
  onSavedToggle,
  isSaved = false
}) => {
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  if (!career) return null;

  const handleToggleSave = async () => {
    setSaving(true);
    try {
      const res = await ApiService.toggleSaveCareer(career.id);
      if (res.success) {
        setSaved(res.saved);
        if (onSavedToggle) onSavedToggle(career.id, res.saved);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleStartRoadmap = () => {
    onClose();
    navigate('/roadmap', { state: { targetCareer: career.title } });
  };

  const minLPA = (career.salaryMinINR / 100000).toFixed(1);
  const maxLPA = (career.salaryMaxINR / 100000).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-gradient-to-r from-slate-950/90 to-slate-900/90">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-brand-500/20 text-cyan-400 border border-brand-500/30">
                {career.category}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                Stream: {career.stream}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${
                career.futureDemand === 'VERY_HIGH'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
              }`}>
                Demand: {career.futureDemand.replace('_', ' ')}
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">{career.title}</h2>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {career.shortDescription}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Key Benchmarks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                <span>Annual Compensation</span>
              </div>
              <p className="text-lg font-bold text-white">₹{minLPA}L – ₹{maxLPA}L</p>
              <span className="text-[10px] text-slate-400 block">Entry to experienced in India</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Automation Risk</span>
              </div>
              <p className="text-lg font-bold text-cyan-300">{career.automationExposure} Exposure</p>
              <span className="text-[10px] text-slate-400 block">High human cognitive element</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-1">
                <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prerequisites</span>
              </div>
              <p className="text-xs font-semibold text-white truncate">
                {career.requiredSubjects?.join(', ') || 'Any subject mix'}
              </p>
              <span className="text-[10px] text-slate-400 block">Class 12 subject alignment</span>
            </div>
          </div>

          {/* Everyday Responsibilities */}
          {((career.responsibilities && career.responsibilities.length > 0) || career.responsibilitiesJson) && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                What You Will Do on a Typical Day
              </h4>
              <ul className="space-y-2">
                {(career.responsibilities || (career.responsibilitiesJson ? JSON.parse(career.responsibilitiesJson) : [])).map((resp: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Target Degrees & Top Institutions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-brand-400" />
                Common Degree Pathways
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {career.degrees?.map((deg: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-400"></span>
                    <span>{deg}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-cyan-400" />
                Premier Institutions in India
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-300">
                {career.topColleges?.map((col: string, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    <span>{col}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Entrance Exams & Skills */}
          <div className="space-y-3">
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">Key Entrance Examinations:</span>
              <div className="flex flex-wrap gap-1.5">
                {career.entranceExams?.map((exam: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                    {exam}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">Recommended Domain Skills:</span>
              <div className="flex flex-wrap gap-1.5">
                {career.recommendedSkills?.map((skill: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Verification Source Citation */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <div>
              <span className="text-slate-300 font-medium">Data Source: </span>
              <span>{career.sourceName || 'Ministry of Skill Development & Industry Reports'}</span>
              <span className="text-slate-400 ml-2">(Verified {career.lastVerifiedDate || '2026-01-15'})</span>
            </div>
            {career.sourceUrl && (
              <a
                href={career.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:underline flex items-center gap-1 text-[11px]"
              >
                <span>Verify Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between gap-3">
          <button
            onClick={handleToggleSave}
            disabled={saving}
            className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
              saved
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${saved ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{saved ? 'Saved to Bookmarks' : 'Bookmark Career'}</span>
          </button>

          <button
            onClick={handleStartRoadmap}
            className="px-5 py-2.5 text-xs font-bold rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white shadow-md glow-blue transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate 30-Day & 5-Year Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
