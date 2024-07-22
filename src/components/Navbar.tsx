import React from 'react';
import { Link } from 'react-router-dom';

import useAuth from '../hooks/useAuth';
import '../assets/style/Navbar.css';

import ToggleThemeButton from './ToggleThemeButton';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = async() => {
    try {
      await logout();
    } catch (error) {
      console.error('## error: ', error);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <header>
          <img src="/assets/images/horus.png" alt="Logo" style={{
            width:  '50px',
            height: '50px'
          }} />
          <h1>Horus Holdings</h1>
        </header>
        <div className="navbar-links">
          {user ? (
            <>
              <Link to="/dashboard" className="text-bold">Dashboard</Link>
              <Link to="/incomes" className="text-bold">Incomes</Link>
              <Link to="/expenses" className="text-bold">Expenses</Link>
              <div className='divider'></div>
              <Link to="/settings" className="text-bold">Settings</Link>
              <a onClick={handleLogout} className="text-bold">Logout</a>
            </>
          ) : (
            <>
              <Link to="/login" className="text-bold">Login</Link>
              <Link to="/register" className="text-bold">Register</Link>
            </>
          )}
        </div>
        <div className="theme-button">
          <ToggleThemeButton />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
