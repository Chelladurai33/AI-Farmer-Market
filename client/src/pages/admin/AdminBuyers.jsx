import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const AdminBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/buyers').then(r => setBuyers(r.data.data?.buyers || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">🛒 Buyers ({buyers.length})</h1></div>
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="table-custom">
          <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>District</th><th>Status</th><th>Joined</th></tr></thead>
          <tbody>
            {buyers.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.email}</td>
                <td style={{ fontSize: '0.85rem' }}>{b.phone || '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>{b.district || '-'}</td>
                <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 50, background: b.isVerified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: b.isVerified ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{b.isVerified ? '✅ Verified' : '⏳ Pending'}</span></td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminBuyers;
