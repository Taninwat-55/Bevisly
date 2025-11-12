// src/routes/Routes.tsx
import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import AuthPage from "../pages/auth/AuthPage";
import LandingPage from "../pages/landing/LandingPage";
import ProtectedRoute from "./ProtectedRoute";

// --- Auth
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import RequestResetPage from "@/pages/auth/RequestResetPage";

// --- Candidate pages
import CandidateLayout from "@/layout/CandidateLayout";
import CandidateHome from "@/pages/candidate/CandidateOverview";
import CandidateDashboard from "@/pages/candidate/CandidateDashboard";
import CandidateProofWorkspace from "@/pages/candidate/CandidateProofWorkspace";
import CandidateFeedbackView from "@/pages/candidate/CandidateFeedbackView";
import CandidateProfile from "@/pages/candidate/CandidateProfile";

// --- Employer pages
import EmployerLayout from "@/layout/EmployerLayout";
import EmployerHome from "@/pages/employer/EmployerOverview";
import EmployerDashboard from "@/pages/employer/EmployerDashboard";
import EmployerPostJob from "@/pages/employer/EmployerPostJob";
import EmployerEditJob from "@/pages/employer/EmployerEditJob";
import EmployerFeedbackSuccess from "@/pages/employer/EmployerFeedbackSuccess";
import EmployerReview from "@/pages/employer/EmployerReviewProof";
import EmployerTalentManager from "@/pages/employer/EmployerTalentManager";
import EmployerSubmissions from "@/pages/employer/EmployerSubmissions";
import EmployerTalentPool from "@/pages/employer/EmployerTalentPool";

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
import PublicCandidateProfilePage from "@/pages/PublicCandidateProfilePage";
import PublicLeaderboard from "@/pages/PublicLeaderboard";
import PublicLayout from "@/layout/PublicLayout";
import LearnMorePage from "@/pages/LearnMore/LearnMorePage";
import AboutPage from "@/pages/shared/AboutPage";
import JobDetailPage from "@/pages/jobs/JobDetailPage";
import JobListingPage from "@/pages/jobs/JobListingPage";

export const router = createBrowserRouter([
  // 🌐 Public Pages with shared layout
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/jobs", element: <JobListingPage /> },
      { path: "/jobs/:id", element: <JobDetailPage /> },
      { path: "/leaderboard", element: <PublicLeaderboard /> },
      { path: "/candidate/:id", element: <PublicCandidateProfilePage /> },
      { path: "/learn-more", element: <LearnMorePage /> },
      { path: "/about", element: <AboutPage /> },
    ],
  },

  // 🔐 Auth
  { path: "/auth", element: <AuthPage /> },
  { path: "/auth/forgot", element: <RequestResetPage /> },
  { path: "/auth/reset", element: <ResetPasswordPage /> },

  // 🎓 Candidate (protected)
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
          { index: true, element: <CandidateHome /> },
          { path: "dashboard", element: <CandidateDashboard /> },
          { path: "jobs", element: <JobListingPage /> },
          { path: "job/:id", element: <JobDetailPage /> },
          { path: "proof/:id", element: <CandidateProofWorkspace /> },
          { path: "proofs", element: <CandidateFeedbackView /> },
          { path: "profile", element: <CandidateProfile /> },
          { path: "settings", element: <UserSettings /> },
        ],
      },
    ],
  },

  // 🏢 Employer
  {
    path: "/employer",
    element: (
      <ProtectedRoute allowedRole="employer">
        <App />
      </ProtectedRoute>
    ),
    children: [
      {
        element: <EmployerLayout />,
        children: [
          { index: true, element: <EmployerHome /> },
          { path: "dashboard", element: <EmployerDashboard /> },
          { path: "review/:id", element: <EmployerReview /> },
          { path: "review/success", element: <EmployerFeedbackSuccess /> },
          { path: "jobs", element: <JobListingPage /> },
          { path: "jobs/new", element: <EmployerPostJob /> },
          { path: "jobs/:id/edit", element: <EmployerEditJob /> },
          { path: "submissions", element: <EmployerSubmissions /> },
          { path: "talent", element: <EmployerTalentPool /> },
          { path: "talent/manage", element: <EmployerTalentManager /> },
          { path: "settings", element: <UserSettings /> },
        ],
      },
    ],
  },

  // 🧩 Admin
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
