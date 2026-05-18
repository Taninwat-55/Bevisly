import { lazy } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "../App";
import ProtectedRoute from "./ProtectedRoute";

// Layouts — keep static: always needed, no benefit from lazy-loading structural chrome
import CandidateLayout from "@/layout/CandidateLayout";
import DashboardLayout from "@/layout/DashboardLayout";
import AdminLayout from "@/layout/AdminLayout";
import PublicLayout from "@/layout/PublicLayout";

// Auth
const AuthPage = lazy(() => import("../pages/auth/AuthPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const RequestResetPage = lazy(() => import("@/pages/auth/RequestResetPage"));

// Candidate pages
const CandidateUnifiedDashboard = lazy(() => import("@/pages/candidate/CandidateUnifiedDashboard"));
const CandidateProofWorkspace = lazy(() => import("@/pages/candidate/CandidateProofWorkspace"));
const CandidateFeedbackView = lazy(() => import("@/pages/candidate/CandidateFeedbackView"));
const PracticeTasksPage = lazy(() => import("@/pages/candidate/PracticeTasksPage"));
const PracticeWorkspace = lazy(() => import("@/pages/candidate/PracticeWorkspace"));

// Employer pages
const EmployerDashboard = lazy(() => import("@/pages/employer/EmployerDashboard"));
const EmployerInbox = lazy(() => import("@/pages/employer/EmployerInbox"));
const EmployerAllCandidates = lazy(() => import("@/pages/employer/EmployerAllCandidates"));
const EmployerTalentBoardPage = lazy(() => import("@/pages/employer/EmployerTalentBoardPage"));
const EmployerMyJobs = lazy(() => import("@/pages/employer/EmployerMyJobs"));

// Admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("@/pages/admin/AdminUsers"));
const AdminJobs = lazy(() => import("@/pages/admin/AdminJobs"));
const AdminFeedback = lazy(() => import("@/pages/admin/AdminFeedback"));
const AdminDataViewer = lazy(() => import("@/pages/admin/AdminDataViewer"));
const AdminFeedbackMessages = lazy(() => import("@/pages/admin/AdminFeedbackMessages"));

// Shared pages
const UserSettings = lazy(() => import("@/pages/shared/UserSettings"));
const AboutPage = lazy(() => import("@/pages/shared/AboutPage"));
const PrivacyPolicy = lazy(() => import("@/pages/shared/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/shared/TermsOfService"));
const DocsPage = lazy(() => import("@/pages/shared/DocsPage"));

// Public pages
const LandingPage = lazy(() => import("../pages/landing/LandingPage"));
const ProfilePage = lazy(() => import("@/pages/public/ProfilePage"));
const LeaderboardPage = lazy(() => import("@/pages/public/LeaderboardPage"));
const PublicProofView = lazy(() => import("@/pages/public/PublicProofView"));
const LearnMorePage = lazy(() => import("@/pages/public/learn-more/LearnMorePage"));
const PricingPage = lazy(() => import("@/pages/public/PricingPage"));
const JobDetailPage = lazy(() => import("@/pages/jobs/JobDetailPage"));
const JobListingPage = lazy(() => import("@/pages/jobs/JobListingPage"));
const CompanyBrandPage = lazy(() => import("@/pages/public/CompanyBrandPage"));
const CompaniesPage = lazy(() => import("@/pages/public/CompaniesPage"));
const BlogIndexPage = lazy(() => import("@/pages/blog/BlogIndexPage"));
const BlogPostPage = lazy(() => import("@/pages/blog/BlogPostPage"));

export const router = createBrowserRouter([
  // Public Pages with shared layout
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/jobs", element: <JobListingPage /> },
      { path: "/jobs/:id", element: <JobDetailPage /> },
      { path: "/leaderboard", element: <LeaderboardPage /> },
      { path: "/candidate/:id", element: <ProfilePage /> }, // Legacy UUID support
      { path: "/@:username", element: <ProfilePage /> }, // SEO-friendly username URLs
      { path: "/proof/:id", element: <PublicProofView /> }, // Shareable proof certificate
      { path: "/company/:slug", element: <CompanyBrandPage /> },
      { path: "/companies", element: <CompaniesPage /> },
      { path: "/learn-more", element: <LearnMorePage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/terms", element: <TermsOfService /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/docs", element: <DocsPage /> },
      { path: "/blog", element: <BlogIndexPage /> },
      { path: "/blog/:slug", element: <BlogPostPage /> },
    ],
  },

  // Auth
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/forgot", element: <RequestResetPage /> },
  { path: "/auth/reset", element: <ResetPasswordPage /> },

  // Candidate (protected)
  {
    path: "/candidate",
    element: (
      <ProtectedRoute allowedRole="candidate">
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <CandidateLayout />,
        children: [
          { index: true, element: <CandidateUnifiedDashboard /> },
          { path: "dashboard", element: <CandidateUnifiedDashboard /> },
          { path: "jobs", element: <JobListingPage /> },
          { path: "job/:id", element: <JobDetailPage /> },
          { path: "proof/:id", element: <CandidateProofWorkspace /> },
          { path: "proofs", element: <CandidateFeedbackView /> },
          { path: "practice", element: <PracticeTasksPage /> },
          { path: "practice/:id", element: <PracticeWorkspace /> },
          { path: "settings", element: <UserSettings /> },
          { path: "leaderboard", element: <LeaderboardPage isWorkspaceView={true} /> },
          { path: "profile", element: <ProfilePage isWorkspaceView={true} /> },
        ],
      },
    ],
  },

  // Employer
  {
    path: "/employer",
    element: (
      <ProtectedRoute allowedRole="employer">
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <DashboardLayout showSidebar={true} fullWidth={false}>
            <EmployerDashboard />
          </DashboardLayout>
        )
      },

      {
        element: <DashboardLayout showSidebar={true} fullWidth={false}><Outlet /></DashboardLayout>,
        children: [
          { path: "inbox", element: <EmployerInbox /> },
          { path: "talent-board", element: <EmployerTalentBoardPage /> },
          { path: "candidates", element: <EmployerAllCandidates /> },
          { path: "jobs", element: <EmployerMyJobs /> },
          { path: "job/:id", element: <JobDetailPage /> },
          { path: "settings", element: <UserSettings /> },
        ],
      },
    ],
  },

  // Admin
  {
    path: "/admin",
    element: (
      <ProtectedRoute allowedRole="admin">
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: "users", element: <AdminUsers /> },
          { path: "jobs", element: <AdminJobs /> },
          { path: "feedback", element: <AdminFeedback /> },
          { path: "data-viewer", element: <AdminDataViewer /> },
          { path: "settings", element: <UserSettings /> },
          { path: "feedback-messages", element: <AdminFeedbackMessages /> },
        ],
      },
    ],
  },
]);
