import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Compass,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Calculator,
  UserPlus,
  ArrowRight,
  Loader2
} from 'lucide-react';

export const ParentPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cost Planner state
  const [stream, setStream] = useState('Engineering');
  const [collegeType, setCollegeType] = useState('GOVERNMENT');
  const [cityTier, setCityTier] = useState('TIER_1');
  const [costEstimate, setCostEstimate] = useState<any>(null);

  // Link student state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [linking, setLinking] = useState(false);
  const [linkMessage, setLinkMessage] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await ApiService.getParentOverview();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateEstimate = async () => {
    try {
      const res = await ApiService.calculateCost({ stream, collegeType, cityTier });
      if (res.success) {
        setCostEstimate(res.estimate);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
    calculateEstimate();
  }, [stream, collegeType, cityTier]);

  const handleLinkStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentEmail.trim()) return;

    setLinking(true);
    setLinkMessage(null);
    try {
      const res = await ApiService.linkStudent(studentEmail.trim(), 'Parent');
      if (res.success) {
        setLinkMessage(`Success: ${res.message}`);
        setStudentEmail('');
        await fetchData();
        setTimeout(() => setLinkModalOpen(false), 1500);
      }
    } catch (err: any) {
      setLinkMessage(`Error: ${err.message || 'Failed to link account'}`);
    } finally {
      setLinking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Loading Parent Collaboration Portal...</p>
      </div>
    );
  }

  const linkedStudents = data?.linkedStudents || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
              <Users className="w-3.5 h-3.5" />
              <span>Parent Empowerment Portal</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Family Education Intelligence: {user?.name}
            </h1>
            <p className="text-xs text-slate-400">
              Consent-based student progress, objective stream diagnostics, and 4-year financial planning.
            </p>
          </div>

          <button
            onClick={() => setLinkModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Link Child's Account</span>
          </button>
        </div>

        {/* Linked Children Cards */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Linked Children ({linkedStudents.length})</span>
          </h2>

          {linkedStudents.length > 0 ? (
            <div className="space-y-6">
              {linkedStudents.map((child: any, i: number) => (
                <div
                  key={i}
                  className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-bold text-white">{child.studentName}</h3>
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-800 text-cyan-300">
                          {child.currentClass === 'CLASS_10' ? 'Class 10' : 'Class 12'} • {child.board}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{child.studentEmail} • Relationship: {child.relationship}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400">Profile Readiness</span>
                      <p className="text-lg font-bold text-emerald-400">{child.completionScore}%</p>
                    </div>
                  </div>

                  {/* Assessment Summary for Parent */}
                  {child.latestAssessment ? (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Psychometric Diagnostic Summary
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal">
                        {child.latestAssessment.summary}
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[11px] text-slate-400">Natural Cognitive Strengths:</span>
                        {child.latestAssessment.topStrengths?.map((str: string, sIdx: number) => (
                          <span key={sIdx} className="px-2 py-0.5 text-[10px] font-semibold rounded bg-slate-800 text-cyan-300">
                            {str}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
                      Child has not completed the 16-D assessment yet.
                    </div>
                  )}

                  {/* Top Matched Careers for Parent Review */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                      Top Recommended Careers for Collaborative Discussion
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {child.topCareers?.slice(0, 3).map((car: any, cIdx: number) => (
                        <div key={cIdx} className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[10px] font-bold text-cyan-400">{car.category}</span>
                            <span className="text-emerald-400 font-bold">{car.matchScore}%</span>
                          </div>
                          <h4 className="text-xs font-bold text-white truncate">{car.title}</h4>
                          <span className="text-[10px] text-slate-400 block">Salary: {car.salaryRange}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
              <Users className="w-10 h-10 mx-auto text-amber-400" />
              <h3 className="text-base font-bold text-white">No Children Linked Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Link Child's Account" above and enter your child's registered email to view permitted reports and roadmaps.
              </p>
            </div>
          )}
        </div>

        {/* Higher Education Financial Planning Estimator */}
        <div className="p-8 rounded-2xl glass-panel bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Higher Education Cost Estimator</h2>
              <p className="text-xs text-slate-400">Calculate realistic 4-year tuition, accommodation, and entrance coaching financial needs.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Target Field of Study:</label>
              <select
                value={stream}
                onChange={(e) => setStream(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
              >
                <option value="Engineering">Engineering (B.Tech / B.E.)</option>
                <option value="Medical">Medical (MBBS / BDS)</option>
                <option value="Commerce">Commerce & Management (B.Com / BBA / CA)</option>
                <option value="Law">Law (5-Year Integrated B.A. LL.B)</option>
                <option value="Design">Design (B.Des / Architecture)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Institution Tier:</label>
              <select
                value={collegeType}
                onChange={(e) => setCollegeType(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
              >
                <option value="GOVERNMENT">Government / IIT / NIT / AIIMS</option>
                <option value="PRIVATE">Accredited Private University / BITS</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">Study City Tier:</label>
              <select
                value={cityTier}
                onChange={(e) => setCityTier(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200"
              >
                <option value="TIER_1">Tier-1 Metro (Delhi, Mumbai, Bengaluru)</option>
                <option value="TIER_2">Tier-2 City (Pune, Jaipur, Chandigarh, Indore)</option>
              </select>
            </div>
          </div>

          {/* Result Card */}
          {costEstimate && (
            <div className="p-6 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Annual Tuition</span>
                  <span className="text-base font-bold text-white">₹{(costEstimate.annualTuitionINR / 1000).toLocaleString('en-IN')}k</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Annual Hostel/Living</span>
                  <span className="text-base font-bold text-white">₹{(costEstimate.annualLivingINR / 1000).toLocaleString('en-IN')}k</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total {costEstimate.degreeDurationYears}-Year Estimated Need</span>
                  <span className="text-lg font-black text-cyan-400">₹{(costEstimate.totalEstimatedCostINR / 100000).toFixed(1)} Lakhs</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Suggested Monthly Savings</span>
                  <span className="text-base font-bold text-emerald-400">₹{costEstimate.suggestedMonthlySavingsINR.toLocaleString('en-IN')} / mo</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Link Child Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-700 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Link Your Child's Student Account</h3>
            <p className="text-xs text-slate-400">
              Enter the email address your child used to register on FuturePath AI. A consent-based link will be created.
            </p>

            <form onSubmit={handleLinkStudent} className="space-y-4">
              <input
                type="email"
                placeholder="e.g. student@futurepath.ai"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
              />

              {linkMessage && (
                <p className={`text-xs ${linkMessage.startsWith('Success') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {linkMessage}
                </p>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linking}
                  className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-xs font-bold text-white flex items-center gap-1.5"
                >
                  {linking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Confirm Link</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
