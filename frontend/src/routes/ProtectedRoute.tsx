import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  allowedRole?: "candidate" | "employer" | "admin";
  children?: ReactNode;
}

export default function ProtectedRoute({
  allowedRole,
  children,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  // Wait for auth to resolve
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        Loading session…
      </div>
    );
  }

  // No user → redirect to login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Demo account is blocked from the admin panel entirely — it may only
  // experience the candidate and employer sides. (Real admins are unaffected:
  // their original_role is "admin", not "demo_admin".)
  const isDemo =
    user.original_role === "demo_admin" || user.role === "demo_admin";
  if (isDemo && allowedRole === "admin") {
    return <Navigate to="/candidate" replace />;
  }

  // Demo account gets access to candidate + employer areas to test both sides.
  if (user.role === "demo_admin") {
    return <>{children || <Outlet />}</>;
  }

  // Defensive: a null role (e.g. brief race after OAuth signup before profile
  // row is fetched) is treated as a candidate so the user lands somewhere
  // valid instead of looping through redirects.
  const effectiveRole = user.role ?? "candidate";

  // Wrong role → redirect to their own dashboard
  if (allowedRole && effectiveRole !== allowedRole) {
    if (effectiveRole === "admin") return <Navigate to="/admin" replace />;
    if (effectiveRole === "employer") return <Navigate to="/employer" replace />;
    return <Navigate to="/candidate/dashboard" replace />;
  }

  // Authorized → render either children or nested routes
  return <>{children || <Outlet />}</>;
}
