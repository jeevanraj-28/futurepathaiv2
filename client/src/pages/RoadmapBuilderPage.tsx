import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ApiService } from '../services/api';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Sparkles,
  Download,
  ListTodo,
  Loader2,
  AlertCircle,
  Plus,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const RoadmapBuilderPage: React.FC = () => {
  const location = useLocation();
  const initialCareer = (location.state as any)?.targetCareer || 'AI & Machine Learning Engineer';

  const [roadmaps, setRoadmaps] = useState<any[]>([]);
  const [activeRoadmap, setActiveRoadmap] = useState<any>(null);
  const [targetCareerInput, setTargetCareerInput] = useState(initialCareer);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRoadmaps = async () => {
    try {
      const res = await ApiService.getRoadmaps();
      if (res.success && res.roadmaps) {
        setRoadmaps(res.roadmaps);
        if (res.roadmaps.length > 0) {
          setActiveRoadmap(res.roadmaps[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetCareerInput.trim()) return;

    setGenerating(true);
    setError(null);
    try {
      const res = await ApiService.generateRoadmap(targetCareerInput.trim(), '2028');
      if (res.success && res.roadmap) {
        setActiveRoadmap(res.roadmap);
        await fetchRoadmaps();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleToggleTask = async (milestoneIdx: number, taskIdx: number) => {
    if (!activeRoadmap) return;

    try {
      const res = await ApiService.toggleRoadmapTask(activeRoadmap.id, milestoneIdx, taskIdx);
      if (res.success && res.roadmap) {
        setActiveRoadmap(res.roadmap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Loading strategic milestone checklists...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
              <Calendar className="w-3.5 h-3.5" />
              <span>Execution Timeline</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Personalized Career Roadmap Builder
            </h1>
            <p className="text-xs text-slate-400">
              Track 30-day, 90-day, 1-year, and 3-to-5 year milestones towards your target degree and career.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-xs font-bold rounded-xl glass-panel bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Print Strategy Plan</span>
          </button>
        </div>

        {/* Generate / Switch Target Career Form */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 block">
            Generate Plan for Any Career
          </span>

          <form onSubmit={handleGenerate} className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="e.g. AI & Machine Learning Engineer, Corporate Lawyer, Pilot, CA..."
              value={targetCareerInput}
              onChange={(e) => setTargetCareerInput(e.target.value)}
              className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={generating}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md glow-blue transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Roadmap</span>
            </button>
          </form>

          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Active Roadmap Display */}
        {activeRoadmap ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Current Active Pathway</span>
                <h2 className="text-2xl font-black text-white">{activeRoadmap.careerTitle}</h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRoadmap.milestones?.map((milestone: any, mIdx: number) => {
                const completedTasks = milestone.tasks.filter((t: any) => t.completed).length;
                const totalTasks = milestone.tasks.length;
                const pct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                return (
                  <div
                    key={mIdx}
                    className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          {milestone.period}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          {completedTasks} / {totalTasks} Completed ({pct}%)
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-white">{milestone.title}</h3>

                      {/* Interactive Tasks Checklist */}
                      <div className="space-y-2.5 pt-2">
                        {milestone.tasks.map((taskItem: any, tIdx: number) => (
                          <div
                            key={tIdx}
                            onClick={() => handleToggleTask(mIdx, tIdx)}
                            className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-start gap-3 ${
                              taskItem.completed
                                ? 'bg-emerald-500/10 border-emerald-500/30 text-slate-400 line-through'
                                : 'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-slate-800/40 hover:border-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={taskItem.completed}
                              onChange={() => {}} // handled by parent onClick
                              className="mt-0.5 rounded border-slate-700 text-cyan-500 focus:ring-0"
                            />
                            <span className="leading-relaxed">{taskItem.task}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                      <span>Milestone Progress</span>
                      <strong className="text-cyan-400">{pct}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <ListTodo className="w-10 h-10 mx-auto text-cyan-400" />
            <h3 className="text-base font-bold text-white">No Roadmap Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Choose a career from the box above to generate your customized 30-day and 5-year execution milestones.
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
