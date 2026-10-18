import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CheckoutModal } from './components/CheckoutModal';

// Pages
import { HomePage } from './pages/HomePage';
import { CareerExplorerPage } from './pages/CareerExplorerPage';
import { StreamSelectionPage } from './pages/StreamSelectionPage';
import { AssessmentWorkspacePage } from './pages/AssessmentWorkspacePage';
import { AssessmentResultsPage } from './pages/AssessmentResultsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { RoadmapBuilderPage } from './pages/RoadmapBuilderPage';
import { AIMentorChatPage } from './pages/AIMentorChatPage';
import { CollegeFinderPage } from './pages/CollegeFinderPage';
import { ExamGuidePage } from './pages/ExamGuidePage';
import { ScholarshipFinderPage } from './pages/ScholarshipFinderPage';
import { PricingPage } from './pages/PricingPage';
import { ParentPortalPage } from './pages/ParentPortalPage';
import { SchoolPortalPage } from './pages/SchoolPortalPage';
import { CounselorPortalPage } from './pages/CounselorPortalPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { BillingCenterPage } from './pages/BillingCenterPage';
import { OnboardingWizardPage } from './pages/OnboardingWizardPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import {
  HowItWorksPage,
  ForParentsPage,
  ForSchoolsPage,
  ForCounselorsPage,
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsPage,
  RefundPolicyPage
} from './pages/StaticPages';

const AppContent: React.FC = () => {
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950">
      <Navbar onOpenCheckout={(plan) => setCheckoutPlan(plan)} />
      
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage onOpenCheckout={(plan) => setCheckoutPlan(plan)} />} />
          <Route path="/careers" element={<CareerExplorerPage />} />
          <Route path="/stream-guide" element={<StreamSelectionPage />} />
          <Route path="/assessment" element={<AssessmentWorkspacePage />} />
          <Route path="/assessment/results" element={<AssessmentResultsPage />} />
          <Route path="/colleges" element={<CollegeFinderPage />} />
          <Route path="/exams" element={<ExamGuidePage />} />
          <Route path="/scholarships" element={<ScholarshipFinderPage />} />
          <Route path="/pricing" element={<PricingPage onOpenCheckout={(plan) => setCheckoutPlan(plan)} />} />
          
          {/* Authenticated Application Routes */}
          <Route path="/dashboard" element={<StudentDashboardPage onOpenCheckout={(plan) => setCheckoutPlan(plan)} />} />
          <Route path="/onboarding" element={<OnboardingWizardPage />} />
          <Route path="/roadmap" element={<RoadmapBuilderPage />} />
          <Route path="/ai-mentor" element={<AIMentorChatPage />} />
          <Route path="/parent-portal" element={<ParentPortalPage />} />
          <Route path="/school-portal" element={<SchoolPortalPage />} />
          <Route path="/counselors" element={<CounselorPortalPage />} />
          <Route path="/counselor-portal" element={<CounselorPortalPage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/billing" element={<BillingCenterPage onOpenCheckout={(plan) => setCheckoutPlan(plan)} />} />

          {/* Auth & Static Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/for-parents" element={<ForParentsPage />} />
          <Route path="/for-schools" element={<ForSchoolsPage />} />
          <Route path="/for-counselors" element={<ForCounselorsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/refund-policy" element={<RefundPolicyPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />

      {/* Global Checkout Modal */}
      {checkoutPlan && (
        <CheckoutModal
          planCode={checkoutPlan}
          onClose={() => setCheckoutPlan(null)}
        />
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
