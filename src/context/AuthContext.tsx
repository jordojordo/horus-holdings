import { createContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { User } from '../types/User';
import { getServiceConfig } from '../utils/service';

export interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  updateProfile: (username: string, newPassword: string) => Promise<void>;
  deleteUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Set withCredentials globally for axios
axios.defaults.withCredentials = true;

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const { apiUrl } = getServiceConfig();

  useEffect(() => {
    const fetchUser = async() => {
      try {
        const response = await axios.get(`${ apiUrl }/auth/user`);

        setUser(response.data);
      } catch (error) {
        setUser(null);
      }
    };

    fetchUser();
  }, [apiUrl]);

  const login = async(username: string, password: string) => {
    try {
      if ( !username || !password ) {
        throw new Error('Invalid username or password');
      }

      const response = await axios.post(`${ apiUrl }/auth/login`, {
        username,
        password
      });

      setUser(response.data);
      navigate('/dashboard');
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Unable to login. Please try again.');
    }
  };

  const logout = async() => {
    try {
      await axios.post(`${ apiUrl }/auth/logout`);

      setUser(null);
      navigate('/login');
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Unable to logout. Please try again.');
    }
  };

  const register = async(username: string, password: string) => {
    try {
      const response = await axios.post(`${ apiUrl }/auth/register`, {
        username,
        password
      });

      if ( response.status === 201 ) {
        await login(username, password);
      }
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Unable to register. Please try again.');
    }
  };

  const updateProfile = async(username: string, newPassword: string) => {
    try {
      const response = await axios.put(`${ apiUrl }/auth/update`, {
        username,
        newPassword
      });

      setUser(response.data);
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Unable to update profile. Please try again.');
    }
  };

  const deleteUser = async() => {
    try {
      await axios.delete(`${ apiUrl }/auth/delete`);

      setUser(null);
      navigate('/');
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || 'Unable to delete user. Please try again.');
    }
  };

  return (
    <AuthContext.Provider value={{
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
