import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/farmers').then(r => setFarmers(r.data.data?.farmers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const verify = async (id) => {
    try {
      await api.patch(`/admin/users/${id}/verify`);
      setFarmers(prev => prev.map(f => f.id === id ? { ...f, isVerified: true } : f));
    } catch { alert('Failed to verify user'); }
  };

  const suspend = async (id) => {
    if (!confirm('Suspend this farmer?')) return;
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      setFarmers(prev => prev.map(f => f.id === id ? { ...f, isVerified: false } : f));
    } catch { alert('Failed to suspend user'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👨‍🌾 Farmers ({farmers.length})</h1>
      </div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="table-custom">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>District</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
          <tbody>
            {farmers.map(f => (
              <tr key={f.id}>
                <td style={{ fontWeight: 600 }}>{f.name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{f.email}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.phone || '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>{f.district || '-'}</td>
                <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 50, background: f.isVerified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: f.isVerified ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{f.isVerified ? '✅ Verified' : '⏳ Unverified'}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(f.createdAt).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {!f.isVerified && <button onClick={() => verify(f.id)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#16a34a', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Verify</button>}
                    <button onClick={() => suspend(f.id)} style={{ padding: '3px 8px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>Suspend</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminFarmers;
