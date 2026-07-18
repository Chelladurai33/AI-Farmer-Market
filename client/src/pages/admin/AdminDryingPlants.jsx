import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import StorageModal from './StorageModal';

const PRODUCT_META = { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };

const Card = ({ children }) => (
  <div className="glass-card p-4">{children}</div>
);

const AdminDryingPlants = () => {
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/admin/solar-drying-plants')
      .then(r => setPlants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const deletePlant = async (id) => {
    if (!confirm('Delete this solar drying plant?')) return;
    try {
      await api.delete(`/admin/solar-drying-plants/${id}`);
      setPlants(p => p.filter(x => x.id !== id));
    } catch { alert('Failed to delete'); }
  };

  const onSaved = (item) => setPlants(p => [item, ...p]);

  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="page-title">☀️ Solar Drying Plants</h1>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Manage solar drying facilities for coconut, chilly, turmeric & more
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ padding: '0.6rem 1.4rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 14px rgba(245,158,11,0.35)' }}>
          ☀️ Add Solar Plant
        </button>
      </div>

      {/* Stats Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {[
          { icon: '☀️', label: 'Total Plants', value: plants.length, color: '#f59e0b' },
          { icon: '⚡', label: 'Total Capacity', value: `${plants.reduce((s, p) => s + (p.capacityKgPerDay || 0), 0).toLocaleString()} Kg/day`, color: '#10b981' },
          { icon: '🌾', label: 'Unique Products', value: [...new Set(plants.flatMap(p => p.supportedProducts || []))].length, color: '#3b82f6' },
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

      {/* Search */}
      <div style={{ marginBottom: '1.2rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by name or address..."
          style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.85rem', width: '100%', maxWidth: 380, outline: 'none', background: 'white' }}
        />
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : (
        <div className="row g-3">
          {filtered.map(p => (
            <div key={p.id} className="col-md-4">
              <Card>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', margin: 0, flex: 1 }}>{p.name}</h4>
                  <span style={{ fontSize: '0.68rem', padding: '2px 10px', borderRadius: 20, background: PRODUCT_META.bg, color: PRODUCT_META.color, fontWeight: 700, whiteSpace: 'nowrap', marginLeft: '0.4rem' }}>☀️ Solar</span>
                </div>

                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '0.6rem' }}>📍 {p.address}</div>

                {p.supportedProducts?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.6rem' }}>
                    {p.supportedProducts.slice(0, 4).map(c => (
                      <span key={c} style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: 20, background: PRODUCT_META.bg, color: PRODUCT_META.color, fontWeight: 600 }}>{c}</span>
                    ))}
                    {p.supportedProducts.length > 4 && (
                      <span style={{ fontSize: '0.66rem', padding: '2px 8px', borderRadius: 20, background: '#f3f4f6', color: '#9ca3af' }}>+{p.supportedProducts.length - 4} more</span>
                    )}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.35rem', marginBottom: '0.75rem' }}>
                  {[
                    ['⚡', `${p.capacityKgPerDay} Kg/day`],
                    ['🔆', p.dryingMethod || 'Solar'],
                    ['💰', `₹${p.rentPerDay}/day`],
                    ['📞', p.phone],
                    ['🕐', p.operatingHours],
                  ].map(([ic, v]) => (
                    <div key={ic} style={{ padding: '0.35rem 0.5rem', background: 'rgba(245,158,11,0.07)', borderRadius: 6, fontSize: '0.78rem', fontWeight: 600 }}>{ic} {v}</div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => deletePlant(p.id)}
                    style={{ padding: '4px 12px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.1)', color: '#dc2626', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                    🗑️ Delete
                  </button>
                </div>
              </Card>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '3rem', color: 'var(--text-muted)', textAlign: 'center', width: '100%' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>☀️</div>
              <div style={{ fontWeight: 600 }}>No solar drying plants found.</div>
              <div style={{ fontSize: '0.82rem', marginTop: '0.3rem' }}>Click "Add Solar Plant" to get started.</div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <StorageModal mode="plant" onClose={() => setShowModal(false)} onSaved={onSaved} />
      )}
    </div>
  );
};

export default AdminDryingPlants;
