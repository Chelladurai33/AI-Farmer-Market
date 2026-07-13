import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { TAMIL_NADU_LOCATIONS } from '../../lib/locationData';

const RegisterPage = () => {
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: searchParams.get('role') || 'BUYER',
    phone: '', district: '', state: 'Tamil Nadu', village: '',
    latitude: null, longitude: null
  });
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  // Reset village if district changes
  useEffect(() => {
    setForm(f => ({ ...f, village: '' }));
  }, [form.district]);

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
            village: talukName || f.village,
            latitude,
            longitude
          }));
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
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
    try {
      const { user } = await register({
        name: form.name, email: form.email, password: form.password,
        role: form.role, phone: form.phone, district: form.district,
        state: form.state, village: form.village,
        latitude: form.latitude ? parseFloat(form.latitude) : undefined,
        longitude: form.longitude ? parseFloat(form.longitude) : undefined
      });
      const paths = { FARMER: '/farmer', BUYER: '/buyer', ADMIN: '/admin' };
      navigate(paths[user.role] || '/');
    } catch (err) {
      setError(err.message);
    }
  };

  const taluks = form.district ? TAMIL_NADU_LOCATIONS[form.district] || [] : [];

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '2rem' }}>
      <div className="glass-card p-5" style={{ width: '100%', maxWidth: 520 }}>
        <div className="text-center mb-4">
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🌱</div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Create Account</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Join the AI Farmer Marketplace</p>
        </div>

        {/* Role Selector */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[{ value: 'FARMER', icon: '👨‍🌾', label: 'Farmer' }, { value: 'BUYER', icon: '🛒', label: 'Buyer' }].map(r => (
            <button key={r.value} type="button"
              onClick={() => setForm(f => ({ ...f, role: r.value }))}
              style={{
                padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--border)'}`,
                background: form.role === r.value ? 'var(--primary-pale)' : 'transparent',
                cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', transition: 'all 0.2s',
                color: form.role === r.value ? 'var(--primary)' : 'var(--text-secondary)'
              }}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            <div className="col-12">
              <label className="form-label-custom">Full Name *</label>
              <input className="form-control-custom" placeholder="Your full name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="col-12">
              <label className="form-label-custom">Email Address *</label>
              <input type="email" className="form-control-custom" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required />
            </div>
            <div className="col-sm-6">
              <label className="form-label-custom">Password *</label>
              <input type="password" className="form-control-custom" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required />
            </div>
            <div className="col-sm-6">
              <label className="form-label-custom">Confirm Password *</label>
              <input type="password" className="form-control-custom" placeholder="Repeat password" value={form.confirmPassword} onChange={e => setForm(f => ({ ...f, confirmPassword: e.target.value }))} required />
            </div>
            <div className="col-sm-6">
              <label className="form-label-custom">Phone</label>
              <input className="form-control-custom" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>

            <div className="col-sm-6">
              <label className="form-label-custom">District *</label>
              <select className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} required>
                <option value="">Select district</option>
                {Object.keys(TAMIL_NADU_LOCATIONS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {form.role === 'FARMER' && (
              <>
                <div className="col-12">
                  <label className="form-label-custom">Sub-district / Taluk *</label>
                  <select className="form-control-custom" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} required disabled={!form.district}>
                    <option value="">Select sub-district</option>
                    {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-12 text-end">
                  <button
                    type="button"
                    onClick={handleLiveLocation}
                    disabled={locating}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                  >
                    📍 {locating ? 'Locating...' : 'Fetch Live Location'}
                  </button>
                </div>
              </>
            )}
          </div>

          <button id="register-btn" type="submit" className="btn-primary-custom w-100 mt-4" disabled={isLoading}>
            {isLoading ? '⏳ Creating account...' : `🌱 Register as ${form.role === 'FARMER' ? 'Farmer' : 'Buyer'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Already have an account? <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary)' }}>Log in</Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
