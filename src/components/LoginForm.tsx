import React, { useState, FormEvent } from 'react';
import { message } from 'antd';

import useAuth from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

import '@/assets/style/AuthForm.css';

const LoginForm: React.FC = () => {
  const { isLoading, login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();

    try {
      await login(username, password);
    } catch (error: any) {
      if (error?.message as string) {
        message.error(error.message);
      }
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Login</h1>
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
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
