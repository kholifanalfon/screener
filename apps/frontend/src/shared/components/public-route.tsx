import { Navigate, Outlet } from 'react-router-dom';
import { useMe } from '@/features/auth/hooks/use-auth';

export function PublicRoute() {
  const { data: user, isLoading } = useMe();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400 animate-pulse">Memeriksa autentikasi...</p>
        </div>
      </div>
    );
  }

  // Jika sudah terautentikasi, alihkan ke Dashboard (/)
  return user ? <Navigate to="/" replace /> : <Outlet />;
}
