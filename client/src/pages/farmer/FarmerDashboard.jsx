import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const FarmerDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ products: 0, orders: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/products/my'), api.get('/orders?limit=5')]).then(([p, o]) => {
      const products = p.data.data || [];
      const orders = o.data.data?.orders || [];
      const revenue = orders.filter(o => o.status === 'DELIVERED').reduce((s, o) => s + o.totalAmount, 0);
      setStats({ products: products.length, orders: orders.length, revenue });
      setRecentOrders(orders.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = { PENDING: '#f59e0b', ACCEPTED: '#3b82f6', DELIVERED: '#22c55e', REJECTED: '#ef4444', SHIPPED: '#8b5cf6', CANCELLED: '#6b7280' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Good morning, {user?.name?.split(' ')[0]}! 👨‍🌾</h1>
        <p className="page-subtitle">Here's your farm overview for today</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/farmer/products/add" className="btn-primary-custom" style={{ fontSize: '0.875rem' }}>+ Add Crop</Link>
        <Link to="/farmer/price-prediction" className="btn-outline-custom" style={{ fontSize: '0.875rem' }}>📈 Price Prediction</Link>
        <Link to="/farmer/disease-detection" className="btn-outline-custom" style={{ fontSize: '0.875rem' }}>🔬 Detect Disease</Link>
        <Link to="/farmer/weather" className="btn-outline-custom" style={{ fontSize: '0.875rem' }}>🌤️ Weather</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '🌿', label: 'Active Crops', value: stats.products, color: 'var(--gradient-primary)', link: '/farmer/products' },
          { icon: '📦', label: 'Total Orders', value: stats.orders, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)', link: '/farmer/orders' },
          { icon: '💰', label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
        ].map((s, i) => (
          <Link key={i} to={s.link || '#'} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{s.value}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card p-4">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📦 Recent Orders</h3>
            <Link to="/farmer/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all →</Link>
          </div>
          {loading ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading...</div> :
            recentOrders.length === 0 ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No orders yet</div> :
            recentOrders.map(order => (
              <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.buyer?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{order.totalAmount.toLocaleString()}</div>
                </div>
                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 50, background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontWeight: 600 }}>{order.status}</span>
              </div>
            ))}
        </div>
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🤖 AI Tools</h3>
          {[
            { icon: '📈', title: 'Price Prediction', path: '/farmer/price-prediction' },
            { icon: '🔬', title: 'Disease Detection', path: '/farmer/disease-detection' },
            { icon: '❄️', title: 'Cold Storage', path: '/farmer/cold-storage' },
            { icon: '📊', title: 'Demand Forecast', path: '/farmer/demand-forecast' },
          ].map(tool => (
            <Link key={tool.path} to={tool.path} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem', borderRadius: 'var(--radius-md)', marginBottom: '0.4rem', textDecoration: 'none', color: 'var(--text-primary)', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--primary-pale)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <span style={{ fontSize: '1.25rem' }}>{tool.icon}</span>
              <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{tool.title}</span>
              <span style={{ marginLeft: 'auto', color: 'var(--text-muted)' }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FarmerDashboard;
