import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useUser } from '@/lib/user';

export function RequireSession({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const location = useLocation();

  if (loading) {
    return (
      <div className="center" role="status">
        <span className="spinner" aria-label="Loading" />
      </div>
    );
  }
  if (!user) return <Navigate to="/sign-in" replace state={{ next: location.pathname }} />;
  return children;
}
