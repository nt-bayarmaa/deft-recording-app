import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { session, loading, appUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    const redirect = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  // Session exists but appUser not loaded yet (DB trigger delay)
  if (appUser === null && !loading) {
    // Allow /setup page through
    if (location.pathname === "/setup") {
      return <>{children}</>;
    }
    // Redirect to setup so user can set their nickname
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
}
