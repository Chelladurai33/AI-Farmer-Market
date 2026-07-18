import React, { useState } from 'react';
import api from '../../lib/api';

const inp = {
  padding:'0.6rem 0.8rem', borderRadius:8, border:'1.5px solid rgba(0,0,0,0.12)',
  fontSize:'0.85rem', outline:'none', width:'100%', boxSizing:'border-box', background:'white'
};
const label = { fontSize:'0.75rem', fontWeight:600, color:'#6b7280', display:'block', marginBottom:'0.25rem' };
const err = { fontSize:'0.7rem', color:'#ef4444', marginTop:'0.2rem', display:'block' };
const section = { fontSize:'0.7rem', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em', color:'#10b981', borderBottom:'1px solid #e5e7eb', paddingBottom:'0.4rem', marginBottom:'0.2rem' };
const grid2 = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.8rem' };
const grid3 = { display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.8rem' };

const CROPS = ['Rice','Wheat','Maize','Potato','Onion','Tomato','Carrot','Brinjal','Chilly','Garlic','Ginger','Mango','Banana','Grapes','Apple','Orange','Groundnut','Soybean','Turmeric','Cotton'];
const PRODUCTS = ['Coconut','Copra','Chilly','Turmeric','Ginger','Garlic','Grapes','Tomato','Onion','Mango Slices','Banana','Tamarind','Moringa','Amla'];
const HOURS = ['24/7','6 AM – 10 PM','8 AM – 8 PM','7 AM – 9 PM','9 AM – 6 PM'];
const METHODS = ['Solar','Solar + Biomass','Greenhouse Solar','Hybrid'];
const emptyStorage = { name:'', address:'', latitude:'', longitude:'', storageType:'COLD', capacityTons:'', supportedCrops:[], minTemp:'', maxTemp:'', rentPerDay:'', phone:'', operatingHours:'' };
const emptyPlant = { name:'', address:'', latitude:'', longitude:'', capacityKgPerDay:'', supportedProducts:[], dryingMethod:'Solar', phone:'', operatingHours:'', rentPerDay:'' };

export default function StorageModal({ mode, onClose, onSaved }) {
  const isPlant = mode === 'plant';
  const [form, setForm] = useState(isPlant ? emptyPlant : emptyStorage);
  const [errors, setErrors] = useState({});
  const [locStatus, setLocStatus] = useState('idle');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [cropInput, setCropInput] = useState('');

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrors(p => ({ ...p, [k]: '' })); };
  const handleChange = e => set(e.target.name, e.target.value);

  const toggleItem = (key, item) => setForm(p => {
    const list = p[key];
    return { ...p, [key]: list.includes(item) ? list.filter(x => x !== item) : [...list, item] };
  });

  const addCustom = (key, inputVal, setInput) => {
    const v = inputVal.trim();
    if (!v || form[key].includes(v)) return;
    setForm(p => ({ ...p, [key]: [...p[key], v] }));
    setInput('');
  };

  const fetchLocation = () => {
    if (!navigator.geolocation) { setLocStatus('error'); setErrors(p => ({ ...p, loc: 'Geolocation not supported' })); return; }
    setLocStatus('fetching');
    navigator.geolocation.getCurrentPosition(async pos => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      setForm(p => ({ ...p, latitude: lat.toFixed(6), longitude: lon.toFixed(6) }));
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}`);
        const d = await r.json();
        if (d.display_name) setForm(p => ({ ...p, address: d.display_name }));
      } catch {}
      setLocStatus('success');
    }, () => { setLocStatus('error'); setErrors(p => ({ ...p, loc: 'Could not fetch location. Allow access and retry.' })); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  const validate = () => {
    const e = {};
    if (!form.name || form.name.length < 2) e.name = 'Min 2 chars';
    if (!form.address || form.address.length < 5) e.address = 'Min 5 chars';
    if (!form.latitude) e.loc = 'Fetch live location first';
    if (isPlant) {
      if (!form.capacityKgPerDay || parseFloat(form.capacityKgPerDay) <= 0) e.capacityKgPerDay = 'Required';
      if (!form.supportedProducts.length) e.supportedProducts = 'Select at least one';
    } else {
      if (!form.capacityTons || parseFloat(form.capacityTons) <= 0) e.capacityTons = 'Required';
      if (!form.supportedCrops.length) e.supportedCrops = 'Select at least one';
      if (form.minTemp === '' || isNaN(+form.minTemp)) e.minTemp = 'Required';
      if (form.maxTemp === '' || isNaN(+form.maxTemp)) e.maxTemp = 'Required';
      if (!e.minTemp && !e.maxTemp && +form.minTemp >= +form.maxTemp) e.maxTemp = 'Max > Min';
    }
    if (!form.rentPerDay || parseFloat(form.rentPerDay) <= 0) e.rentPerDay = 'Required';
    if (!form.phone || form.phone.length < 10) e.phone = 'Min 10 digits';
    if (!form.operatingHours) e.operatingHours = 'Required';
    return e;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      const url = isPlant ? '/admin/solar-drying-plants' : '/admin/cold-storages';
      const payload = { ...form };
      if (!isPlant) { payload.capacityTons = +payload.capacityTons; payload.minTemp = +payload.minTemp; payload.maxTemp = +payload.maxTemp; }
      else { payload.capacityKgPerDay = +payload.capacityKgPerDay; }
      payload.latitude = +payload.latitude; payload.longitude = +payload.longitude; payload.rentPerDay = +payload.rentPerDay;
      const res = await api.post(url, payload);
      setSuccess(isPlant ? 'Solar drying plant added!' : 'Storage added!');
      setTimeout(() => { onSaved(res.data.data); onClose(); }, 1500);
    } catch (err) {
      setErrors(p => ({ ...p, _g: err.response?.data?.message || 'Failed to save' }));
    } finally { setSubmitting(false); }
  };

  const accentColor = isPlant ? '#f59e0b' : '#10b981';
  const title = isPlant ? '☀️ Add Solar Drying Plant' : '🏭 Add Storage Facility';

  const chipStyle = (selected, color) => ({
    padding:'3px 10px', borderRadius:20, cursor:'pointer', fontSize:'0.76rem', fontWeight:600,
    border:`1.5px solid ${selected ? color : '#e5e7eb'}`,
    background: selected ? `${color}20` : 'white',
    color: selected ? color : '#6b7280', transition:'all 0.15s'
  });

  const locBg = locStatus === 'success' ? 'linear-gradient(135deg,#10b981,#059669)' : locStatus === 'error' ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'linear-gradient(135deg,#3b82f6,#2563eb)';
  const locText = locStatus === 'fetching' ? '⏳ Fetching...' : locStatus === 'success' ? '✅ Location Fetched!' : locStatus === 'error' ? '❌ Retry Fetch Location' : '📡 Fetch Live Location';

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(6px)', zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem', overflowY:'auto' }}>
      <div style={{ background:'white', borderRadius:16, width:'100%', maxWidth:680, boxShadow:'0 24px 80px rgba(0,0,0,0.22)', overflow:'hidden', animation:'slideUp 0.3s ease' }}>
        <div style={{ background:`linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`, padding:'1.2rem 1.6rem', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <h2 style={{ margin:0, color:'white', fontSize:'1.1rem', fontWeight:700 }}>{title}</h2>
            <p style={{ margin:'0.2rem 0 0', color:'rgba(255,255,255,0.8)', fontSize:'0.8rem' }}>Fill in all facility details</p>
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.2)', border:'none', color:'white', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:'1rem' }}>✕</button>
        </div>

        {success && <div style={{ background:'#d1fae5', color:'#065f46', padding:'0.75rem 1.6rem', fontWeight:600, fontSize:'0.88rem' }}>✅ {success}</div>}
        {errors._g && <div style={{ background:'#fee2e2', color:'#991b1b', padding:'0.7rem 1.6rem', fontSize:'0.84rem' }}>⚠️ {errors._g}</div>}

        <form onSubmit={handleSubmit} style={{ padding:'1.4rem 1.6rem', display:'flex', flexDirection:'column', gap:'1rem', maxHeight:'72vh', overflowY:'auto' }}>

          <div style={section}>📋 Basic Information</div>

          <div><label style={label}>Facility Name *</label><input name="name" value={form.name} onChange={handleChange} placeholder={isPlant ? 'e.g. Karur Solar Dryer' : 'e.g. Coimbatore AgroStore'} style={{ ...inp, borderColor: errors.name ? '#ef4444' : 'rgba(0,0,0,0.12)' }} />{errors.name && <span style={err}>{errors.name}</span>}</div>
          <div><label style={label}>Full Address *</label><input name="address" value={form.address} onChange={handleChange} placeholder="Auto-filled from location or enter manually" style={{ ...inp, borderColor: errors.address ? '#ef4444' : 'rgba(0,0,0,0.12)' }} />{errors.address && <span style={err}>{errors.address}</span>}</div>

          <div>
            <label style={label}>📍 Location *</label>
            <button type="button" onClick={fetchLocation} disabled={locStatus==='fetching'} style={{ width:'100%', padding:'0.7rem', borderRadius:10, border:'none', cursor:locStatus==='fetching'?'not-allowed':'pointer', background:locBg, color:'white', fontWeight:700, fontSize:'0.88rem' }}>{locText}</button>
            {locStatus==='success' && form.latitude && (
              <div style={{ display:'flex', gap:'0.5rem', marginTop:'0.4rem' }}>
                <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, background:'#d1fae5', color:'#065f46', fontWeight:600 }}>📌 Lat: {form.latitude}</span>
                <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:8, background:'#d1fae5', color:'#065f46', fontWeight:600 }}>📌 Lng: {form.longitude}</span>
              </div>
            )}
            {errors.loc && <span style={err}>{errors.loc}</span>}
          </div>

          {!isPlant && (
            <>
              <div style={section}>🏷️ Storage Type</div>
              <div style={{ display:'flex', gap:'0.6rem' }}>
                {[['COLD','❄️ Cold','#3b82f6'],['NORMAL','📦 Normal','#10b981']].map(([val, lbl, color]) => (
                  <button key={val} type="button" onClick={() => set('storageType', val)}
                    style={{ flex:1, padding:'0.6rem', borderRadius:10, border:`2px solid ${form.storageType===val?color:'#e5e7eb'}`, background:form.storageType===val?`${color}18`:'white', color:form.storageType===val?color:'#6b7280', fontWeight:700, cursor:'pointer', fontSize:'0.85rem' }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </>
          )}

          <div style={section}>📦 Capacity & {isPlant ? 'Drying' : 'Temperature'}</div>

          {isPlant ? (
            <div style={grid2}>
              <div><label style={label}>Capacity (Kg/Day) *</label><input name="capacityKgPerDay" type="number" min="0" value={form.capacityKgPerDay} onChange={handleChange} placeholder="e.g. 500" style={{ ...inp, borderColor: errors.capacityKgPerDay?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.capacityKgPerDay && <span style={err}>{errors.capacityKgPerDay}</span>}</div>
              <div><label style={label}>Drying Method</label><select name="dryingMethod" value={form.dryingMethod} onChange={handleChange} style={inp}>{METHODS.map(m => <option key={m}>{m}</option>)}</select></div>
            </div>
          ) : (
            <div style={grid3}>
              <div><label style={label}>Capacity (Tons) *</label><input name="capacityTons" type="number" min="0" value={form.capacityTons} onChange={handleChange} placeholder="e.g. 500" style={{ ...inp, borderColor: errors.capacityTons?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.capacityTons && <span style={err}>{errors.capacityTons}</span>}</div>
              <div><label style={label}>Min Temp (°C) *</label><input name="minTemp" type="number" value={form.minTemp} onChange={handleChange} placeholder="-5" style={{ ...inp, borderColor: errors.minTemp?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.minTemp && <span style={err}>{errors.minTemp}</span>}</div>
              <div><label style={label}>Max Temp (°C) *</label><input name="maxTemp" type="number" value={form.maxTemp} onChange={handleChange} placeholder="15" style={{ ...inp, borderColor: errors.maxTemp?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.maxTemp && <span style={err}>{errors.maxTemp}</span>}</div>
            </div>
          )}

          <div style={section}>💰 Pricing & Contact</div>
          <div style={grid2}>
            <div><label style={label}>Rent / Day (₹) *</label><input name="rentPerDay" type="number" min="0" value={form.rentPerDay} onChange={handleChange} placeholder="e.g. 3" style={{ ...inp, borderColor: errors.rentPerDay?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.rentPerDay && <span style={err}>{errors.rentPerDay}</span>}</div>
            <div><label style={label}>Phone *</label><input name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 9876543210" style={{ ...inp, borderColor: errors.phone?'#ef4444':'rgba(0,0,0,0.12)' }} />{errors.phone && <span style={err}>{errors.phone}</span>}</div>
          </div>
          <div>
            <label style={label}>Operating Hours *</label>
            <select name="operatingHours" value={form.operatingHours} onChange={handleChange} style={{ ...inp, borderColor: errors.operatingHours?'#ef4444':'rgba(0,0,0,0.12)' }}>
              <option value="">-- Select --</option>
              {HOURS.map(h => <option key={h}>{h}</option>)}
            </select>
            {errors.operatingHours && <span style={err}>{errors.operatingHours}</span>}
          </div>

          <div style={section}>🌾 {isPlant ? 'Supported Products' : 'Supported Crops'} *</div>
          <div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.35rem', marginBottom:'0.5rem' }}>
              {(isPlant ? PRODUCTS : CROPS).map(item => {
                const key = isPlant ? 'supportedProducts' : 'supportedCrops';
                const sel = form[key].includes(item);
                return <button key={item} type="button" onClick={() => toggleItem(key, item)} style={chipStyle(sel, accentColor)}>{sel ? '✓ ' : ''}{item}</button>;
              })}
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <input value={cropInput} onChange={e => setCropInput(e.target.value)} onKeyDown={e => e.key==='Enter' && (e.preventDefault(), addCustom(isPlant?'supportedProducts':'supportedCrops', cropInput, setCropInput))} placeholder="Add custom..." style={{ ...inp, flex:1 }} />
              <button type="button" onClick={() => addCustom(isPlant?'supportedProducts':'supportedCrops', cropInput, setCropInput)} style={{ padding:'0.5rem 1rem', borderRadius:8, border:'none', background:accentColor, color:'white', fontWeight:700, cursor:'pointer' }}>+ Add</button>
            </div>
            {(isPlant ? errors.supportedProducts : errors.supportedCrops) && <span style={err}>{isPlant ? errors.supportedProducts : errors.supportedCrops}</span>}
          </div>

          <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', paddingTop:'0.5rem' }}>
            <button type="button" onClick={onClose} style={{ padding:'0.6rem 1.3rem', borderRadius:10, border:'1.5px solid #e5e7eb', background:'white', color:'#6b7280', fontWeight:600, cursor:'pointer' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding:'0.6rem 1.6rem', borderRadius:10, border:'none', background:`linear-gradient(135deg,${accentColor},${accentColor}cc)`, color:'white', fontWeight:700, cursor:submitting?'not-allowed':'pointer', boxShadow:`0 4px 15px ${accentColor}40` }}>
              {submitting ? '⏳ Saving...' : isPlant ? '☀️ Create Plant' : '🏭 Create Storage'}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
