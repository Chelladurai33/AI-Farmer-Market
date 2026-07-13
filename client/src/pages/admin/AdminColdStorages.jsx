import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const AdminColdStorages = () => {
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/cold-storages').then(r => setStorages(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const deleteStorage = async (id) => {
    if (!confirm('Delete this cold storage?')) return;
    try {
      await api.delete(`/admin/cold-storages/${id}`);
      setStorages(prev => prev.filter(s => s.id !== id));
    } catch { alert('Failed to delete'); }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header"><h1 className="page-title">❄️ Cold Storages ({storages.length})</h1></div>
      <div className="row g-3">
        {storages.map(s => (
          <div key={s.id} className="col-md-4">
            <div className="glass-card p-4">
              <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.5rem' }}>{s.name}</h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📍 {s.address}</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', marginBottom: '0.75rem' }}>
                {[['📦 Capacity', `${s.capacityTons}T`], ['🌡️ Temp', `${s.minTemp}° to ${s.maxTemp}°C`], ['💰 Rate', `₹${s.rentPerDay}/ton/day`], ['📞 Phone', s.phone]].map(([l, v]) => (
                  <div key={l} style={{ padding: '0.4rem 0.5rem', background: 'var(--primary-pale)', borderRadius: 6 }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l}</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => deleteStorage(s.id)} style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>🗑️ Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AdminColdStorages;
