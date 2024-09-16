import React, { useState, FormEvent } from 'react';
import { message } from 'antd';

import useAuth from '../hooks/useAuth';
import '../assets/style/AuthForm.css';

const RegisterForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const { register, login } = useAuth();

  const handleSubmit = async(e: FormEvent) => {
    e.preventDefault();

    try {
      await register(username, password);
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
        <button type="submit" className="btn text-bold">Register</button>
      </form>
    </div>
  );
};

export default RegisterForm;