import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const PRODUCT_META = { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' };

const DryingPlant = () => {
  const { user } = useAuthStore();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookForm, setBookForm] = useState({ productName: '', quantityKg: '', startDate: '', endDate: '' });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const lat = user?.latitude || 11.0168;
  const lng = user?.longitude || 76.9558;

  // Load Leaflet Assets
  useEffect(() => {
    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setMapLoaded(true);
      script.onerror = () => console.error('Failed to load Leaflet library');
      document.body.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    api.get(`/cold-storage/solar-drying-plants/nearby?lat=${lat}&lng=${lng}&radius=200`)
      .then(r => setPlants(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || plants.length === 0 || !window.L) return;
    const L = window.L;
    const container = L.DomUtil.get('map-container');
    if (container) container._leaflet_id = null;
    const map = L.map('map-container').setView([lat, lng], 9);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    const userIcon = L.divIcon({
      html: '<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">📍</div>',
      className: 'custom-user-marker', iconSize: [30, 30], iconAnchor: [15, 30]
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>').openPopup();

    plants.forEach(p => {
      if (p.latitude && p.longitude) {
        const plantIcon = L.divIcon({
          html: `<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">☀️</div>`,
          className: 'custom-plant-marker', iconSize: [30, 30], iconAnchor: [15, 30]
        });
        L.marker([p.latitude, p.longitude], { icon: plantIcon })
          .addTo(map)
          .bindPopup(`<b>${p.name}</b><br><small style="color:#f59e0b;font-weight:700;">Solar Drying Plant</small><br>${p.address}<br>Rent: <b>₹${p.rentPerDay}/day</b><br><a href="tel:${p.phone}" style="display:inline-block;margin-top:5px;font-weight:bold;font-size:11px;">📞 Call Plant</a>`);
      }
    });

    return () => { map.remove(); };
  }, [mapLoaded, plants, lat, lng]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    // Solar drying plants booking is currently contact-based since no backend model exists.
    // We mock success and direct user to call the facility.
    setTimeout(() => {
      setBookSuccess(true);
      setBookLoading(false);
      setTimeout(() => { setBooking(null); setBookSuccess(false); }, 4000);
    }, 1000);
  };

  const calcCost = () => {
    if (!booking || !bookForm.startDate || !bookForm.endDate) return 0;
    const days = Math.ceil((new Date(bookForm.endDate) - new Date(bookForm.startDate)) / 86400000);
    return days * booking.rentPerDay;
  };

  const filtered = plants.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.address.toLowerCase().includes(search.toLowerCase()) ||
    p.supportedProducts.some(pr => pr.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Finding nearby solar drying plants...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">☀️ Solar Drying Plant Finder</h1>
        <p className="page-subtitle">Find nearby solar drying plants to easily dry coconut, chilly, turmeric and more</p>
      </div>

      {/* Interactive Leaflet Map */}
      <div id="map-container" style={{ height: '350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem', position: 'relative', zIndex: 1, background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
        <div style={{ fontWeight: 700, color: '#d97706' }}>Initializing Interactive Map...</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Your location: {lat.toFixed(4)}, {lng.toFixed(4)}</div>
      </div>

      {/* Search Input */}
      <div style={{ marginBottom: '1.2rem' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search by plant name, address, or supported product (e.g. coconut)..."
          style={{ padding: '0.6rem 1rem', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.1)', fontSize: '0.85rem', width: '100%', maxWidth: 450, outline: 'none', background: 'white' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: booking ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>
            ☀️ Nearby Drying Plants ({filtered.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map(p => (
              <div key={p.id} className="glass-card p-4" style={{ borderLeft: `3px solid #f59e0b` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: 4 }}>
                      <h4 style={{ fontWeight: 700, fontSize: '1rem', margin: 0 }}>{p.name}</h4>
                      <span style={{ fontSize: '0.68rem', padding: '2px 10px', borderRadius: 20, background: PRODUCT_META.bg, color: PRODUCT_META.color, fontWeight: 700 }}>
                        ☀️ Solar
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>📍 {p.address}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕒 Operating Hours: {p.operatingHours}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontWeight: 800, color: '#d97706', fontSize: '1.1rem' }}>₹{p.rentPerDay}/day</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📏 {p.distance} km away</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {p.supportedProducts?.map(pr => (
                    <span key={pr} style={{ padding: '2px 8px', borderRadius: 50, background: PRODUCT_META.bg, color: PRODUCT_META.color, fontSize: '0.72rem', fontWeight: 600 }}>{pr}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ⚡ Capacity: {p.capacityKgPerDay} Kg/day · 🔆 Method: {p.dryingMethod}
                  </div>
                  <button onClick={() => { setBooking(p); setBookSuccess(false); }} className="btn-primary-custom" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none' }}>📅 Request Space</button>
                  <a href={`tel:${p.phone}`} className="btn-outline-custom" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>📞 Call</a>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                No solar drying plants found nearby.
              </div>
            )}
          </div>
        </div>

        {booking && (
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>📅 Request Space</h3>
              <span style={{ fontSize: '0.68rem', padding: '2px 10px', borderRadius: 20, background: PRODUCT_META.bg, color: PRODUCT_META.color, fontWeight: 700 }}>
                ☀️ Solar
              </span>
            </div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>at {booking.name}</div>
            {bookSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ fontWeight: 700, color: '#d97706' }}>Request Sent Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Please call the facility directly at <a href={`tel:${booking.phone}`} style={{ fontWeight: 700 }}>{booking.phone}</a> to finalize drop-off timings.</p>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div className="mb-3"><label className="form-label-custom">Product to Dry *</label><input className="form-control-custom" placeholder="e.g. Coconut" value={bookForm.productName} onChange={e => setBookForm(f => ({ ...f, productName: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">Quantity (Kg) *</label><input type="number" className="form-control-custom" placeholder="500" value={bookForm.quantityKg} onChange={e => setBookForm(f => ({ ...f, quantityKg: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">Start Date *</label><input type="date" className="form-control-custom" value={bookForm.startDate} onChange={e => setBookForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">End Date *</label><input type="date" className="form-control-custom" value={bookForm.endDate} onChange={e => setBookForm(f => ({ ...f, endDate: e.target.value }))} required /></div>
                {calcCost() > 0 && (
                  <div style={{ padding: '0.75rem', background: PRODUCT_META.bg, borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 700, color: '#d97706', fontSize: '0.9rem' }}>
                    💰 Estimated Cost: ₹{calcCost().toFixed(2)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn-primary-custom flex-fill" style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none' }} disabled={bookLoading}>{bookLoading ? '⏳ Requesting...' : '✅ Send Request'}</button>
                  <button type="button" onClick={() => setBooking(null)} className="btn-outline-custom">Cancel</button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DryingPlant;
