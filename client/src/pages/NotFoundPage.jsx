import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
    <div>
      <div style={{ fontSize: '6rem', marginBottom: '1rem' }}>🌾</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)' }}>404</h1>
      <h2 style={{ fontWeight: 700, marginBottom: '1rem' }}>Page Not Found</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Looks like this crop field doesn't exist!</p>
      <Link to="/" className="btn-primary-custom">🏠 Back to Home</Link>
    </div>
  </div>
);
export default NotFoundPage;
