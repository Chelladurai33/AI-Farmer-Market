import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const BuyerProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', phone: '', district: '', state: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) setForm({ name: user.name || '', phone: user.phone || '', district: user.district || '', state: user.state || '' });
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {}
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header"><h1 className="page-title">👤 My Profile</h1></div>
      <div className="glass-card p-4" style={{ maxWidth: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>{user?.name?.[0]}</div>
          <div>
            <div style={{ fontWeight: 800 }}>{user?.name}</div>
            <div style={{ opacity: 0.85, fontSize: '0.875rem' }}>{user?.email}</div>
            <span style={{ background: 'rgba(255,255,255,0.2)', padding: '2px 8px', borderRadius: 50, fontSize: '0.72rem', fontWeight: 700 }}>🛒 BUYER</span>
          </div>
        </div>
        {success && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>✅ Profile updated!</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"><label className="form-label-custom">Full Name</label><input className="form-control-custom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label-custom">Phone</label><input className="form-control-custom" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className="mb-3"><label className="form-label-custom">District</label><input className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} /></div>
          <button type="submit" className="btn-primary-custom" disabled={loading}>{loading ? '⏳ Saving...' : '💾 Save'}</button>
        </form>
      </div>
    </div>
  );
};
export default BuyerProfile;
