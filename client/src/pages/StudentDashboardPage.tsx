import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  BookOpen,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Bookmark,
  ShieldCheck,
  ArrowRight,
  MessageSquare,
  FileText,
  User,
  ListTodo
} from 'lucide-react';

export const StudentDashboardPage: React.FC<{ onOpenCheckout?: (planCode: string) => void }> = ({ onOpenCheckout }) => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ApiService.getStudentDashboard().then(res => {
      if (res.success && res.dashboard) {
        setDashboard(res.dashboard);
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
        <p className="text-sm">Loading your Student Intelligence Workspace...</p>
      </div>
    );
  }

  const completionScore = dashboard?.completionScore || 40;
  const isPremium = subscription?.planCode !== 'FREE';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Welcome back, {user?.name}
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                {dashboard?.currentClass === 'CLASS_10' ? 'Class 10 (Secondary)' : 'Class 12 (Senior)'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Board: {dashboard?.board || 'CBSE'} • Active Strategy Workspace
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/ai-mentor"
              className="px-4 py-2.5 rounded-xl glass-panel bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-300 font-bold text-xs flex items-center gap-2 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Career Mentor</span>
            </Link>

            <Link
              to="/assessment"
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue transition-colors flex items-center gap-2"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{dashboard?.assessmentCompleted ? 'Retake 16-D Assessment' : 'Take 16-D Assessment'}</span>
            </Link>
          </div>
        </div>

        {/* Profile Completion Bar Banner */}
        <div className="p-4 rounded-xl glass-panel bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600/20 text-cyan-400 flex items-center justify-center font-bold text-sm border border-brand-500/30">
              {completionScore}%
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Profile Readiness Score</h4>
              <p className="text-[11px] text-slate-400">
                {completionScore >= 80 ? 'Profile comprehensive for accurate AI matching' : 'Add your favourite subjects and marks to sharpen recommendations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-full sm:w-48 h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full"
                style={{ width: `${completionScore}%` }}
              />
            </div>
            <Link
              to="/onboarding"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 whitespace-nowrap"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (2 Cols): Recommendations & Roadmap */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Top Recommended Careers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Your Top Matched Pathways</h3>
                  <p className="text-xs text-slate-400">Synthesized from your cognitive strengths & subject preferences.</p>
                </div>
                <Link to="/assessment/results" className="text-xs font-bold text-cyan-400 hover:underline">
                  View Full Dossier
                </Link>
              </div>

              {dashboard?.topRecommendations && dashboard.topRecommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {dashboard.topRecommendations.slice(0, 4).map((rec: any, i: number) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-cyan-400 border border-brand-500/30">
                            {rec.category}
                          </span>
                          <span className="text-xs font-black text-cyan-300">{rec.matchScore}% Match</span>
                        </div>
                        <h4 className="text-base font-bold text-white">{rec.title}</h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{rec.whyItMatches}</p>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Stream: <strong className="text-slate-200">{rec.stream}</strong></span>
                        <Link
                          to={`/careers/${rec.slug}`}
                          className="font-bold text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          <span>Explore</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
                  <Compass className="w-8 h-8 mx-auto text-cyan-400" />
                  <p className="text-sm font-semibold text-slate-300">Complete the 16-D assessment to generate explainable career matches.</p>
                  <Link to="/assessment" className="inline-block px-4 py-2 bg-brand-600 text-white rounded-lg text-xs font-bold">
                    Start Assessment
                  </Link>
                </div>
              )}
            </div>

            {/* Active Roadmap & Milestones */}
            <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    Active Strategy Roadmap
                  </span>
                  <h3 className="text-lg font-bold text-white">
                    {dashboard?.activeRoadmap?.careerTitle || 'Class 10-12 Career Preparation'}
                  </h3>
                </div>
                <Link
                  to="/roadmap"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  <ListTodo className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Checklist</span>
                </Link>
              </div>

              {dashboard?.activeRoadmap ? (
                <div className="space-y-4">
                  {dashboard.activeRoadmap.milestones.slice(0, 2).map((m: any, mIdx: number) => (
                    <div key={mIdx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-cyan-400">{m.period}</span>
                        <span className="text-slate-300">{m.title}</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-300">
                        {m.tasks.slice(0, 3).map((t: any, tIdx: number) => (
                          <div key={tIdx} className="flex items-center gap-2">
                            <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${
                              t.completed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'border border-slate-700'
                            }`}>
                              {t.completed ? '✓' : ''}
                            </span>
                            <span className={t.completed ? 'line-through text-slate-500' : ''}>{t.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-xs text-slate-400">
                  <p>No active roadmap generated yet.</p>
                  <Link to="/roadmap" className="text-cyan-400 font-bold hover:underline mt-1 inline-block">
                    Build Your 90-Day Plan
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Quick Stats & Entitlements */}
          <div className="space-y-6">
            
            {/* Subscription & Entitlements Card */}
            <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">Active Membership</span>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-cyan-300 border border-brand-500/30">
                  {subscription?.planName || 'Free Explorer'}
                </span>
              </div>

              {!isPremium ? (
                <div className="space-y-3 pt-2">
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Unlock full 40-question psychometric report, AI mentor queries, 5-year roadmap builder, and downloadable PDF career dossiers.
                  </p>
                  <button
                    onClick={() => onOpenCheckout ? onOpenCheckout('PREMIUM_STUDENT') : navigate('/pricing')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md glow-blue transition-all"
                  >
                    Upgrade to Premium (₹999/yr)
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>All Premium features, reports & AI mentor active.</span>
                </div>
              )}
            </div>

            {/* Quick Links & Resources */}
            <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Guidance Directory</h4>
              
              <Link to="/stream-guide" className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors">
                <span className="text-slate-200">Class 10 Stream Selection Guide</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/colleges" className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors">
                <span className="text-slate-200">NIRF Top Colleges Directory</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/scholarships" className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors">
                <span className="text-slate-200">Central Sector Scholarships</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link to="/counselors" className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between transition-colors">
                <span className="text-slate-200">Book 1-on-1 Counselor Session</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
