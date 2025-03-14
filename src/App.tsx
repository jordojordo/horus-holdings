import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { SocketProvider } from '@/context/SocketContext';

import { getServiceConfig } from '@/utils/service';

import Navbar from '@/components/Navbar';

import PublicRoute from './components/PublicRoute';
import PrivateRoute from '@/components/PrivateRoute';

import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import HomePage from '@/pages/HomePage';
import DashboardPage from '@/pages/DashboardPage';
import IncomesPage from '@/pages/IncomesPage';
import ExpensesPage from '@/pages/ExpensesPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from '@/pages/NotFound';

const App: React.FC = () => {
  const { wsUrl, wsPath } = getServiceConfig();

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <SocketProvider url={wsUrl} path={wsPath}>
            <div className="container">
              <Navbar />
              <div className="content">
                <Routes>
                  <Route path="/login" element={<PublicRoute element={<LoginForm />} />} />
                  <Route path="/register" element={<PublicRoute element={<RegisterForm />} />} />
                  <Route path="/" element={<PublicRoute element={<HomePage />} />} />
                  <Route
                    path="/dashboard"
                    element={<PrivateRoute element={<DashboardPage />} />}
                  />
                  <Route
                    path="/incomes"
                    element={<PrivateRoute element={<IncomesPage />} />}
                  />
                  <Route
                    path="/expenses"
                    element={<PrivateRoute element={<ExpensesPage />} />}
                  />
                  <Route
                    path="/settings"
                    element={<PrivateRoute element={<SettingsPage />} />}
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </div>
          </SocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
