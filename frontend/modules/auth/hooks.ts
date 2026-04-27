'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

const USER_KEY = 'taskveer_user';

export const saveUser = (user: AuthUser) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getStoredUser = (): AuthUser | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

export const clearUser = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(USER_KEY);
};

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login({ email, password });
      saveUser(res.data as AuthUser);
      router.refresh(); // re-run middleware so the new cookie is seen
      router.push('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.register({ name, email, password });
      saveUser(res.data as AuthUser);
      router.refresh(); // re-run middleware so the new cookie is seen
      router.push('/dashboard');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    clearUser();
    router.push('/login');
  };

  return { login, register, logout, loading, error };
};

export const useCurrentUser = (): AuthUser | null => {
  const [user] = useState<AuthUser | null>(() => getStoredUser());
  return user;
};
