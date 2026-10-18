import React, { useState, useEffect } from 'react';
import { ApiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  TrendingUp,
  Users,
  IndianRupee,
  CreditCard,
  Cpu,
  Edit,
  Save,
  CheckCircle2,
  FileText,
  Activity
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Plan price edit state
  const [editingPlanCode, setEditingPlanCode] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(999);
  const [priceUpdateMsg, setPriceUpdateMsg] = useState<string | null>(null);

  const fetchAdminData = async () => {
    try {
      const [mRes, uRes, lRes] = await Promise.all([
        ApiService.getAdminMetrics(),
        ApiService.getAdminUsers(),
        ApiService.request<{ success: boolean; logs: any[] }>('/admin/audit-logs')
      ]);
      if (mRes.success && mRes.metrics) setMetrics(mRes.metrics);
      if (uRes.success && uRes.users) setUsersList(uRes.users);
      if (lRes.success && lRes.logs) setAuditLogs(lRes.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleUpdatePrice = async (code: string) => {
    try {
      const res = await ApiService.updatePlanPrice(code, newPrice);
      if (res.success) {
        setPriceUpdateMsg(res.message);
        setEditingPlanCode(null);
        await fetchAdminData();
        setTimeout(() => setPriceUpdateMsg(null), 3000);
      }
    } catch (err: any) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <p className="text-sm">Loading Platform Administration Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs font-semibold border border-rose-500/20">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Executive Control Console</span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">
              Platform & Revenue Intelligence
            </h1>
            <p className="text-xs text-slate-400">
              Live SaaS metrics, ARR/MRR accounting, user database, and security audit logs.
            </p>
          </div>
        </div>

        {/* Executive KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Registered Students</span>
            <p className="text-3xl font-black text-white">{metrics?.breakdown?.students || 0}</p>
            <span className="text-[10px] text-slate-400">Total Users: {metrics?.totalUsers}</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Active Paid Subscriptions</span>
            <p className="text-3xl font-black text-cyan-400">{metrics?.activeSubscriptions || 0}</p>
            <span className="text-[10px] text-emerald-400 font-semibold">{metrics?.conversionRatePercent}% Conversion</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Total Cash Collected</span>
            <p className="text-3xl font-black text-emerald-400">₹{(metrics?.totalRevenueINR || 0).toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400">Audited via Razorpay</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">Est. Annual Run-rate (ARR)</span>
            <p className="text-3xl font-black text-indigo-400">₹{(metrics?.arrEstimateINR || 0).toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400">MRR: ₹{metrics?.mrrEstimateINR}/mo</span>
          </div>

          <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400">AI Inference Cost Est.</span>
            <p className="text-3xl font-black text-amber-400">₹{(metrics?.aiUsageCostEstINR || 0).toLocaleString('en-IN')}</p>
            <span className="text-[10px] text-slate-400">₹2.50 per user model query</span>
          </div>
        </div>

        {priceUpdateMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{priceUpdateMsg}</span>
          </div>
        )}

        {/* Plan Pricing Editor */}
        <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Administrator Plan Pricing Controls</h3>
              <p className="text-xs text-slate-400">Instantly adjust commercial INR subscription fees without code changes.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Career Discovery Dossier (DISCOVERY)</span>
              <p className="text-slate-400">One-time full 16-D report</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  defaultValue={299}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <button
                  onClick={() => handleUpdatePrice('DISCOVERY')}
                  className="px-3 py-1 bg-brand-600 rounded text-white font-bold text-xs"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Premium Student Annual (PREMIUM_STUDENT)</span>
              <p className="text-slate-400">Annual roadmap, AI mentor & reports</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  defaultValue={999}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <button
                  onClick={() => handleUpdatePrice('PREMIUM_STUDENT')}
                  className="px-3 py-1 bg-brand-600 rounded text-white font-bold text-xs"
                >
                  Update
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-bold text-white">Premium Plus & Family (PREMIUM_PLUS)</span>
              <p className="text-slate-400">Parent portal, cost planner & counseling</p>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="number"
                  defaultValue={2499}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-24 px-2 py-1 bg-slate-900 border border-slate-700 rounded text-white font-bold"
                />
                <button
                  onClick={() => handleUpdatePrice('PREMIUM_PLUS')}
                  className="px-3 py-1 bg-brand-600 rounded text-white font-bold text-xs"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Management Table */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">User Accounts ({usersList.length})</h3>

          <div className="rounded-2xl glass-panel bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Class</th>
                    <th className="p-4">Plan Status</th>
                    <th className="p-4">Profile Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {usersList.map((u, idx) => (
                    <tr key={idx} className="hover:bg-slate-850/40">
                      <td className="p-4 font-bold text-white">{u.name}</td>
                      <td className="p-4 font-mono text-slate-400">{u.email}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-semibold">
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{u.class}</td>
                      <td className="p-4 font-bold text-emerald-400">{u.plan}</td>
                      <td className="p-4">{u.completionScore}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security & Audit Trail */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">Audit Log & Compliance Trail ({auditLogs.length})</h3>

          <div className="rounded-2xl glass-panel bg-slate-900 border border-slate-800 overflow-hidden shadow-xl p-4 text-xs font-mono space-y-2 max-h-60 overflow-y-auto">
            {auditLogs.map((log, i) => (
              <div key={i} className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-slate-400">
                <span>[{new Date(log.createdAt).toLocaleTimeString()}] <strong>{log.action}</strong> on {log.resource} by {log.user?.email || 'SYSTEM'}</span>
                <span className="text-cyan-400">{log.ipAddress}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
