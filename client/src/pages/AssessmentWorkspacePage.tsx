import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { AssessmentQuestion } from '../types';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  HelpCircle,
  Layers,
  Save
} from 'lucide-react';

export const AssessmentWorkspacePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load local stored draft responses if available
    const savedDraft = localStorage.getItem('futurepath_assessment_draft');
    if (savedDraft) {
      try {
        setResponses(JSON.parse(savedDraft));
      } catch (e) {}
    }

    ApiService.getQuestions().then(res => {
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
    }).catch(err => {
      setError('Failed to load assessment question bank');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const handleSelectOption = (optionIndex: number) => {
    if (!questions[currentIndex]) return;
    const qId = questions[currentIndex].id;
    const newResponses = { ...responses, [qId]: optionIndex };
    setResponses(newResponses);
    localStorage.setItem('futurepath_assessment_draft', JSON.stringify(newResponses));

    // Auto-advance after selection if not last question
    if (currentIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 250);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // If not logged in, prompt user to login/register or demo login
    if (!user) {
      navigate('/login?redirect=/assessment');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const res = await ApiService.submitAssessment(responses);
      if (res.success) {
        localStorage.removeItem('futurepath_assessment_draft');
        navigate('/assessment/results');
      }
    } catch (err: any) {
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-sm">Loading 16-Dimension Cognitive Assessment...</p>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;
  const answeredCount = Object.keys(responses).length;
  const isCurrentAnswered = currentQ && responses[currentQ.id] !== undefined;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
        
        {/* Top Assessment Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-brand-600/20 text-cyan-400 flex items-center justify-center border border-brand-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">16-Dimension Cognitive & Aptitude Engine</h1>
              <p className="text-xs text-slate-400">Question {currentIndex + 1} of {questions.length} • {answeredCount} Answered</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-cyan-400">{progressPercent}% Completed</span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-600 via-blue-500 to-cyan-400 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Question Card */}
        {currentQ && (
          <div className="p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl space-y-6 animate-fade-in">
            
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-brand-500/10 text-cyan-400 border border-brand-500/20 uppercase tracking-wider">
                Category: {currentQ.category}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Dimension: <strong className="text-slate-200">{currentQ.dimension}</strong>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-relaxed">
              {currentQ.prompt}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3 pt-2">
              {currentQ.options.map((option, idx) => {
                const isSelected = responses[currentQ.id] === idx;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'border-cyan-400 bg-cyan-500/10 text-white shadow-md'
                        : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <span className="leading-relaxed">{option.text}</span>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border mt-0.5 ${
                      isSelected
                        ? 'bg-cyan-400 border-cyan-400 text-slate-950 font-bold text-xs'
                        : 'border-slate-700'
                    }`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 ${
              currentIndex === 0
                ? 'opacity-40 cursor-not-allowed border-slate-800 text-slate-600'
                : 'border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Skip / Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : null}

            {answeredCount >= 5 && (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-500 hover:from-emerald-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg glow-blue transition-all flex items-center gap-2"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Evaluate & Reveal My Dossier ({answeredCount} Qs)</span>
              </button>
            )}
          </div>
        </div>

        {/* Save Draft Notification */}
        <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span>Responses auto-save automatically in your browser draft</span>
        </div>

      </div>
    </div>
  );
};
