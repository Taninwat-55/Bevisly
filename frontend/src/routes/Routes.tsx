import { createBrowserRouter, Outlet } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/auth/AuthPage";
import LandingPage from "../pages/landing/LandingPage";
import ProtectedRoute from "./ProtectedRoute";

// --- Auth
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import RequestResetPage from "@/pages/auth/RequestResetPage";

// --- Candidate pages
import CandidateLayout from "@/layout/CandidateLayout";
import CandidateUnifiedDashboard from "@/pages/candidate/CandidateUnifiedDashboard";
import CandidateProofWorkspace from "@/pages/candidate/CandidateProofWorkspace";
import CandidateFeedbackView from "@/pages/candidate/CandidateFeedbackView";

// --- Employer pages

import DashboardLayout from "@/layout/DashboardLayout";

import EmployerDashboard from "@/pages/employer/EmployerDashboard";
// (Employer tools are accessed as slide-overs in the Dashboard)

// --- Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminFeedback from "@/pages/admin/AdminFeedback";
import AdminDataViewer from "@/pages/admin/AdminDataViewer";
import UserSettings from "@/pages/shared/UserSettings";
import AdminFeedbackMessages from "@/pages/admin/AdminFeedbackMessages";
import AdminLayout from "@/layout/AdminLayout";

// --- Public pages
import ProfilePage from "@/pages/public/ProfilePage";
import LeaderboardPage from "@/pages/public/LeaderboardPage";
import PublicLayout from "@/layout/PublicLayout";
import LearnMorePage from "@/pages/public/learn-more/LearnMorePage";
import AboutPage from "@/pages/shared/AboutPage";
import JobDetailPage from "@/pages/jobs/JobDetailPage";
import JobListingPage from "@/pages/jobs/JobListingPage";
import PrivacyPolicy from "@/pages/shared/PrivacyPolicy";

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
      { path: "/learn-more", element: <LearnMorePage /> },
      { path: "/privacy", element: <PrivacyPolicy /> },
      { path: "/about", element: <AboutPage /> },
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
          { path: "settings", element: <UserSettings /> },
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
      // Unified Dashboard (No Layout Wrapper)
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
          { path: "jobs", element: <JobListingPage /> },
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
