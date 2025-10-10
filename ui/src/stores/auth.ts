import type { User } from '@/types';

import { defineStore } from 'pinia';
import type { AxiosError } from 'axios';
import axios from 'axios';

import { getServiceConfig } from '@/utils/service';

axios.defaults.withCredentials = true;

type State = {
  isLoading:     boolean;
  authenticated: boolean;
  token:         string | null;
  user:          User | null;
};

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    isLoading:     true,
    authenticated: !!localStorage.getItem('token'),
    token:         localStorage.getItem('token'),
    user:          (() => {
      const raw = localStorage.getItem('user');

      return raw ? (JSON.parse(raw) as User) : null;
    })(),
  }),

  getters: { isLoggedIn: (s) => s.authenticated && !!s.token },

  actions: {
    _clearUser() {
      this.token = null;
      this.user = null;
      this.authenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },

    bootFromStorage() {
      // sets state from localStorage and flips isLoading.
      const t = localStorage.getItem('token');
      const u = localStorage.getItem('user');

      if (t && u) {
        this.token = t;
        this.user = JSON.parse(u);
        this.authenticated = true;
      } else {
        this._clearUser();
      }

      this.isLoading = false;
    },

    async register(username: string, password: string) {
      const { apiUrl } = getServiceConfig();

      try {
        this.isLoading = true;

        const res = await axios.post(`${ apiUrl }/auth/register`, {
          username,
          password,
        });

        if (res.status === 201) {
          await this.login(username, password);
        }
      } catch(err) {
        const e = err as AxiosError<any>;

        throw new Error(e?.response?.data?.error ?? 'Unable to register. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async login(username: string, password: string) {
      const { apiUrl } = getServiceConfig();

      try {
        this.isLoading = true;
        this._clearUser();

        if (!username || !password) {
          throw new Error('Invalid username or password');
        }

        const res = await axios.post(`${ apiUrl }/auth/login`, {
          username,
          password,
        });

        this.token = res.data.token;
        this.user = res.data as User;
        this.authenticated = true;

        localStorage.setItem('token', this.token ?? '');
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch(err) {
        const e = err as AxiosError<any>;

        throw new Error(e?.response?.data?.error ?? 'Unable to login. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async logout() {
      const { apiUrl } = getServiceConfig();

      try {
        this.isLoading = true;
        await axios.post(`${ apiUrl }/auth/logout`);
        this._clearUser();
      } catch(err) {
        const e = err as AxiosError<any>;

        throw new Error(e?.response?.data?.error ?? 'Unable to logout. Please try again.');
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUser() {
      const { apiUrl } = getServiceConfig();

      try {
        this.isLoading = true;

        return await axios.get(`${ apiUrl }/auth/user`);
      } catch(err) {
        console.error(err);
      } finally {
        this.isLoading = false;
      }
    },

    async updateProfile(username: string, password: string) {
      const { apiUrl } = getServiceConfig();

      try {
        const res = await axios.put(`${ apiUrl }/auth/update`, {
          username,
          password,
        });

        this.user = res.data as User;
        localStorage.setItem('user', JSON.stringify(this.user));
      } catch(err) {
        const e = err as AxiosError<any>;

        throw new Error(e?.response?.data?.error ?? 'Unable to update profile. Please try again.');
      }
    },

    async deleteUser() {
      const { apiUrl } = getServiceConfig();

      try {
        await axios.delete(`${ apiUrl }/auth/delete`);

        this.user = null;
        this.token = null;
        this.authenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } catch(err) {
        const e = err as AxiosError<any>;

        throw new Error(e?.response?.data?.error ?? 'Unable to delete user. Please try again.');
      }
    },
  },
});
