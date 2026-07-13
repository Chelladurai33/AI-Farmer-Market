import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ farmers: 0, buyers: 0, products: 0, orders: 0 });
  const [reports, setReports] = useState({});

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/reports')]).then(([s, r]) => {
      setStats(s.data.data || {});
      setReports(r.data.data || {});
    }).catch(() => {});
  }, []);

  const chartData = [
    { month: 'Jan', orders: 20 }, { month: 'Feb', orders: 35 }, { month: 'Mar', orders: 28 },
    { month: 'Apr', orders: 42 }, { month: 'May', orders: 55 }, { month: 'Jun', orders: 48 }, { month: 'Jul', orders: stats.orders || 60 },
  ];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ Admin Dashboard</h1>
        <p className="page-subtitle">Platform overview and management</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '👨‍🌾', label: 'Farmers', value: stats.farmers, color: 'var(--gradient-primary)' },
          { icon: '🛒', label: 'Buyers', value: stats.buyers, color: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
          { icon: '🌿', label: 'Products', value: stats.products, color: 'linear-gradient(135deg, #8BC34A, #a3d96e)' },
          { icon: '📦', label: 'Orders', value: stats.orders, color: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
          { icon: '💰', label: 'Revenue', value: `₹${(reports.totalRevenue || 0).toLocaleString()}`, color: 'linear-gradient(135deg, #ec4899, #f472b6)' },
          { icon: '🤖', label: 'AI Queries', value: reports.aiPredictions || 0, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📊 Order Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              <Bar dataKey="orders" fill="#1B7A3D" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>👥 User Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { role: 'Farmers', count: stats.farmers, color: '#1B7A3D', icon: '👨‍🌾' },
              { role: 'Buyers', count: stats.buyers, color: '#3b82f6', icon: '🛒' },
            ].map(r => (
              <div key={r.role}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem', fontWeight: 600 }}>
                  <span>{r.icon} {r.role}</span><span>{r.count}</span>
                </div>
                <div className="progress-bar-custom">
                  <div className="progress-fill" style={{ width: `${Math.min(100, (r.count / Math.max(stats.farmers + stats.buyers, 1)) * 100)}%`, background: r.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
