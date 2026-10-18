import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-cyan-400 p-0.5">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Compass className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                FUTUREPATH <span className="text-cyan-400">AI</span>
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
              An evidence-informed, explainable career intelligence and education planning SaaS built for students in Classes 10 & 12 across CBSE, CISCE, and State Boards in India. Transforming guesswork into structured decision-making.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Designed with DPDP Act 2023 Child Data Safeguards</span>
            </div>
          </div>

          {/* Core Modules */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Student Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/stream-guide" className="hover:text-cyan-400 transition-colors">Class 10 Stream Selection</Link>
              </li>
              <li>
                <Link to="/assessment" className="hover:text-cyan-400 transition-colors">16-D Cognitive Assessment</Link>
              </li>
              <li>
                <Link to="/careers" className="hover:text-cyan-400 transition-colors">50+ Indian Career Explorer</Link>
              </li>
              <li>
                <Link to="/colleges" className="hover:text-cyan-400 transition-colors">NIRF College Finder</Link>
              </li>
              <li>
                <Link to="/exams" className="hover:text-cyan-400 transition-colors">JEE / NEET / CUET / CLAT</Link>
              </li>
              <li>
                <Link to="/scholarships" className="hover:text-cyan-400 transition-colors">Central Sector Scholarships</Link>
              </li>
            </ul>
          </div>

          {/* Ecosystem Portals */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Institutional Portals
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/for-parents" className="hover:text-cyan-400 transition-colors">Parent Empowerment Portal</Link>
              </li>
              <li>
                <Link to="/for-schools" className="hover:text-cyan-400 transition-colors">School SaaS & Bulk Roster</Link>
              </li>
              <li>
                <Link to="/for-counselors" className="hover:text-cyan-400 transition-colors">Certified Counselor Network</Link>
              </li>
              <li>
                <Link to="/pricing" className="hover:text-cyan-400 transition-colors">Subscription Plans & INR Pricing</Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-cyan-400 transition-colors">Explainable Methodology</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-4">
              Trust & Policies
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/privacy-policy" className="hover:text-cyan-400 transition-colors">Privacy Policy (DPDP 2023)</Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-cyan-400 transition-colors">Terms of Service</Link>
              </li>
              <li>
                <Link to="/refund-policy" className="hover:text-cyan-400 transition-colors">Refund & Cancellation Policy</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-cyan-400 transition-colors">About & Scientific Advisory</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-cyan-400 transition-colors">Support & Contact</Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Ethical Disclaimer Banner */}
        <div className="mt-12 pt-8 border-t border-slate-800/80">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 leading-relaxed">
            <span className="font-semibold text-slate-300">⚠️ Educational Guidance Disclaimer: </span>
            FuturePath AI assessments and compatibility scores represent evidence-informed exploratory possibilities to guide discussion. They are not psychometric clinical diagnoses, nor do they guarantee admission cutoffs, examination ranks, or specific corporate compensation packages. Admission criteria, syllabus patterns, and reservation policies are governed solely by respective statutory boards (CBSE, NTA, NMC, AICTE, Consortium of NLUs) and institutions.
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 mt-6 gap-4">
            <p>© 2026 FUTUREPATH AI Technologies India Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-4 text-xs">
              <span>Made with care for Indian students</span>
              <span>•</span>
              <span>Razorpay Sandbox Secured</span>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};
