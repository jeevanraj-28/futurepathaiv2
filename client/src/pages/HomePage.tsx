import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiService } from '../services/api';
import { Career } from '../types';
import {
  Compass,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  IndianRupee,
  Search,
  Layers,
  Award,
  Users,
  Building,
  Target,
  FileText
} from 'lucide-react';

export const HomePage: React.FC<{ onOpenCheckout?: (planCode: string) => void }> = ({ onOpenCheckout }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedClassTab, setSelectedClassTab] = useState<'CLASS_10' | 'CLASS_12'>('CLASS_10');
  const [featuredCareers, setFeaturedCareers] = useState<Career[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    ApiService.getCareers().then(res => {
      if (res.success && res.careers) {
        setFeaturedCareers(res.careers.slice(0, 6));
      }
    }).catch(err => console.error(err));
  }, []);

  const handleMiniSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/careers?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/careers');
    }
  };

  const faqs = [
    {
      q: 'How is FuturePath AI different from generic free online career quizzes?',
      a: 'Most quizzes assign a single arbitrary personality type without explaining why. FuturePath AI measures 16 distinct cognitive, practical, and environmental dimensions, evaluates board prerequisites (CBSE/State Boards), benchmarks against verified government employment data, and separates current readiness from long-term compatibility.'
    },
    {
      q: 'Does this platform decide a student\'s future definitively?',
      a: 'No, and we explicitly reject that premise. Career selection is an evidence-informed decision-making process. FuturePath AI maps possibilities, highlights skill gaps, compares trade-offs, and provides concrete alternative routes so students, parents, and counselors can make informed choices together.'
    },
    {
      q: 'What is the Class 10 Stream Selection Module?',
      a: 'A dedicated diagnostic tool that compares Science (PCM), Science (PCB), Science (PCMB), Commerce (with or without math), Humanities, and Vocational skill streams. It details required subjects, common degree families, career outcomes, and college costs in INR.'
    },
    {
      q: 'How does the Parent Portal work?',
      a: 'Parents can link their account to their child\'s profile with consent. Parents view objective assessment dossiers, stream comparisons, and use our 4-year Higher Education Cost Estimator to plan tuition, living expenses, and entrance exam preparation.'
    },
    {
      q: 'Is student data safe and compliant with Indian regulations?',
      a: 'Yes. We strictly adhere to the Digital Personal Data Protection (DPDP) Act 2023. We never sell identifiable student data to coaching centers or third-party advertisers.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
        {/* Subtle background glow circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Top Pill Announcement */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-brand-500/30 text-xs text-slate-300 shadow-md">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="font-semibold text-cyan-300">New for 2026 Admissions:</span>
              <span>Updated with NEP 2020 Multi-Disciplinary Pathways & NIRF 2025 Data</span>
            </div>
          </div>

          {/* Main Headline */}
          <div className="text-center max-w-4xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
              Transform Career Selection From <span className="bg-gradient-to-r from-brand-400 via-blue-400 to-cyan-300 bg-clip-text text-transparent">Guesswork</span> Into Evidence.
            </h1>

            <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              The AI career intelligence platform built for <strong className="text-white">Classes 10 & 12 in India</strong>. Discover natural strengths, choose the right academic stream, and map 5-year pathways to premier degrees and careers.
            </p>

            {/* Interactive Search Bar Mini Demo */}
            <form onSubmit={handleMiniSearch} className="max-w-xl mx-auto relative pt-2">
              <div className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search 50+ careers: AI Engineer, Commercial Pilot, CA, Doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-32 py-4 rounded-2xl bg-slate-900/90 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 shadow-xl transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5"
                >
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Primary CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/assessment"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl glow-blue transition-all flex items-center justify-center gap-2"
              >
                <Compass className="w-4 h-4 text-cyan-300" />
                <span>Take Free 16-D Assessment</span>
              </Link>
              <Link
                to="/stream-guide"
                className="w-full sm:w-auto px-8 py-4 rounded-xl glass-panel bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>Class 10 Stream Selection Matrix</span>
              </Link>
            </div>

            {/* Credibility badges */}
            <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                50+ Verified Indian Careers
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                CBSE, CISCE & State Boards
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                No Blind Automated Guesswork
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Transparent Explainable Scoring
              </span>
            </div>

          </div>

        </div>
      </section>

      {/* Class 10 vs Class 12 Dual Pathway Journey */}
      <section className="py-16 bg-slate-900/50 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Tailored Guidance for Two Decisive Milestones
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Select your academic stage to experience a customized intelligence pathway.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex p-1.5 rounded-xl bg-slate-950 border border-slate-800 mt-6">
              <button
                onClick={() => setSelectedClassTab('CLASS_10')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  selectedClassTab === 'CLASS_10'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Class 10: Stream Selection
              </button>
              <button
                onClick={() => setSelectedClassTab('CLASS_12')}
                className={`px-6 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  selectedClassTab === 'CLASS_12'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Class 12: Degree & Exam Strategy
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {selectedClassTab === 'CLASS_10' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-cyan-400 flex items-center justify-center border border-blue-500/20 font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">16-Dimension Cognitive Profile</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Go beyond school marks. Evaluate numerical speed, spatial reasoning, verbal ability, and practical trouble-shooting to identify true cognitive affinity.
                </p>
                <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                  <span>Covers 40 validated questions</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Stream Compatibility Matrix</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Compare Science (PCM), Science (PCB), Commerce, and Humanities. View trade-offs, required study stamina, degree options, and future mobility before locking in.
                </p>
                <div className="text-xs text-emerald-300 font-semibold flex items-center gap-1">
                  <span>Transparent pros & trade-offs</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20 font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Personalized 90-Day Transition</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Get a week-by-week action checklist for bridge courses, foundation books (NCERT + Olympiad), and discussion questions for parents and teachers.
                </p>
                <div className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <span>Concrete task roadmaps</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 font-bold">
                  01
                </div>
                <h3 className="text-lg font-bold text-white">Degree & College Matching</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Match your stream and marks against 50+ degree programs across Engineering, Medicine, Law, Design, Commerce, and Defense services.
                </p>
                <div className="text-xs text-cyan-300 font-semibold flex items-center gap-1">
                  <span>NIRF ranked colleges & official fees</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20 font-bold">
                  02
                </div>
                <h3 className="text-lg font-bold text-white">Entrance Exam Intelligence</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Track dates, syllabus blueprints, and cutoff dynamics for JEE, NEET, CUET, CLAT, UCEED, and state CETs without falling for false coaching hype.
                </p>
                <div className="text-xs text-indigo-300 font-semibold flex items-center gap-1">
                  <span>Official testing body information</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 font-bold">
                  03
                </div>
                <h3 className="text-lg font-bold text-white">Scholarships & Cost Planning</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Discover government and merit scholarships (INSPIRE, Central Sector, PMSS) and calculate realistic 4-year financial costs for your family.
                </p>
                <div className="text-xs text-rose-300 font-semibold flex items-center gap-1">
                  <span>Financial planning & alerts</span>
                </div>
              </div>
            </div>
          )}

        </div>
      </section>

      {/* Featured 50+ Structured Careers Spotlight */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
              Structured Indian Career Database
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Explore 50+ Curated Pathways
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
              Each career includes required Class 12 subjects, entry qualifications, verified salary ranges in LPA, top institutions, and entrance examinations.
            </p>
          </div>
          <Link
            to="/careers"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
          >
            <span>View All 50+ Careers</span>
            <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Career Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCareers.map(career => (
            <div
              key={career.id}
              className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-1 group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-brand-500/20 text-cyan-400 border border-brand-500/30">
                    {career.category}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    Stream: <strong className="text-slate-200">{career.stream}</strong>
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {career.title}
                </h3>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {career.shortDescription}
                </p>

                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-800/80">
                  <div className="text-slate-400">
                    <span>Salary: </span>
                    <strong className="text-emerald-400">
                      ₹{(career.salaryMinINR / 100000).toFixed(1)}L - ₹{(career.salaryMaxINR / 100000).toFixed(1)}L
                    </strong>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    Demand: {career.futureDemand}
                  </span>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Exams: {career.entranceExams?.slice(0, 2).join(', ')}
                </span>
                <Link
                  to={`/careers/${career.slug}`}
                  className="text-xs font-bold text-cyan-400 hover:underline flex items-center gap-1"
                >
                  <span>Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* The 16-Dimension Assessment Showcase */}
      <section className="py-20 bg-slate-900/40 border-y border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            <div className="space-y-6">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Cognitive & Psychometric Architecture
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
                Not a 5-minute quiz. A genuine 16-dimension intelligence engine.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                Ordinary tests reduce a child to a single personality label like "INTJ" or "Creative". FuturePath AI breaks down capability across 16 critical cognitive, practical, and environmental vectors:
              </p>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 pt-2">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Numerical Reasoning</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Logical & Deductive Logic</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Verbal & Semantic Nuance</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Spatial 3D Visualization</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Scientific & Empirical Drive</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Practical Problem Solving</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Creative Lateral Thinking</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span>Risk Tolerance & Values</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/assessment"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md glow-blue transition-all"
                >
                  <span>Start the 40-Question Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visual Diagnostic Preview Card */}
            <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-700 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                    Sample Diagnostic Result
                  </span>
                  <h4 className="text-base font-bold text-white">Cognitive Dimension Breakdown</h4>
                </div>
                <span className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Reliability: 96%
                </span>
              </div>

              {/* Progress Bar Indicators */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Logical Reasoning</span>
                    <span className="font-bold text-cyan-400">92%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Scientific Thinking</span>
                    <span className="font-bold text-cyan-400">90%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: '90%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Numerical Reasoning</span>
                    <span className="font-bold text-cyan-400">88%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-300 mb-1">
                    <span>Spatial 3D Reasoning</span>
                    <span className="font-bold text-cyan-400">82%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-brand-500 to-cyan-400 rounded-full" style={{ width: '82%' }}></div>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white block">Explainable Rationale:</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Student demonstrates top decile aptitude for quantitative deduction and empirical modeling. Highly aligned with Science PCM leading to AI & Robotics Systems or Aerospace Engineering.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Teaser Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-1">
            Simple, Transparent Indian Pricing
          </span>
          <h2 className="text-3xl font-extrabold text-white">Invest in Their Future With Clarity</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            No hidden subscriptions or predatory auto-charges. All plans priced in INR.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Free Explorer */}
          <div className="p-8 rounded-2xl glass-card bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Explorer</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹0</span>
                <span className="text-xs text-slate-400">/ forever</span>
              </div>
              <p className="text-xs text-slate-400">Ideal for students exploring initial options and trying the diagnostic.</p>
              
              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Student profile & academic tracker</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Basic assessment sample trial</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Top 3 career recommendations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Public college & exam directory</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/register"
                className="w-full block text-center py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Get Started Free
              </Link>
            </div>
          </div>

          {/* Premium Student */}
          <div className="p-8 rounded-2xl glass-card bg-gradient-to-b from-slate-900 via-slate-900 to-brand-950/40 border-2 border-brand-500 shadow-2xl relative flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-gradient-to-r from-brand-600 to-cyan-500 text-white font-bold text-[10px] tracking-wider uppercase shadow-md">
              Most Popular in India
            </div>

            <div className="space-y-4">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Premium Student</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹999</span>
                <span className="text-xs text-slate-400">/ annual</span>
              </div>
              <p className="text-xs text-slate-400">Complete career intelligence suite for Class 10 & 12 students.</p>

              <ul className="space-y-2.5 text-xs text-slate-200 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Full 40-question 16-D assessment</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Multi-factor compatibility for all 50+ careers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Personalized 30-day & 5-year roadmap builder</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>AI Career Mentor chat guidance</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Downloadable High-Res PDF Career Dossier</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenCheckout ? onOpenCheckout('PREMIUM_STUDENT') : navigate('/pricing')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-cyan-500 hover:from-brand-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg glow-blue transition-all"
              >
                Upgrade to Premium (₹999)
              </button>
            </div>
          </div>

          {/* Premium Plus / Family */}
          <div className="p-8 rounded-2xl glass-card bg-slate-900 border border-slate-800 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Premium Plus & Family</span>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white">₹2,499</span>
                <span className="text-xs text-slate-400">/ annual</span>
              </div>
              <p className="text-xs text-slate-400">Holistic strategy with dedicated Parent Portal and cost planning.</p>

              <ul className="space-y-2.5 text-xs text-slate-300 pt-4 border-t border-slate-800">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Everything in Premium Student</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>Dedicated Parent Dashboard with consent</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>4-Year Higher Education Cost Estimator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <span>20% Discount on certified counselor sessions</span>
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <button
                onClick={() => onOpenCheckout ? onOpenCheckout('PREMIUM_PLUS') : navigate('/pricing')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
              >
                Select Premium Plus
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-20 bg-slate-900/30 border-t border-slate-800/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Frequently Asked Questions
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Everything you need to know about our evidence-informed methodology.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  className="w-full p-4 text-left flex items-center justify-between text-sm font-bold text-slate-200 hover:text-white"
                >
                  <span>{faq.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${
                      activeFaq === i ? 'rotate-90 text-cyan-400' : ''
                    }`}
                  />
                </button>
                {activeFaq === i && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Conversion Banner */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-14 bg-gradient-to-r from-brand-900 via-blue-900 to-slate-900 border border-brand-500/30 shadow-2xl relative overflow-hidden text-center space-y-6">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Ready to Build a Clear, Confident Future?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of students and parents making evidence-backed education decisions with FuturePath AI.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/assessment"
              className="px-8 py-3.5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-sm shadow-xl transition-all"
            >
              Take Free Assessment
            </Link>
            <Link
              to="/careers"
              className="px-8 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white border border-slate-700 font-bold text-sm transition-all"
            >
              Browse 50+ Careers
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
