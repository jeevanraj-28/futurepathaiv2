import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { Career } from '../types';
import { CareerDetailModal } from '../components/CareerDetailModal';
import {
  Search,
  Filter,
  Briefcase,
  IndianRupee,
  Shield,
  ArrowRight,
  Sparkles,
  BookOpen,
  Scale,
  Cpu,
  Heart,
  Palette,
  Plane,
  Building,
  CheckCircle2
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

export const CareerExplorerPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';

  const [careers, setCareers] = useState<Career[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [selectedStream, setSelectedStream] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDemand, setSelectedDemand] = useState<string>('');
  const [selectedCareer, setSelectedCareer] = useState<Career | null>(null);

  const streams = [
    { id: 'ALL', label: 'All Streams' },
    { id: 'PCM', label: 'Science (PCM)' },
    { id: 'PCB', label: 'Science (PCB)' },
    { id: 'PCMB', label: 'Science (PCMB)' },
    { id: 'COMMERCE', label: 'Commerce' },
    { id: 'HUMANITIES', label: 'Humanities' },
    { id: 'ANY', label: 'Open to Any Stream' }
  ];

  const categories = [
    'ALL',
    'Computing/AI',
    'Engineering',
    'Medical',
    'Healthcare',
    'Commerce',
    'Law',
    'Design',
    'Humanities',
    'Aviation',
    'Defence',
    'Applied Science'
  ];

  const fetchCareers = async () => {
    setLoading(true);
    try {
      const res = await ApiService.getCareers({
        search: search || undefined,
        stream: selectedStream,
        category: selectedCategory,
        demand: selectedDemand || undefined
      });
      if (res.success && res.careers) {
        setCareers(res.careers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCareers();
  }, [selectedStream, selectedCategory, selectedDemand]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCareers();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="max-w-3xl mb-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
            <Briefcase className="w-3.5 h-3.5" />
            <span>50+ Structured Pathways</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Indian Career Intelligence Explorer
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Discover verified career options tailored to CBSE, CISCE, and state curriculum streams. Benchmark real salary ranges, entrance examinations, required subjects, and future demand indicators.
          </p>
        </div>

        {/* Filter Controls & Search */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-xl space-y-5 mb-8">
          
          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search careers by title, skills or keywords (e.g. Machine Learning, CA, Surgeon, Pilot)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-28 py-3.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs"
            >
              Search
            </button>
          </form>

          {/* Stream Tabs */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">Filter by Academic Stream:</span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {streams.map(st => (
                <button
                  key={st.id}
                  onClick={() => setSelectedStream(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    selectedStream === st.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Dropdown & Demand Pills */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-slate-200 text-xs focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Future Demand:</span>
              <button
                onClick={() => setSelectedDemand(selectedDemand === 'VERY_HIGH' ? '' : 'VERY_HIGH')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  selectedDemand === 'VERY_HIGH'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                Very High
              </button>
              <button
                onClick={() => setSelectedDemand(selectedDemand === 'HIGH' ? '' : 'HIGH')}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors ${
                  selectedDemand === 'HIGH'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                High
              </button>
            </div>
          </div>

        </div>

        {/* Career Results Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Showing <strong className="text-white">{careers.length}</strong> matching careers</span>
            <span>All salary figures cited from official industry benchmarks</span>
          </div>

          {loading ? (
            <div className="text-center py-20 text-slate-400 text-sm">
              Loading career catalog...
            </div>
          ) : careers.length === 0 ? (
            <div className="text-center py-20 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
              <p className="text-base font-bold text-slate-300">No careers match your search criteria.</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedStream('ALL');
                  setSelectedCategory('ALL');
                  setSelectedDemand('');
                }}
                className="px-4 py-2 rounded-lg bg-brand-600 text-white text-xs font-bold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {careers.map(career => {
                const minLPA = (career.salaryMinINR / 100000).toFixed(1);
                const maxLPA = (career.salaryMaxINR / 100000).toFixed(1);

                return (
                  <div
                    key={career.id}
                    onClick={() => setSelectedCareer(career)}
                    className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 hover:border-cyan-500/40 transition-all hover:-translate-y-1 cursor-pointer flex flex-col justify-between group"
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

                      {/* Required Subjects Badge */}
                      <div className="text-[11px] text-slate-300">
                        <span className="text-slate-400">Prerequisites: </span>
                        <span>{career.requiredSubjects?.join(', ') || 'Open to all'}</span>
                      </div>

                      {/* Financial Benchmarks */}
                      <div className="pt-3 flex items-center justify-between text-xs border-t border-slate-800/80">
                        <div>
                          <span className="text-slate-400 block text-[10px]">Annual Pay Scale</span>
                          <span className="font-bold text-emerald-400">₹{minLPA}L – ₹{maxLPA}L</span>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                          career.futureDemand === 'VERY_HIGH'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}>
                          Demand: {career.futureDemand}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Exams: {career.entranceExams?.slice(0, 2).join(', ') || 'Direct / Merit'}
                      </span>
                      <span className="text-xs font-bold text-cyan-400 group-hover:underline flex items-center gap-1">
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Modal Detail View */}
      {selectedCareer && (
        <CareerDetailModal
          career={selectedCareer}
          onClose={() => setSelectedCareer(null)}
        />
      )}
    </div>
  );
};
