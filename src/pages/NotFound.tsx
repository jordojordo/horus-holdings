import React from 'react';
import { useNavigate } from 'react-router-dom';

import useAuth from '@/hooks/useAuth';

import '@/assets/style/NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { authenticated } = useAuth();

  const handleBackHome = () => {
    if (authenticated) {
      return navigate('/dashboard');
    }

    navigate('/');
  };

  return (
    <div className="not-found-container">
      <h1 className="text-bold mb-5">404</h1>
      <h2 className="mb-10">The page you visited does not exist.</h2>
      <button onClick={handleBackHome} className="btn text-bold">
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
