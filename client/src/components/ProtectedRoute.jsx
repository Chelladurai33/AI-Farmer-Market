import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProtectedRoute = ({ role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    const redirectMap = { FARMER: '/farmer', BUYER: '/buyer', ADMIN: '/admin' };
    return <Navigate to={redirectMap[user.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
