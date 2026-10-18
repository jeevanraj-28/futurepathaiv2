import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  TrendingUp,
  Download,
  Share2,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Shield,
  IndianRupee,
  Layers,
  Award
} from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const AssessmentResultsPage: React.FC = () => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    ApiService.getAssessmentResults().then(res => {
      if (res.success && res.result) {
        setResult(res.result);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Synthesizing 16-Dimension Career Dossier...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4 space-y-4">
        <Compass className="w-12 h-12 text-cyan-400" />
        <h2 className="text-xl font-bold text-white">No Assessment Completed Yet</h2>
        <p className="text-xs text-slate-400 max-w-sm">Take the 40-question cognitive assessment to unlock your personalized results.</p>
        <Link to="/assessment" className="px-6 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Take Assessment
        </Link>
      </div>
    );
  }

  // Format Recharts data for radar chart
  const radarData = Object.entries(result.dimensionScores || {}).map(([dim, score]) => ({
    dimension: dim.length > 14 ? dim.slice(0, 12) + '..' : dim,
    fullDimension: dim,
    score: score as number
  }));

  // Format Stream Readiness Bar Data
  const readinessData = Object.entries(result.readinessProfile || {}).map(([stream, pct]) => ({
    stream,
    suitability: pct as number
  }));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Assessment Verified & Scored</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Evidence-Informed Career Dossier
            </h1>
            <p className="text-xs text-slate-400">
              Completed on {new Date(result.completedAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })} • Explainable 16-Dimension Synthesis
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 text-xs font-bold rounded-xl glass-panel bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / Save Dossier</span>
            </button>
            <Link
              to="/roadmap"
              className="px-5 py-2 text-xs font-bold rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-md glow-blue transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>Create 5-Year Roadmap</span>
            </Link>
          </div>
        </div>

        {/* Executive Summary Card */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-700 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Executive Cognitive Summary
          </h2>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {result.summaryReport}
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="text-xs text-slate-400 font-semibold self-center">Primary Strengths:</span>
            {result.strengthProfile?.map((str: string, i: number) => (
              <span key={i} className="px-2.5 py-1 text-xs font-bold rounded-lg bg-brand-500/20 text-cyan-300 border border-brand-500/30">
                {str}
              </span>
            ))}
          </div>
        </div>

        {/* Multi-Dimensional Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Radar Chart (16 Dimensions) */}
          <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">16-Dimension Cognitive Radar</h3>
              <p className="text-xs text-slate-400">Aptitude, problem-solving style, and work preferences across normalized 0-100 scales.</p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="dimension" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                  <Radar
                    name="Score"
                    dataKey="score"
                    stroke="#06b6d4"
                    fill="#0284c7"
                    fillOpacity={0.45}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#38bdf8' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stream Readiness Bar Chart */}
          <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Stream Readiness Breakdown</h3>
              <p className="text-xs text-slate-400">Evaluates alignment of current cognitive profile against requirements of major Indian academic streams.</p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={readinessData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                  <XAxis type="number" domain={[0, 100]} stroke="#475569" />
                  <YAxis type="category" dataKey="stream" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 11 }} width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Bar dataKey="suitability" fill="#2563eb" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
              💡 <strong>Note on Eligibility vs Suitability:</strong> High stream suitability indicates your natural strengths align well. Eligibility depends strictly on board cutoffs and prerequisites.
            </div>
          </div>

        </div>

        {/* Explainable Top Career Recommendations */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Top Explainable Career Matches</h2>
              <p className="text-xs text-slate-400 mt-1">Multi-factor compatibility based on your strengths, favourite subjects, and work values.</p>
            </div>
            <Link to="/careers" className="text-xs font-bold text-cyan-400 hover:underline">
              View All 50+ Careers
            </Link>
          </div>

          <div className="space-y-4">
            {result.recommendations?.map((rec: any, idx: number) => (
              <div
                key={idx}
                className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-brand-600/30 text-cyan-300 font-bold text-xs flex items-center justify-center">
                        #{idx + 1}
                      </span>
                      <h3 className="text-lg font-bold text-white">{rec.title}</h3>
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-800 text-slate-300">
                        {rec.category} • Stream: {rec.stream}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 max-w-2xl">{rec.shortDescription}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="inline-flex items-baseline gap-1 px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                      <span className="text-2xl font-black">{rec.matchScore}%</span>
                      <span className="text-xs font-semibold">Match</span>
                    </div>
                  </div>
                </div>

                {/* Why it matches narrative */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Why This Career Fits You
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{rec.whyItMatches}</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" />
                      Areas Where Additional Development Helps
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">{rec.areasToDevelop}</p>
                  </div>
                </div>

                {/* Suggested Action Steps */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400 gap-3">
                  <div>
                    <span className="font-semibold text-slate-300">Next Action: </span>
                    <span>{rec.suggestedNextSteps[0] || 'Review syllabus for primary entrance test'}</span>
                  </div>

                  <button
                    onClick={() => navigate('/roadmap', { state: { targetCareer: rec.title } })}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs flex items-center gap-1 self-start sm:self-auto transition-colors"
                  >
                    <span>Generate Milestone Roadmap</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
