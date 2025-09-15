import type { FormEvent } from 'react';
import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { message } from 'antd';

import useAuth from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

import '@/assets/style/AuthForm.css';

const RegisterForm: React.FC = () => {
  const {
 authenticated, isLoading, register, login
} = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authenticated) {
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();

    try {
      await register(username, password);
      await login(username, password);
    } catch (error: unknown) {
      if (error instanceof Error) {
        message.error(error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Register</h1>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn text-bold">
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterForm;
