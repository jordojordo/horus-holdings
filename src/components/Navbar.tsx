import React, { useState } from 'react';
import { Link } from 'react-router-dom';

import { MenuOutlined } from '@ant-design/icons';

import useAuth from '../hooks/useAuth';
import useViewport from '../hooks/useViewport';
import '../assets/style/Navbar.css';

import ToggleThemeButton from './ToggleThemeButton';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { width } = useViewport();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isMobile = width < 725;

  const handleLogout = async() => {
    try {
      if ( isMenuOpen ) {
        toggleMenu();
      }

      await logout();
    } catch (error) {
      console.error('## error: ', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <header>
          <img src="/assets/images/horus.png" alt="Logo" style={{
            width:  '50px',
            height: '50px'
          }} />
          {!isMobile && (
            <h1>Horus Holdings</h1>
          )}
          {isMobile && (
            <button className="menu-icon" onClick={toggleMenu}>
              <MenuOutlined />
            </button>
          )}
        </header>
        <div className={`navbar-links ${ isMenuOpen ? 'active' : '' }`}>
          {user ? (
            <>
              <Link to="/dashboard" onClick={toggleMenu} className="text-bold">Dashboard</Link>
              <Link to="/incomes" onClick={toggleMenu} className="text-bold">Incomes</Link>
              <Link to="/expenses" onClick={toggleMenu} className="text-bold">Expenses</Link>
              <div className='divider'></div>
              <Link to="/settings" onClick={toggleMenu} className="text-bold">Settings</Link>
              <a onClick={handleLogout} className="text-bold">Logout</a>
            </>
          ) : (
            <>
              <Link to="/login" className="text-bold">Login</Link>
              <Link to="/register" className="text-bold">Register</Link>
            </>
          )}
          {isMobile && (
            <div className="theme-button mt-10">
              <ToggleThemeButton />
            </div>
          )}
        </div>
        {!isMobile && (
          <div className="theme-button">
            <ToggleThemeButton />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
