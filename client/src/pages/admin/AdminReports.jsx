import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const AdminReports = () => {
  const [reports, setReports] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/reports').then(r => setReports(r.data.data || {})).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading reports...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">📈 Reports & Analytics</h1></div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { icon: '💰', label: 'Total Revenue', value: `₹${(reports.totalRevenue || 0).toLocaleString()}`, color: 'var(--gradient-primary)' },
          { icon: '🤖', label: 'AI Predictions Made', value: reports.aiPredictions || 0, color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
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
      {reports.usersByRole && (
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>👥 Users by Role</h3>
          {reports.usersByRole.map(r => (
            <div key={r.role} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0', borderBottom: '1px solid var(--border-light)' }}>
              <span style={{ fontWeight: 600 }}>{r.role}</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{r._count.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default AdminReports;
