import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  Upload,
  Layers,
  Sparkles,
  BarChart3,
  Loader2
} from 'lucide-react';

export const SchoolPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);

  const fetchSchoolData = async () => {
    try {
      const [dashRes, stuRes] = await Promise.all([
        ApiService.getSchoolDashboard(),
        ApiService.getSchoolStudents()
      ]);
      if (dashRes.success && dashRes.school) setDashboard(dashRes.school);
      if (stuRes.success && stuRes.students) setStudents(stuRes.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const handleSimulateCSVImport = async () => {
    setImporting(true);
    setImportSuccess(null);
    try {
      const res = await ApiService.request<{ success: boolean; message: string }>('/school/bulk-import', {
        method: 'POST',
        body: JSON.stringify({ studentsList: new Array(30).fill(null) })
      });
      if (res.success) {
        setImportSuccess(res.message);
        await fetchSchoolData();
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Loading School Institutional Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
              <Building className="w-3.5 h-3.5" />
              <span>Multi-Tenant School SaaS</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              {dashboard?.name || 'Delhi Public School Workspace'}
            </h1>
            <p className="text-xs text-slate-400">
              Institution Code: {dashboard?.code} • Board: {dashboard?.board} • Tier: {dashboard?.subscriptionTier}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSimulateCSVImport}
              disabled={importing}
              className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
            >
              {importing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>Import CSV Roster</span>
            </button>
          </div>
        </div>

        {importSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{importSuccess}</span>
          </div>
        )}

        {/* School KPI Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Enrolled Students</span>
            <p className="text-3xl font-black text-white">{dashboard?.totalEnrolledStudents || students.length}</p>
            <span className="text-[10px] text-slate-400 block">Class 10 & 12 Batches</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Assessments Completed</span>
            <p className="text-3xl font-black text-cyan-400">{dashboard?.completedAssessments || 1}</p>
            <span className="text-[10px] text-slate-400 block">16-D Psychometric evaluations</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Career Readiness Rate</span>
            <p className="text-3xl font-black text-emerald-400">{dashboard?.readinessRate || 85}%</p>
            <span className="text-[10px] text-slate-400 block">Identified stream pathways</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Plan Seat Capacity</span>
            <p className="text-3xl font-black text-indigo-400">{dashboard?.maxStudents || 500}</p>
            <span className="text-[10px] text-slate-400 block">Institutional Growth Tier</span>
          </div>
        </div>

        {/* Aggregated Stream Distribution */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Institutional Stream Affinity Distribution</h3>
              <p className="text-xs text-slate-400">Aggregated breakdown of Class 10 student stream compatibility.</p>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Anonymized Batch Analytics</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            {dashboard?.streamDistribution?.map((sd: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                <span className="text-xs text-slate-400 font-semibold">{sd.stream}</span>
                <p className="text-2xl font-bold text-white">{sd.percentage}%</p>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: `${sd.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Roster Table */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Enrolled Student Roster ({students.length})</h3>
            <span className="text-xs text-slate-400">Isolated to {dashboard?.name}</span>
          </div>

          <div className="rounded-2xl glass-panel bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Roll No</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Class & Batch</th>
                    <th className="p-4">Assessment Status</th>
                    <th className="p-4">Primary Strengths</th>
                    <th className="p-4">Profile Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {students.map((st, i) => (
                    <tr key={i} className="hover:bg-slate-850/40 transition-colors">
                      <td className="p-4 font-mono font-medium text-slate-400">{st.rollNumber}</td>
                      <td className="p-4 font-bold text-white">{st.name}</td>
                      <td className="p-4 text-cyan-300">{st.classGroup}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          st.assessmentStatus === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}>
                          {st.assessmentStatus}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {st.topStrengths && st.topStrengths.length > 0
                          ? st.topStrengths.slice(0, 2).join(', ')
                          : 'Pending evaluation'}
                      </td>
                      <td className="p-4 font-bold text-white">{st.completionScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
