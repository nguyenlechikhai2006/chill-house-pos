import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import type { UserRole } from '../../types/database.types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, role, initialized, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!initialized) {
      checkAuth();
    }
  }, [initialized, checkAuth]);

  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-700 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-600">Đang khởi tạo hệ thống Chill House...</span>
        </div>
      </div>
    );
  }

  // Nếu chưa đăng nhập, bắt buộc chuyển hướng về trang /login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/pos" replace />;
  }

  return <Outlet />;
};
