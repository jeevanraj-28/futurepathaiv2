import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  CheckCircle2,
  ShieldCheck,
  Building,
  Users,
  Award,
  HelpCircle,
  Mail,
  Phone,
  MapPin,
  Lock,
  ArrowRight
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-12">
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-brand-500/10 text-cyan-400 text-xs font-semibold border border-brand-500/20">
          Methodology
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">How FuturePath AI Works</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          From guesswork to evidence: a 4-phase structured journey designed by educational psychologists and data engineers for Classes 10 & 12 in India.
        </p>
      </div>

      <div className="space-y-8">
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-brand-600 text-white font-bold flex items-center justify-center text-sm">1</span>
            <h3 className="text-lg font-bold text-white">Multi-Dimensional 16-D Assessment</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Students answer 40 scenario-based questions covering numerical reasoning, spatial visualization, deductive logic, scientific curiosity, risk tolerance, and work values. Results are computed independently across dimensions rather than compressed into a single uninformative score.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-cyan-600 text-white font-bold flex items-center justify-center text-sm">2</span>
            <h3 className="text-lg font-bold text-white">Explainable Matching & Stream Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Our deterministic recommendation engine evaluates compatibility against 50+ curated careers. For each career, we show why it matches, which school subjects apply, what skills need further development, and alternative entry routes.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">3</span>
            <h3 className="text-lg font-bold text-white">30-Day, 90-Day & 5-Year Roadmap Builder</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Convert recommendations into bite-sized actionable tasks. Track board syllabus priorities, reference book reading, Olympiad trials, entrance exam dates, and portfolio development milestones.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-600 text-white font-bold flex items-center justify-center text-sm">4</span>
            <h3 className="text-lg font-bold text-white">Family & Counselor Collaboration</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Parents access cost-planning estimators and discussion guides to support, rather than dictate, career trajectories. Certified career counselors are available for personalized 1-on-1 strategy sessions.
          </p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/assessment" className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue">
          Experience the 16-D Assessment
        </Link>
      </div>
    </div>
  </div>
);

export const ForParentsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 text-xs font-semibold border border-amber-500/20">
          For Parents
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Supporting Your Child's Ambitions</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          How to replace anxiety and peer comparison with evidence-backed discussions, realistic higher education cost planning, and certified guidance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white">Objective Psychometric Dossier</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Understand your child's natural cognitive strengths without emotional guesswork. See how their logical, verbal, and practical problem-solving traits match different academic streams.
          </p>
        </div>
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white">4-Year Higher Education Cost Estimator</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Model realistic tuition, hostel, exam coaching, and incidental costs for Engineering, Medicine, Law, Design, and Commerce to plan family savings responsibly.
          </p>
        </div>
      </div>

      <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-700 space-y-3">
        <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider">Five Questions to Ask Your Child Tonight:</h3>
        <ul className="space-y-2 text-xs text-slate-200">
          <li>1. "Which subject problems give you genuine satisfaction when you finally crack them?"</li>
          <li>2. "Would you rather work in a hospital, a tech lab, a courtroom, or a design studio?"</li>
          <li>3. "What kind of everyday lifestyle and work hours feel sustainable to you?"</li>
          <li>4. "Which entrance examinations are you genuinely excited to study for?"</li>
          <li>5. "How can we as parents best support your daily study stamina?"</li>
        </ul>
      </div>

      <div className="text-center pt-4">
        <Link to="/parent-portal" className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue">
          Enter Parent Portal
        </Link>
      </div>
    </div>
  </div>
);

export const ForSchoolsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold border border-indigo-500/20">
          Institutional SaaS
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">FuturePath for Schools & Academies</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Equip your school counselors, principals, and teachers with structured career intelligence, batch analytics, and parent-teacher conference reports.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white">Bulk CSV Enrollment</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Enroll entire batches of Class 10 & 12 students in one click with isolated tenant security.</p>
        </div>
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white">Class Stream Analytics</h3>
          <p className="text-xs text-slate-400 leading-relaxed">View aggregated distribution of student stream preferences to plan Class 11 section allocations.</p>
        </div>
        <div className="p-6 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <h3 className="text-base font-bold text-white">NEP 2020 Compliance</h3>
          <p className="text-xs text-slate-400 leading-relaxed">Align your school's guidance cell with national multi-disciplinary education framework standards.</p>
        </div>
      </div>

      <div className="text-center pt-4">
        <Link to="/school-portal" className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue">
          Open School Portal Demo
        </Link>
      </div>
    </div>
  </div>
);

export const ForCounselorsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <div className="space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
          Professional Network
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">For Certified Career Counselors</h1>
        <p className="text-sm text-slate-400 leading-relaxed">
          Join India's vetted network of career psychologists. Host structured 1-on-1 sessions, review 16-D assessment dossiers, and earn transparent hourly counseling fees.
        </p>
      </div>

      <div className="p-6 rounded-2xl glass-panel bg-slate-900 border border-slate-800 space-y-4">
        <h3 className="text-base font-bold text-white">Counselor Credentialing Standards</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          To maintain strict credibility for Indian families, counselor profiles undergo manual verification. We require recognized degrees in Psychology, Education, or certified career advisory diplomas (UCLA, RCI, or equivalent).
        </p>
      </div>

      <div className="text-center pt-4">
        <Link to="/counselor-portal" className="px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md glow-blue">
          Browse Counselor Network
        </Link>
      </div>
    </div>
  </div>
);

export const AboutPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">About FuturePath AI</h1>
      <p className="text-sm text-slate-300 leading-relaxed">
        FuturePath AI was built on a single conviction: Indian students deserve transparent, evidence-informed guidance rather than social pressure, marketing hype, or opaque algorithms.
      </p>

      <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
        <h3 className="text-base font-bold text-white">Our Three Core Design Principles:</h3>
        <p><strong>1. Explainability Over Black-Box Predictions:</strong> We never declare a compatibility score without showing the supporting assessment dimensions, subject overlap, and areas where additional skills are needed.</p>
        <p><strong>2. No Commercial Placement Illusions:</strong> We cite salary data and entrance exam cutoffs exclusively from verified government publications, official testing agencies, and audited industry associations.</p>
        <p><strong>3. Uncompromising Student Privacy:</strong> We build for compliance with the Digital Personal Data Protection Act 2023. We never sell student data or profiles for unauthorized advertising.</p>
      </div>
    </div>
  </div>
);

export const ContactPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
      <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Contact & Support</h1>
      <p className="text-sm text-slate-400">Our academic advisory team is available to support students, parents, and schools.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <Mail className="w-5 h-5 text-cyan-400" />
          <h4 className="font-bold text-white">Email Inquiries</h4>
          <p className="text-slate-400">support@futurepath.ai<br />admissions@futurepath.ai</p>
        </div>
        <div className="p-5 rounded-2xl glass-card bg-slate-900 border border-slate-800 space-y-2">
          <Phone className="w-5 h-5 text-emerald-400" />
          <h4 className="font-bold text-white">Institutional Desk</h4>
          <p className="text-slate-400">+91 20 2600 0000<br />Mon–Sat, 9:00 AM – 6:00 PM IST</p>
        </div>
      </div>
    </div>
  </div>
);

export const PrivacyPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Privacy Policy & DPDP Compliance</h1>
      <p className="text-slate-400">Last updated: January 15, 2026 • In compliance with Digital Personal Data Protection (DPDP) Act 2023</p>

      <h3 className="text-base font-bold text-white">1. Data Minimization & Minor Safeguards</h3>
      <p>Because FuturePath AI serves secondary school students who may be minors under Indian law, we implement strict privacy by design. We collect only data relevant to academic counseling: academic class, subjects, and cognitive assessment responses. We do not collect government identity numbers or financial card details.</p>

      <h3 className="text-base font-bold text-white">2. Zero Sale of Student Information</h3>
      <p>We do NOT sell, license, or monetize student contact information to private coaching institutes, educational loan brokers, or targeted advertising agencies.</p>

      <h3 className="text-base font-bold text-white">3. Consent & Parent Access</h3>
      <p>Parent access to student reports requires explicit consent-based linkage. Students and parents retain the right to request deletion of assessment attempts and profile data at any time via support@futurepath.ai.</p>
    </div>
  </div>
);

export const TermsPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Terms of Service</h1>
      <p className="text-slate-400">Effective Date: January 15, 2026</p>

      <h3 className="text-base font-bold text-white">1. Informational & Guidance Purpose</h3>
      <p>FuturePath AI provides career exploration, educational roadmaps, and stream intelligence. Recommendations do not constitute legal admission guarantees, clinical psychiatric diagnostics, or promised corporate salaries. Official criteria are set by testing authorities (NTA, CBSE, State Universities).</p>

      <h3 className="text-base font-bold text-white">2. Fair Use & Account Security</h3>
      <p>Users must provide accurate information. Accounts may not be shared across non-family members or reverse-engineered.</p>
    </div>
  </div>
);

export const RefundPolicyPage: React.FC = () => (
  <div className="min-h-screen bg-slate-950 text-slate-100 py-16">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-8 text-xs text-slate-300 leading-relaxed">
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Refund & Cancellation Policy</h1>
      <p className="text-slate-400">Effective Date: January 15, 2026</p>

      <h3 className="text-base font-bold text-white">1. 7-Day Satisfaction Guarantee</h3>
      <p>We believe in the quality of our psychometric intelligence. If you purchase the Career Discovery Dossier (₹299) or Premium Student Plan (₹999) and find that it does not provide constructive educational clarity, you may request a 100% refund within 7 days of purchase.</p>

      <h3 className="text-base font-bold text-white">2. Refund Processing</h3>
      <p>Refunds are initiated directly via our Billing Center or by emailing support@futurepath.ai with your receipt number. Funds are credited back to the original source method (UPI, Bank Account, or Card) within 5–7 business days via Razorpay.</p>
    </div>
  </div>
);
