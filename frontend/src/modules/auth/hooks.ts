'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from './api';

export const useAuth = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      await authService.login({ email, password });
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
      await authService.register({ name, email, password });
      router.push('/dashboard');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await authService.logout();
    router.push('/login');
  };

  return { login, register, logout, loading, error };
};
