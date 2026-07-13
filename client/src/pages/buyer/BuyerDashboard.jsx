import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const BuyerDashboard = () => {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders?limit=5').then(r => setOrders(r.data.data?.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusColors = { PENDING: '#f59e0b', ACCEPTED: '#3b82f6', DELIVERED: '#22c55e', REJECTED: '#ef4444', SHIPPED: '#8b5cf6', CANCELLED: '#6b7280' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.name?.split(' ')[0]}! 🛒</h1>
        <p className="page-subtitle">Discover fresh produce directly from farmers</p>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link to="/marketplace" className="btn-primary-custom" style={{ fontSize: '0.875rem' }}>🛒 Browse Marketplace</Link>
        <Link to="/buyer/cart" className="btn-outline-custom" style={{ fontSize: '0.875rem' }}>🛍️ My Cart</Link>
        <Link to="/buyer/wishlist" className="btn-outline-custom" style={{ fontSize: '0.875rem' }}>❤️ Wishlist</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '📦', label: 'Total Orders', value: orders.length, color: 'var(--gradient-primary)' },
          { icon: '✅', label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, color: 'linear-gradient(135deg, #22c55e, #4ade80)' },
          { icon: '⏳', label: 'Pending', value: orders.filter(o => o.status === 'PENDING').length, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
          { icon: '💰', label: 'Total Spent', value: `₹${orders.reduce((s, o) => s + o.totalAmount, 0).toLocaleString()}`, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
        ].map((s, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="glass-card p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📦 Recent Orders</h3>
          <Link to="/buyer/orders" style={{ fontSize: '0.8rem', color: 'var(--primary)' }}>View all →</Link>
        </div>
        {loading ? <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div> :
          orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
              <p style={{ color: 'var(--text-muted)' }}>No orders yet.</p>
              <Link to="/marketplace" className="btn-primary-custom">Browse Marketplace</Link>
            </div>
          ) : orders.map(order => (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>Order #{order.id.slice(0, 8)}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.items?.length} item(s) · ₹{order.totalAmount.toLocaleString()}</div>
              </div>
              <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 50, background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontWeight: 600 }}>{order.status}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
export default BuyerDashboard;
