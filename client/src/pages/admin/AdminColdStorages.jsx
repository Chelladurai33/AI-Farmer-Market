import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import StorageModal from './StorageModal';

const TYPE_META = {
  COLD:   { label: '❄️ Cold',   color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  NORMAL: { label: '📦 Normal', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
};

const Card = ({ children }) => (
  <div className="glass-card p-4">{children}</div>
);

const AdminColdStorages = () => {
  const [storages, setStorages]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showModal, setShowModal]     = useState(false);
  const [filterType, setFilterType]   = useState('ALL');

  useEffect(() => {
    api.get('/admin/cold-storages')
      .then(r => setStorages(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deleteStorage = async (id) => {
    if (!confirm('Delete this storage?')) return;
    try {
      await api.delete(`/admin/cold-storages/${id}`);
      setStorages(p => p.filter(s => s.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const onSaved = (item) => setStorages(p => [item, ...p]);

  const filtered = filterType === 'ALL' ? storages : storages.filter(s => s.storageType === filterType);

  const tabBtn = (active) => ({
    padding: '0.55rem 1.4rem', borderRadius: 10, border: 'none', fontWeight: 700, fontSize: '0.88rem',
    cursor: 'pointer', transition: 'all 0.2s',
    background: active ? 'linear-gradient(135deg,#10b981,#059669)' : 'white',
    color: active ? 'white' : '#6b7280',
    boxShadow: active ? '0 4px 12px rgba(16,185,129,0.3)' : '0 1px 4px rgba(0,0,0,0.08)',
  });

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">🏭 Storages</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage Cold & Normal storage facilities
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#10b981,#059669)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>
          ＋ Add Storage
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '🏭', label: 'Total Storages', value: storages.length, color: '#10b981' },
          { icon: '❄️', label: 'Cold', value: storages.filter(s => s.storageType === 'COLD').length, color: '#3b82f6' },
          { icon: '📦', label: 'Normal', value: storages.filter(s => s.storageType === 'NORMAL').length, color: '#10b981' },
          { icon: '📦', label: 'Total Capacity', value: `${storages.reduce((s, x) => s + (x.capacityTons || 0), 0).toLocaleString()}T`, color: '#f59e0b' },
        ].map(s => (
          <div key={s.label} style={{ padding: '1rem 1.2rem', borderRadius: 12, background: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderLeft: `4px solid ${s.color}`, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: s.color }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {['ALL', 'COLD', 'NORMAL'].map(t => {
          const meta = t === 'ALL'
            ? { label: '🏭 All', color: '#6b7280', bg: 'rgba(107,114,128,0.1)' }
            : TYPE_META[t];
          const active = filterType === t;
          return (
            <button key={t} onClick={() => setFilterType(t)} style={{
              padding: '4px 14px', borderRadius: 20,
              border: `1.5px solid ${active ? meta.color : '#e5e7eb'}`,
              background: active ? meta.bg : 'white',
              color: active ? meta.color : '#6b7280',
              fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s'
            }}>{meta.label}</button>
          );
        })}
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', alignSelf: 'center', marginLeft: '0.5rem' }}>
          {filtered.length} facilit{filtered.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div className="row g-3">
          {filtered.map(s => {
            const meta = TYPE_META[s.storageType] || TYPE_META.COLD;
            return (
              <div key={s.id} className="col-md-4">
                <Card>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, flex: 1 }}>{s.name}</h4>
                    <span style={{ fontSize: '0.7rem', padding: '2px 10px', borderRadius: 20, background: meta.bg, color: meta.color, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '0.4rem' }}>{meta.label}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📍 {s.address}</div>

                  {s.supportedCrops?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.5rem' }}>
                      {s.supportedCrops.slice(0, 4).map(c => (
                        <span key={c} style={{ fontSize: '0.66rem', padding: '2px 7px', borderRadius: 20, background: meta.bg, color: meta.color, fontWeight: 600 }}>{c}</span>
                      ))}
                      {s.supportedCrops.length > 4 && (
                        <span style={{ fontSize: '0.66rem', padding: '2px 7px', borderRadius: 20, background: '#f3f4f6', color: '#9ca3af' }}>+{s.supportedCrops.length - 4}</span>
                      )}
                    </div>
                  )}

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.7rem' }}>
                    {[
                      ['📦', `${s.capacityTons}T`],
                      ['🌡️', `${s.minTemp}°–${s.maxTemp}°C`],
                      ['💰', `₹${s.rentPerDay}/day`],
                      ['📞', s.phone],
                    ].map(([ic, v]) => (
                      <div key={ic} style={{ padding: '0.35rem 0.5rem', background: 'var(--primary-pale)', borderRadius: 6, fontSize: '0.8rem', fontWeight: 600 }}>{ic} {v}</div>
                    ))}
                  </div>

                  <button
                    onClick={() => deleteStorage(s.id)}
                    style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.12)', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    🗑️ Delete
                  </button>
                </Card>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🏭</div>
              <div style={{ fontWeight: 600 }}>No storages found.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>Click "Add Storage" to get started.</div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <StorageModal mode="storage" onClose={() => setShowModal(false)} onSaved={onSaved} />
      )}
    </div>
  );
};

export default AdminColdStorages;
