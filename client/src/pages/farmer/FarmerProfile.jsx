import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';
import { TAMIL_NADU_LOCATIONS } from '../../lib/locationData';

const FarmerProfile = () => {
  const { user, updateUser } = useAuthStore();
  const [form, setForm] = useState({ name: '', phone: '', village: '', district: '', state: 'Tamil Nadu' });
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setForm({
        name: user.name || '',
        phone: user.phone || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || 'Tamil Nadu'
      });
    }
  }, [user]);

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const stateName = addr.state || 'Tamil Nadu';
          
          let detectedDistrict = '';
          const addressText = JSON.stringify(addr).toLowerCase();
          for (const d of Object.keys(TAMIL_NADU_LOCATIONS)) {
            if (addressText.includes(d.toLowerCase())) {
              detectedDistrict = d;
              break;
            }
          }
          
          let detectedTaluk = '';
          if (detectedDistrict) {
            for (const t of TAMIL_NADU_LOCATIONS[detectedDistrict]) {
              if (addressText.includes(t.toLowerCase())) {
                detectedTaluk = t;
                break;
              }
            }
          }
          
          const talukName = detectedTaluk || TAMIL_NADU_LOCATIONS[detectedDistrict]?.[0] || '';
          
          setForm(f => ({
            ...f,
            state: stateName,
            district: detectedDistrict || f.district,
            village: talukName || f.village
          }));

          // Immediately save coordinates in the backend
          const saveRes = await api.put('/users/me', {
            latitude,
            longitude,
            district: detectedDistrict || form.district,
            village: talukName || form.village,
            state: stateName
          });
          updateUser(saveRes.data.data);
          setSuccess(true);
          setTimeout(() => setSuccess(false), 3000);
        }
      } catch (err) {
        console.error("Geocoding failed:", err);
      } finally {
        setLocating(false);
      }
    }, (err) => {
      alert(`Could not fetch live location: ${err.message}`);
      setLocating(false);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.put('/users/me', form);
      updateUser(res.data.data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Update failed');
    }
    setLoading(false);
  };

  const taluks = form.district ? TAMIL_NADU_LOCATIONS[form.district] || [] : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👤 My Profile</h1>
        <p className="page-subtitle">Manage your account information</p>
      </div>
      <div className="glass-card p-4" style={{ maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '2rem', padding: '1.25rem', background: 'var(--gradient-primary)', borderRadius: 'var(--radius-lg)', color: 'white' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', fontWeight: 700 }}>{user?.name?.[0]}</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.2rem' }}>{user?.name}</div>
            <div style={{ opacity: 0.85, fontSize: '0.875rem' }}>{user?.email}</div>
            <span style={{ padding: '2px 10px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', fontWeight: 700, marginTop: 4, display: 'inline-block' }}>👨‍🌾 FARMER</span>
          </div>
          {user?.isVerified && <span style={{ marginLeft: 'auto', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: 50 }}>✅ Verified</span>}
        </div>

        {success && <div style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.875rem' }}>✅ Profile updated successfully!</div>}
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>⚠️ {error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12"><label className="form-label-custom">Full Name</label><input className="form-control-custom" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} /></div>
            <div className="col-12"><label className="form-label-custom">Phone</label><input className="form-control-custom" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            
            <div className="col-md-6">
              <label className="form-label-custom">District</label>
              <select className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, village: '' }))}>
                <option value="">Select district</option>
                {Object.keys(TAMIL_NADU_LOCATIONS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label-custom">Sub-district / Taluk</label>
              <select className="form-control-custom" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} disabled={!form.district}>
                <option value="">Select sub-district</option>
                {taluks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="col-12"><label className="form-label-custom">State</label><input className="form-control-custom" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} /></div>
            
            <div className="col-12 text-end mt-2">
              <button
                type="button"
                onClick={handleLiveLocation}
                disabled={locating}
                style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
              >
                📍 {locating ? 'Locating...' : 'Update Live Location'}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-primary-custom mt-3" disabled={loading}>{loading ? '⏳ Saving...' : '💾 Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};
export default FarmerProfile;
