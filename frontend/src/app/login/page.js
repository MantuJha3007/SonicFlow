'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LogIn, Music } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const { login, loginWithGoogle, error: authError, clearError } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleGoogleSuccess = async (credentialResponse) => {
    await loginWithGoogle(credentialResponse.credential);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');
    clearError();

    if (!usernameOrEmail.trim() || !password.trim()) {
      setValidationError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const result = await login(usernameOrEmail, password);
    setLoading(false);

    if (!result.success) {
      setValidationError(result.error || 'Invalid credentials');
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="avatar" style={{ width: '50px', height: '50px' }}>
            <Music size={26} />
          </div>
        </div>
        
        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Listen to and manage your music flow</p>

        {(validationError || authError) && (
          <div className="auth-error">
            {validationError || authError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="usernameOrEmail">
              Username or Email
            </label>
            <input
              id="usernameOrEmail"
              type="text"
              className="form-input"
              placeholder="Enter your username or email"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '30px' }}>
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={loading}
          >
            {loading ? (
              <span className="animate-pulse-slow">Logging in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Log In</span>
              </>
            )}
          </button>
          
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setValidationError('Google Login failed');
              }}
            />
          </div>
        </form>

        <p className="auth-redirect">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="auth-redirect-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
