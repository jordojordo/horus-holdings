import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

interface PublicRouteProps {
  element: React.ReactElement;
}

const PublicRoute: React.FC<PublicRouteProps> = ({ element }) => {
  const { authenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return element;
};

export default PublicRoute;
