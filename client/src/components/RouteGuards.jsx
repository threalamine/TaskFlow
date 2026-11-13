import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute() {
    const { user, loading } = useAuth();

    if (loading) return <div className="page-loading">Loading…</div>;

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export function GuestRoute() {
    const { user, loading } = useAuth();

    if (loading) return <div className="page-loading">Loading…</div>;

    return user ? <Navigate to="/projects" replace /> : <Outlet />;
}