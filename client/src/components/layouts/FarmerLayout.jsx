import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const FARMER_NAV = [
  { path: '/farmer', icon: '🏠', label: 'Dashboard', exact: true },
  { path: '/farmer/products', icon: '🌿', label: 'My Crops' },
  { path: '/farmer/orders', icon: '📦', label: 'Orders' },
  { path: '/farmer/price-prediction', icon: '📈', label: 'Price Prediction' },
  { path: '/farmer/demand-forecast', icon: '📊', label: 'Demand Forecast' },
  { path: '/farmer/disease-detection', icon: '🔬', label: 'Disease Detection' },
  { path: '/farmer/cold-storage', icon: '🏭', label: 'Storage' },
  { path: '/farmer/drying-plant', icon: '☀️', label: 'Drying Plant' },
  { path: '/farmer/weather', icon: '🌤️', label: 'Weather' },
  { path: '/farmer/profile', icon: '👤', label: 'Profile' },
];

const FarmerLayout = () => {
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(d => {
      document.documentElement.setAttribute('data-theme', !d ? 'dark' : 'light');
      return !d;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Top Navbar */}
      <nav className="main-navbar px-3" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div className="d-flex align-items-center gap-3">
          <button onClick={() => setSidebarOpen(o => !o)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', fontSize: '1rem' }}>☰</button>
          <span style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.3rem', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>🌾 AgroConnect</span>
        </div>
        <div className="d-flex align-items-center gap-3">
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>👨‍🌾 Farmer Portal</span>
          <button onClick={toggleTheme} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 8px', cursor: 'pointer' }}>{isDark ? '☀️' : '🌙'}</button>
          <button onClick={logout} className="btn-outline-custom py-1 px-3" style={{ fontSize: '0.8rem' }}>Logout</button>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* Sidebar */}
        <aside className={`dashboard-sidebar ${sidebarOpen ? 'open' : ''}`} style={!sidebarOpen ? { transform: 'translateX(-100%)' } : {}}>
          {/* User info */}
          <div style={{ padding: '1.25rem 1rem', borderBottom: '1px solid var(--border)', marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '1.1rem', flexShrink: 0 }}>
                {user?.name?.[0]}
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.district || 'Tamil Nadu'}</div>
              </div>
            </div>
          </div>

          <nav>
            {FARMER_NAV.map(item => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="dashboard-content" style={{ marginLeft: sidebarOpen ? 'var(--sidebar-width)' : 0 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default FarmerLayout;
