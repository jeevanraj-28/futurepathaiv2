import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CheckoutProvider } from './context/CheckoutContext';
import { PublicLayout } from './components/layout/PublicLayout';
import { AdaptiveLayout, AppLayout } from './components/layout/AppLayout';
import { Spinner } from './components/ui';

import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { QuickStartPage } from './pages/QuickStartPage';
import { AssessmentWorkspacePage } from './pages/AssessmentWorkspacePage';
import { SaveResultsPage } from './pages/SaveResultsPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';

// Larger, signed-in or less-visited screens load on demand to keep the first page fast on slow connections.
const PricingPage = lazy(() => import('./pages/PricingPage').then((m) => ({ default: m.PricingPage })));
const AssessmentResultsPage = lazy(() => import('./pages/AssessmentResultsPage').then((m) => ({ default: m.AssessmentResultsPage })));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage').then((m) => ({ default: m.StudentDashboardPage })));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage').then((m) => ({ default: m.DiscoverPage })));
const CareerExplorerPage = lazy(() => import('./pages/CareerExplorerPage').then((m) => ({ default: m.CareerExplorerPage })));
const CareerDetailPage = lazy(() => import('./pages/CareerDetailPage').then((m) => ({ default: m.CareerDetailPage })));
const StreamSelectionPage = lazy(() => import('./pages/StreamSelectionPage').then((m) => ({ default: m.StreamSelectionPage })));
const CollegeFinderPage = lazy(() => import('./pages/CollegeFinderPage').then((m) => ({ default: m.CollegeFinderPage })));
const ExamGuidePage = lazy(() => import('./pages/ExamGuidePage').then((m) => ({ default: m.ExamGuidePage })));
const ScholarshipFinderPage = lazy(() => import('./pages/ScholarshipFinderPage').then((m) => ({ default: m.ScholarshipFinderPage })));
const RoadmapBuilderPage = lazy(() => import('./pages/RoadmapBuilderPage').then((m) => ({ default: m.RoadmapBuilderPage })));
const AIMentorChatPage = lazy(() => import('./pages/AIMentorChatPage').then((m) => ({ default: m.AIMentorChatPage })));
const CounselorPortalPage = lazy(() => import('./pages/CounselorPortalPage').then((m) => ({ default: m.CounselorPortalPage })));
const ParentPortalPage = lazy(() => import('./pages/ParentPortalPage').then((m) => ({ default: m.ParentPortalPage })));
const SchoolPortalPage = lazy(() => import('./pages/SchoolPortalPage').then((m) => ({ default: m.SchoolPortalPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const BillingCenterPage = lazy(() => import('./pages/BillingCenterPage').then((m) => ({ default: m.BillingCenterPage })));
const OnboardingWizardPage = lazy(() => import('./pages/OnboardingWizardPage').then((m) => ({ default: m.OnboardingWizardPage })));
type StaticPageName = keyof typeof import('./pages/StaticPages');
const staticPage = (name: StaticPageName) =>
  lazy(() => import('./pages/StaticPages').then((m) => ({ default: m[name] as React.ComponentType })));
const HowItWorksPage = staticPage('HowItWorksPage');
const ForParentsPage = staticPage('ForParentsPage');
const ForSchoolsPage = staticPage('ForSchoolsPage');
const ForCounselorsPage = staticPage('ForCounselorsPage');
const AboutPage = staticPage('AboutPage');
const ContactPage = staticPage('ContactPage');
const PrivacyPolicyPage = staticPage('PrivacyPolicyPage');
const TermsPage = staticPage('TermsPage');
const RefundPolicyPage = staticPage('RefundPolicyPage');

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
};

const AppRoutes: React.FC = () => (
  <Suspense fallback={<Spinner className="min-h-[60vh]" />}>
    <Routes>
      {/* Marketing and information pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />
        <Route path="/for-parents" element={<ForParentsPage />} />
        <Route path="/for-schools" element={<ForSchoolsPage />} />
        <Route path="/for-counselors" element={<ForCounselorsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/refund-policy" element={<RefundPolicyPage />} />
      </Route>

      {/* Focused flows: no site navigation to distract */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/start" element={<QuickStartPage />} />
      <Route path="/assessment" element={<AssessmentWorkspacePage />} />
      <Route path="/assessment/save" element={<SaveResultsPage />} />
      <Route path="/invite/:token" element={<AcceptInvitePage />} />

      {/* Discovery: public for visitors, inside the app once signed in */}
      <Route element={<AdaptiveLayout publicLayout={<PublicLayout />} />}>
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/careers" element={<CareerExplorerPage />} />
        <Route path="/careers/:slug" element={<CareerDetailPage />} />
        <Route path="/stream-guide" element={<StreamSelectionPage />} />
        <Route path="/colleges" element={<CollegeFinderPage />} />
        <Route path="/exams" element={<ExamGuidePage />} />
        <Route path="/scholarships" element={<ScholarshipFinderPage />} />
      </Route>

      {/* Signed-in app */}
      <Route element={<AppLayout roles={['STUDENT']} />}>
        <Route path="/dashboard" element={<StudentDashboardPage />} />
        <Route path="/assessment/results" element={<AssessmentResultsPage />} />
        <Route path="/plan" element={<RoadmapBuilderPage />} />
        <Route path="/mentor" element={<AIMentorChatPage />} />
        <Route path="/onboarding" element={<OnboardingWizardPage />} />
      </Route>
      <Route element={<AppLayout roles={['PARENT']} />}>
        <Route path="/parent-portal" element={<ParentPortalPage />} />
      </Route>
      <Route element={<AppLayout roles={['SCHOOL_ADMIN']} />}>
        <Route path="/school-portal" element={<SchoolPortalPage />} />
      </Route>
      <Route element={<AppLayout roles={['COUNSELOR']} />}>
        <Route path="/counselor-portal" element={<CounselorPortalPage mode="counselor" />} />
      </Route>
      <Route element={<AppLayout roles={['PLATFORM_ADMIN']} />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
      </Route>
      <Route element={<AppLayout />}>
        <Route path="/counselors" element={<CounselorPortalPage mode="marketplace" />} />
        <Route path="/billing" element={<BillingCenterPage />} />
      </Route>

      {/* Old links keep working */}
      <Route path="/roadmap" element={<Navigate to="/plan" replace />} />
      <Route path="/ai-mentor" element={<Navigate to="/mentor" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Suspense>
);

export const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <CheckoutProvider>
        <ScrollToTop />
        <AppRoutes />
      </CheckoutProvider>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
