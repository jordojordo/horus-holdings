import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { WebSocketProvider } from './context/WebSocketContext';

import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import IncomesPage from './pages/IncomesPage';
import ExpensesPage from './pages/ExpensesPage';
import SettingsPage from './pages/SettingsPage';
import NotFound from './pages/NotFound';

const App: React.FC = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const wsProtocol = apiUrl.startsWith('https') ? 'wss' : 'ws';
  const wsUrl = `${ wsProtocol }://${ apiUrl.split('://')[1] }/api/ws`;

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <WebSocketProvider url={wsUrl}>
            <div className="container">
              <Navbar />
              <div className="content">
                <Routes>
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route path="/" element={<HomePage />} />
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
          </WebSocketProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;
