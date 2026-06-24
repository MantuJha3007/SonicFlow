'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CheckCircle, Mail } from 'lucide-react';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email');
  const { verifyEmail } = useAuth();
  
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      // If no email is provided, redirect back to register
      router.push('/register');
    }
  }, [emailParam, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otp || otp.length < 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    const result = await verifyEmail(emailParam, otp);
    setLoading(false);

    if (!result.success) {
      setError(result.error || 'Verification failed');
    } else {
      setSuccess(true);
      // AuthContext will handle the redirect to /login
    }
  };

  if (!emailParam) return null;

  return (
    <div className="auth-page-container">
      <div className="auth-card glass-panel fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <div className="avatar" style={{ width: '50px', height: '50px', color: 'var(--secondary)' }}>
            <Mail size={26} />
          </div>
        </div>

        <h1 className="auth-title">Verify Email</h1>
        <p className="auth-subtitle">We sent a 6-digit code to <strong>{emailParam}</strong></p>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: 'center', marginTop: '20px', color: 'var(--success)' }}>
            <CheckCircle size={48} style={{ margin: '0 auto', marginBottom: '10px' }} />
            <p>Verification successful! Redirecting to login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ marginTop: '20px' }}>
            <div className="form-group" style={{ marginBottom: '30px' }}>
              <label className="form-label" htmlFor="otp">
                Verification Code
              </label>
              <input
                id="otp"
                type="text"
                className="form-input"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                disabled={loading}
                required
                style={{ textAlign: 'center', letterSpacing: '8px', fontSize: '1.2rem', fontWeight: 'bold' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
              disabled={loading || otp.length < 6}
            >
              {loading ? (
                <span className="animate-pulse-slow">Verifying...</span>
              ) : (
                <span>Verify Email</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="auth-page-container"><div className="auth-card glass-panel"><div style={{textAlign: 'center'}}>Loading...</div></div></div>}>
      <VerifyEmailForm />
    </Suspense>
  );
}
