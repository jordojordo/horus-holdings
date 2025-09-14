import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

import LoadingSpinner from '@/components/LoadingSpinner';

import '@/assets/style/AuthForm.css';

const HomePage: React.FC = () => {
  const { authenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return (
    <div className="auth-container">
      <h1>Horus Holdings</h1>
      <div className="auth-links">
        <Link to="/login" className="btn text-bold">Login</Link>
        <Link to="/register" className="btn text-bold">Register</Link>
      </div>
    </div>
  );
};

export default HomePage;
