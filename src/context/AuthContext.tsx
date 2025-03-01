import { createContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

import { User } from '@/types/User';
import { getServiceConfig } from '@/utils/service';

export interface AuthContextType {
  isLoading: boolean;
  authenticated: boolean;
  token: string | null;
  user: User | null
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  updateProfile: (username: string, password: string) => Promise<void>;
  deleteUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Set withCredentials globally for axios
axios.defaults.withCredentials = true;

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const localUser = localStorage.getItem('user');

    return localUser ? JSON.parse(localUser) : null;
  });
  const [authenticated, setAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { apiUrl } = getServiceConfig();

  useEffect(() => {
    const loadUser = () => {
      loadToken();

      if (localStorage.getItem('token')) {
        setAuthenticated(true);
      }

      setIsLoading(false);
    };

    loadUser();
  }, [apiUrl]);

  function loadToken() {
    const localToken = localStorage.getItem('token');
    const localUser = JSON.parse(localStorage.getItem('user') || 'null');

    if (localToken && localUser) {
      setToken(localToken);
      setUser(localUser);
    } else {
      clearUser();
    }
  }

  function clearUser() {
    setToken(null);
    setUser(null);
    setAuthenticated(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const register = async(username: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${ apiUrl }/auth/register`, {
        username,
        password
      });

      if (response.status === 201) {
        await login(username, password);
      }

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error?.response?.data?.error || 'Unable to register. Please try again.');
    }
  };

  const login = async(username: string, password: string) => {
    try {
      setIsLoading(true);
      if (!username || !password) {
        throw new Error('Invalid username or password');
      }

      const response = await axios.post(`${ apiUrl }/auth/login`, {
        username,
        password
      });

      setToken(response.data.token);
      setUser(response.data);
      setAuthenticated(true);

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data));

      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      throw new Error(error?.response?.data?.error || 'Unable to login. Please try again.');
    }
  };

  const logout = async() => {
    try {
      setIsLoading(true);
      await axios.post(`${ apiUrl }/auth/logout`);

      clearUser();
      setIsLoading(false);
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || 'Unable to logout. Please try again.');
    }
  };

  const updateProfile = async(username: string, password: string) => {
    try {
      const response = await axios.put(`${ apiUrl }/auth/update`, {
        username,
        password
      });

      setUser(response.data);
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || 'Unable to update profile. Please try again.');
    }
  };

  const deleteUser = async() => {
    try {
      await axios.delete(`${ apiUrl }/auth/delete`);

      setUser(null);
    } catch (error: any) {
      throw new Error(error?.response?.data?.error || 'Unable to delete user. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
      isLoading,
      authenticated,
      token,
      user,
      login,
      logout,
      register,
      updateProfile,
      deleteUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
