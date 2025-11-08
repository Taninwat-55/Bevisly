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
import CandidateHome from "@/pages/candidate/CandidateHome";
import CandidateDashboard from "@/pages/candidate/CandidateDashboard";
import CandidateJobListings from "@/pages/candidate/CandidateJobListings";
import CandidateJobDetail from "@/pages/candidate/CandidateJobDetail";
import CandidateProofWorkspace from "@/pages/candidate/CandidateProofWorkspace";
import CandidateFeedbackView from "@/pages/candidate/CandidateFeedbackView";
import CandidateProfile from "@/pages/candidate/CandidateProfile";

// --- Employer pages
import EmployerLayout from "@/layout/EmployerLayout";
import EmployerHome from "@/pages/employer/EmployerHome";
import EmployerDashboard from "@/pages/employer/EmployerDashboard";
import EmployerPostJob from "@/pages/employer/EmployerPostJob";
import EmployerFeedbackSuccess from "@/pages/employer/EmployerFeedbackSuccess";
import EmployerReview from "@/pages/employer/EmployerReviewProof";
import EmployerTalentManager from "@/pages/employer/EmployerTalentManager";
import EmployerSubmissions from "@/pages/employer/EmployerSubmissions";
import EmployerJobDetail from "@/pages/employer/EmployerJobDetail";
import EmployerTalentPool from "@/pages/employer/EmployerTalentPool";
import EmployerJobListings from "@/pages/employer/EmployerJobListings";

// --- Admin pages
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminFeedback from "@/pages/admin/AdminFeedback";
import AdminDataViewer from "@/pages/admin/AdminDataViewer";
import UserSettings from "@/pages/shared/UserSettings";

// --- Public pages
import PublicJobDetailPage from "@/pages/PublicJobDetailPage";
import PublicJobsPage from "@/pages/PublicJobsPage";
import PublicCandidateProfilePage from "@/pages/PublicCandidateProfilePage";
import PublicLeaderboard from "@/pages/PublicLeaderboard";
import PublicLayout from "@/layout/PublicLayout";
import LearnMorePage from "@/pages/LearnMorePage";
import AboutPage from "@/pages/AboutPage";
import AdminFeedbackMessages from "@/pages/admin/AdminFeedbackMessages";
import AdminLayout from "@/layout/AdminLayout";

export const router = createBrowserRouter([
  // 🌐 Public
  // { path: "/", element: <LandingPage /> },

  // 🌐 Public Pages with shared layout
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "/jobs", element: <PublicJobsPage /> },
      { path: "/jobs/:id", element: <PublicJobDetailPage /> },
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
          { path: "jobs", element: <CandidateJobListings /> },
          { path: "job/:id", element: <CandidateJobDetail /> },
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
          { path: "jobs", element: <EmployerJobListings /> },
          { path: "jobs/new", element: <EmployerPostJob /> },
          { path: "job/:id", element: <EmployerJobDetail /> },
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
        element: <AdminLayout />, // ⬅️ wrap all admin pages with sidebar
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
