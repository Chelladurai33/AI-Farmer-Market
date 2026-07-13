import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); } catch {}
    setLoading(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div className="glass-card p-5" style={{ width: '100%', maxWidth: 420 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Forgot Password</h1>
        </div>
        {sent ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
            <h3 style={{ fontWeight: 700 }}>Check Your Email</h3>
            <p style={{ color: 'var(--text-muted)' }}>If this email exists, a reset link has been sent.</p>
            <Link to="/login" className="btn-primary-custom" style={{ display: 'inline-block', marginTop: '1rem' }}>Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="form-label-custom">Email Address</label>
              <input type="email" className="form-control-custom" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary-custom w-100" disabled={loading}>{loading ? '⏳ Sending...' : '📧 Send Reset Link'}</button>
          </form>
        )}
        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem' }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
