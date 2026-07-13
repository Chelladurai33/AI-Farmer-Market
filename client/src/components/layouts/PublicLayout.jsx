import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const Navbar = ({ onThemeToggle, isDark }) => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/notifications').then(r => setNotifications(r.data.data?.notifications || [])).catch(() => {});
    }
  }, [isAuthenticated]);

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <nav className="main-navbar px-4" style={{ boxShadow: scrolled ? 'var(--shadow-md)' : 'none' }}>
      <div className="d-flex align-items-center justify-content-between h-100 container-fluid">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none">
          <span style={{ fontSize: '1.8rem' }}>🌾</span>
          <span className="navbar-brand-text d-none d-sm-block">AgroConnect AI</span>
        </Link>

        <div className="d-flex align-items-center gap-2">
          {!isAuthenticated && (
            <>
              <Link to="/marketplace" className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--text-secondary)' }}>Marketplace</Link>
              <Link to="/login" className="btn-outline-custom py-1 px-3" style={{ fontSize: '0.875rem' }}>Login</Link>
              <Link to="/register" className="btn-primary-custom py-1 px-3" style={{ fontSize: '0.875rem' }}>Register</Link>
            </>
          )}

          {isAuthenticated && (
            <>
              <Link to={`/${user?.role?.toLowerCase()}`} className="btn btn-sm btn-link text-decoration-none" style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Dashboard
              </Link>

              {/* Notifications */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowNotif(s => !s)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', position: 'relative' }}
                >
                  🔔
                  {unread > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      background: 'var(--danger)', color: 'white',
                      borderRadius: '50%', width: 16, height: 16,
                      fontSize: '0.65rem', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>{unread}</span>
                  )}
                </button>
                {showNotif && (
                  <div style={{
                    position: 'absolute', right: 0, top: '100%', marginTop: 8,
                    width: 320, background: 'var(--bg-card)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
                    backdropFilter: 'blur(12px)', zIndex: 1000, overflow: 'hidden'
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: '0.9rem' }}>
                      Notifications
                    </div>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>No notifications</div>
                      ) : notifications.slice(0, 5).map(n => (
                        <div key={n.id} style={{
                          padding: '0.75rem 1rem',
                          borderBottom: '1px solid var(--border-light)',
                          background: n.isRead ? 'transparent' : 'var(--primary-pale)',
                          fontSize: '0.85rem'
                        }}>
                          <div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 2 }}>{new Date(n.createdAt).toLocaleDateString()}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User menu */}
              <div className="d-flex align-items-center gap-2" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: 'var(--gradient-primary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.875rem'
                }}>
                  {user?.name?.[0]?.toUpperCase()}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }} className="d-none d-md-block">
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              <button onClick={logout} className="btn-outline-custom py-1 px-3" style={{ fontSize: '0.8rem' }}>Logout</button>
            </>
          )}

          <button
            onClick={onThemeToggle}
            style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.4rem 0.7rem', cursor: 'pointer', fontSize: '1rem' }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </nav>
  );
};

const PublicLayout = () => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(d => {
      document.documentElement.setAttribute('data-theme', !d ? 'dark' : 'light');
      return !d;
    });
  };

  return (
    <>
      <Navbar onThemeToggle={toggleTheme} isDark={isDark} />
      <Outlet />
      <footer style={{ background: 'var(--primary-dark)', color: 'white', padding: '2rem 0', marginTop: 'auto' }}>
        <div className="container text-center">
          <div className="d-flex align-items-center justify-content-center gap-2 mb-2">
            <span style={{ fontSize: '1.5rem' }}>🌾</span>
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: '1.2rem' }}>AgroConnect AI</span>
          </div>
          <p style={{ opacity: 0.7, fontSize: '0.875rem', margin: 0 }}>
            Empowering Indian farmers with AI-driven marketplace solutions © 2025
          </p>
        </div>
      </footer>
    </>
  );
};

export default PublicLayout;
