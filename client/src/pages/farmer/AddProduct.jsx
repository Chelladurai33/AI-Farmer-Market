import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { TAMIL_NADU_LOCATIONS } from '../../lib/locationData';

const AddProduct = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({
    name: '',
    categoryId: '',
    quantity: '',
    unit: 'kg',
    expectedPrice: '',
    harvestDate: '',
    village: user?.village || '',
    district: user?.district || '',
    state: user?.state || 'Tamil Nadu',
    description: ''
  });
  const [categories, setCategories] = useState([]);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locating, setLocating] = useState(false);
  const navigate = useNavigate();
  const fileRef = useRef();

  // If farmer already has a district/village, select it
  useEffect(() => {
    if (user) {
      setForm(f => ({
        ...f,
        district: user.district || '',
        village: user.village || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    api.get('/products/categories').then(r => {
      const cats = r.data.data || [];
      setCategories(cats);
      if (cats.length > 0) {
        setForm(f => ({ ...f, categoryId: cats[0].id }));
      }
    }).catch(() => {
      // Fallback
      api.get('/products').then(r => {
        const cats = [];
        r.data.data?.products?.forEach(p => { if (p.category && !cats.find(c => c.id === p.category.id)) cats.push(p.category); });
        setCategories(cats);
        if (cats.length > 0) {
          setForm(f => ({ ...f, categoryId: cats[0].id }));
        }
      }).catch(() => {});
    });
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        // Reverse geocoding using OpenStreetMap Nominatim
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
        const data = await res.json();
        if (data && data.address) {
          const addr = data.address;
          const stateName = addr.state || 'Tamil Nadu';
          
          // Match district
          let detectedDistrict = '';
          const addressText = JSON.stringify(addr).toLowerCase();
          for (const d of Object.keys(TAMIL_NADU_LOCATIONS)) {
            if (addressText.includes(d.toLowerCase())) {
              detectedDistrict = d;
              break;
            }
          }
          
          // Match taluk
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
        }
        
        // Save the farmer coordinates in the DB so distance maps can calculate proximity
        await api.put('/users/me', { latitude, longitude });
      } catch (err) {
        console.error("Geocoding error:", err);
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
    if (!form.categoryId) { setError('Please select a category'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => formData.append(k, v));
      if (image) formData.append('image', image);
      await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate('/farmer/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create product');
    }
    setLoading(false);
  };

  const UNITS = ['kg', 'quintal', 'ton', 'litre', 'dozen', 'piece'];
  const DEFAULT_CATEGORIES = ['Vegetables','Fruits','Grains & Cereals','Pulses & Legumes','Spices & Herbs','Oilseeds','Flowers'];

  const taluks = form.district ? TAMIL_NADU_LOCATIONS[form.district] || [] : [];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🌱 Add New Crop</h1>
        <p className="page-subtitle">List your produce for buyers to discover</p>
      </div>

      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626' }}>⚠️ {error}</div>}

      <div className="glass-card p-4">
        <form onSubmit={handleSubmit}>
          <div className="row g-3">
            {/* Image Upload */}
            <div className="col-12">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label-custom">Crop Photo</label>
                <button
                  type="button"
                  onClick={handleLiveLocation}
                  disabled={locating}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', background: 'var(--gradient-primary)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}
                >
                  📍 {locating ? 'Locating...' : 'Use Live Location'}
                </button>
              </div>
              <div onClick={() => fileRef.current?.click()} className="drop-zone" style={{ padding: '1.5rem', cursor: 'pointer' }}>
                {preview ? <img src={preview} alt="Preview" style={{ maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} /> :
                  <div><div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📷</div><div style={{ fontWeight: 600 }}>Click to upload crop photo</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>PNG, JPG up to 5MB</div></div>
                }
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImage} style={{ display: 'none' }} />
            </div>

            <div className="col-md-6">
              <label className="form-label-custom">Crop Name *</label>
              <input className="form-control-custom" placeholder="e.g. Fresh Tomatoes" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom">Category *</label>
              <select className="form-control-custom" value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} required>
                <option value="">Select category</option>
                {categories.length > 0 ? categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>) :
                  DEFAULT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Quantity *</label>
              <input type="number" className="form-control-custom" placeholder="500" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required min="1" />
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Unit *</label>
              <select className="form-control-custom" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}>
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label-custom">Expected Price (₹/{form.unit}) *</label>
              <input type="number" className="form-control-custom" placeholder="25" value={form.expectedPrice} onChange={e => setForm(f => ({ ...f, expectedPrice: e.target.value }))} required min="1" />
            </div>
            <div className="col-md-6">
              <label className="form-label-custom">Harvest Date *</label>
              <input type="datetime-local" className="form-control-custom" value={form.harvestDate} onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))} required />
            </div>

            <div className="col-md-6">
              <label className="form-label-custom">District *</label>
              <select className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value, village: '' }))} required>
                <option value="">Select district</option>
                {Object.keys(TAMIL_NADU_LOCATIONS).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label-custom">Sub-district / Taluk *</label>
              <select className="form-control-custom" value={form.village} onChange={e => setForm(f => ({ ...f, village: e.target.value }))} required disabled={!form.district}>
                <option value="">Select sub-district</option>
                {taluks.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            
            <div className="col-md-6">
              <label className="form-label-custom">State</label>
              <input className="form-control-custom" value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))} />
            </div>
            <div className="col-12">
              <label className="form-label-custom">Description</label>
              <textarea className="form-control-custom" rows={3} placeholder="Describe your crop — farming method, quality, etc." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn-primary-custom" disabled={loading}>{loading ? '⏳ Publishing...' : '🌿 Publish Crop'}</button>
            <button type="button" onClick={() => navigate('/farmer/products')} className="btn-outline-custom">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default AddProduct;
