import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', quantity: '', unit: 'kg', expectedPrice: '', description: '', isActive: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      const p = r.data.data;
      setForm({ name: p.name, quantity: p.quantity, unit: p.unit, expectedPrice: p.expectedPrice, description: p.description || '', isActive: p.isActive });
    }).catch(() => navigate('/farmer/products')).finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/products/${id}`, form);
      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update product');
    }
    setSaving(false);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">✏️ Edit Crop</h1>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626' }}>⚠️ {error}</div>}
      <div className="glass-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label-custom">Crop Name</label><input className="form-control-custom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
            <div className="col-md-4"><label className="form-label-custom">Quantity</label><input type="number" className="form-control-custom" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required /></div>
            <div className="col-md-4"><label className="form-label-custom">Unit</label><input className="form-control-custom" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} /></div>
            <div className="col-md-4"><label className="form-label-custom">Expected Price (₹)</label><input type="number" className="form-control-custom" value={form.expectedPrice} onChange={e => setForm(f => ({ ...f, expectedPrice: e.target.value }))} required /></div>
            <div className="col-12"><label className="form-label-custom">Description</label><textarea className="form-control-custom" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="col-12">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} />
                <span className="form-label-custom" style={{ margin: 0 }}>Active (visible to buyers)</span>
              </label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary-custom" disabled={saving}>{saving ? '⏳ Saving...' : '✅ Save Changes'}</button>
            <button type="button" onClick={() => navigate('/farmer/products')} className="btn-outline-custom">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default EditProduct;
