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

  // Demo admin gets full access to test all features
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
