import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { DriverDashboard } from './pages/DriverDashboard';
import { UserDashboard } from './pages/UserDashboard';
import { useAuth } from './hooks/useAuth';
// Protected Route Wrapper
const ProtectedRoute = ({
  children,
  allowedRoles



}: {children: React.ReactNode;allowedRoles?: string[];}) => {
  const {
    user,
    loading,
    isAuthenticated
  } = useAuth();
  if (loading) {
    return <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      </div>;
  }
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on actual role if trying to access unauthorized page
    if (user.role === 'admin') return <Navigate to="/admin" />;
    if (user.role === 'driver') return <Navigate to="/driver" />;
    return <Navigate to="/dashboard" />;
  }
  return <>{children}</>;
};
export function App() {
  return <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Admin Routes */}
        <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>} />

        {/* Driver Routes */}
        <Route path="/driver/*" element={<ProtectedRoute allowedRoles={['driver']}>
              <DriverDashboard />
            </ProtectedRoute>} />

        {/* User/Student Routes */}
        <Route path="/dashboard/*" element={<ProtectedRoute allowedRoles={['user']}>
              <UserDashboard />
            </ProtectedRoute>} />

        {/* Default Redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 Catch-all */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>;
}