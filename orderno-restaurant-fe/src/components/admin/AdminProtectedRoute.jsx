import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context';
import { Loader2 } from 'lucide-react';

export default function AdminProtectedRoute({ children }) {
  const { isAuthenticated, loadingAuth } = useAdminAuth();
  const location = useLocation();

  if (loadingAuth) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0c0a09] text-stone-300">
        <Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
        <p className="mt-4 font-serif-luxury text-lg tracking-wider text-white">
          Authenticating Administrator Session...
        </p>
        <span className="mt-1 text-xs text-stone-500">Ordeno Fine Dining Executive Portal</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
}
