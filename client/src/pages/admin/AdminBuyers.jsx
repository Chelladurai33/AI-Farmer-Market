import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const AdminBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    api.get('/admin/buyers')
      .then(r => setBuyers(r.data.data?.buyers || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const verify = async (id) => {
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/verify`);
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, isVerified: true } : b));
    } catch { alert('Failed to verify user'); }
    finally { setActionId(null); }
  };

  const suspend = async (id) => {
    if (!confirm('Suspend this buyer?')) return;
    setActionId(id);
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      setBuyers(prev => prev.map(b => b.id === id ? { ...b, isVerified: false } : b));
    } catch { alert('Failed to suspend user'); }
    finally { setActionId(null); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  const verified = buyers.filter(b => b.isVerified).length;
  const pending  = buyers.filter(b => !b.isVerified).length;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛒 Buyers ({buyers.length})</h1>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {[
          { label: 'Total', value: buyers.length, color: '#3b82f6' },
          { label: '✅ Verified', value: verified, color: '#16a34a' },
          { label: '⏳ Pending', value: pending, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} style={{ padding: '0.75rem 1.2rem', borderRadius: 10, background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `3px solid ${s.color}`, minWidth: 120 }}>
            <div style={{ fontWeight: 800, fontSize: '1.3rem', color: s.color }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="table-custom">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>District</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {buyers.map(b => (
              <tr key={b.id}>
                <td style={{ fontWeight: 600 }}>{b.name}</td>
                <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.email}</td>
                <td style={{ fontSize: '0.85rem' }}>{b.phone || '-'}</td>
                <td style={{ fontSize: '0.85rem' }}>{b.district || '-'}</td>
                <td>
                  <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 50, background: b.isVerified ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: b.isVerified ? '#16a34a' : '#dc2626', fontWeight: 700 }}>
                    {b.isVerified ? '✅ Verified' : '⏳ Pending'}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(b.createdAt).toLocaleDateString()}</td>
                <td>
                  {b.isVerified ? (
                    <button
                      onClick={() => suspend(b.id)}
                      disabled={actionId === b.id}
                      style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>
                      {actionId === b.id ? '...' : '🚫 Suspend'}
                    </button>
                  ) : (
                    <button
                      onClick={() => verify(b.id)}
                      disabled={actionId === b.id}
                      style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#16a34a', cursor: 'pointer', fontWeight: 600 }}>
                      {actionId === b.id ? '...' : '✅ Verify'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminBuyers;
