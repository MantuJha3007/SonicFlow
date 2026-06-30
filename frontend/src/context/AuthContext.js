'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  // Load user from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('music_app_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          localStorage.removeItem('music_app_user');
        }
      }
      setLoading(false);
    }
  }, []);

  // Auth routing protection
  useEffect(() => {
    if (!loading) {
      const publicPaths = ['/login', '/register', '/verify-email'];
      const isPublicPath = publicPaths.includes(pathname);

      if (!user && !isPublicPath) {
        router.push('/login');
      } else if (user && isPublicPath) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const login = async (usernameOrEmail, password) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: usernameOrEmail,
          email: usernameOrEmail,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login failed');
      }

      setUser(data.user);
      localStorage.setItem('music_app_user', JSON.stringify(data.user));
      router.push('/');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password, role = 'user') => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      // Do NOT set user or log in immediately
      // Instead, redirect to the verify-email page
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email, otp) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Verification failed');
      }

      // After successful verification, redirect to login
      router.push('/login?verified=true');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async (credential) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/google-login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Google Login failed');
      }

      setUser(data.user);
      localStorage.setItem('music_app_user', JSON.stringify(data.user));
      router.push('/');
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setUser(null);
      localStorage.removeItem('music_app_user');
      router.push('/login');
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    verifyEmail,
    logout,
    clearError: () => setError(null),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
