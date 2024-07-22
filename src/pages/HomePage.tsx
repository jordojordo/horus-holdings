import React from 'react';
import { Link } from 'react-router-dom';

import '../assets/style/AuthForm.css';

const HomePage: React.FC = () => {
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
