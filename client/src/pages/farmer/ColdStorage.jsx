import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const ColdStorage = () => {
  const { user } = useAuthStore();
  const [storages, setStorages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState(null);
  const [bookForm, setBookForm] = useState({ cropName: '', quantityTons: '', startDate: '', endDate: '' });
  const [bookLoading, setBookLoading] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
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
    api.get(`/cold-storage/nearby?lat=${lat}&lng=${lng}&radius=200`).then(r => setStorages(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapLoaded || storages.length === 0 || !window.L) return;

    const L = window.L;
    const container = L.DomUtil.get('map-container');
    if (container) {
      container._leaflet_id = null; // Reset previous instances
    }

    const map = L.map('map-container').setView([lat, lng], 9);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // User Position Marker
    const userIcon = L.divIcon({
      html: '<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">📍</div>',
      className: 'custom-user-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 30]
    });
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('<b>Your Location</b>').openPopup();

    // Storage Markers
    storages.forEach(s => {
      if (s.latitude && s.longitude) {
        const storageIcon = L.divIcon({
          html: '<div style="font-size: 28px; line-height: 1; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.35));">❄️</div>',
          className: 'custom-storage-marker',
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        });
        L.marker([s.latitude, s.longitude], { icon: storageIcon })
          .addTo(map)
          .bindPopup(`<b>${s.name}</b><br>${s.address}<br>Rent: <b>₹${s.rentPerDay}/ton/day</b><br><a href="tel:${s.phone}" style="display:inline-block; margin-top:5px; font-weight:bold; font-size:11px;">📞 Call Facility</a>`);
      }
    });

    return () => {
      map.remove();
    };
  }, [mapLoaded, storages, lat, lng]);

  const handleBook = async (e) => {
    e.preventDefault();
    setBookLoading(true);
    try {
      await api.post(`/cold-storage/${booking.id}/book`, { ...bookForm, quantityTons: parseFloat(bookForm.quantityTons), startDate: new Date(bookForm.startDate).toISOString(), endDate: new Date(bookForm.endDate).toISOString() });
      setBookSuccess(true);
      setTimeout(() => { setBooking(null); setBookSuccess(false); }, 3000);
    } catch (err) { alert(err.response?.data?.error || 'Booking failed'); }
    setBookLoading(false);
  };

  const calcCost = () => {
    if (!booking || !bookForm.quantityTons || !bookForm.startDate || !bookForm.endDate) return 0;
    const days = Math.ceil((new Date(bookForm.endDate) - new Date(bookForm.startDate)) / 86400000);
    return days * booking.rentPerDay * parseFloat(bookForm.quantityTons || 0);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Finding nearby cold storages...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">❄️ Cold Storage Finder</h1>
        <p className="page-subtitle">Find nearby cold storage facilities and book instantly</p>
      </div>

      {/* Interactive Leaflet Map */}
      <div id="map-container" style={{ height: '350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1px solid var(--border)', marginBottom: '1.5rem', position: 'relative', zIndex: 1, background: '#f5fcf8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🗺️</div>
        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>Initializing Interactive Map...</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>📍 Your location: {lat.toFixed(4)}, {lng.toFixed(4)}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: booking ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>🏭 Nearby Cold Storages ({storages.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {storages.map(s => (
              <div key={s.id} className="glass-card p-4">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 2 }}>{s.name}</h4>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 2 }}>📍 {s.address}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>🕒 {s.operatingHours}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{s.rentPerDay}/ton/day</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📏 {s.distance} km away</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                  {s.supportedCrops?.slice(0, 4).map(c => <span key={c} style={{ padding: '2px 8px', borderRadius: 50, background: 'var(--primary-pale)', color: 'var(--primary)', fontSize: '0.72rem', fontWeight: 600 }}>{c}</span>)}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    🌡️ {s.minTemp}°C – {s.maxTemp}°C · 📦 {s.capacityTons}T
                  </div>
                  <button onClick={() => { setBooking(s); setBookSuccess(false); }} className="btn-primary-custom" style={{ fontSize: '0.8rem', padding: '0.4rem 1rem' }}>📅 Book</button>
                  <a href={`tel:${s.phone}`} className="btn-outline-custom" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}>📞</a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {booking && (
          <div className="glass-card p-4">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>📅 Book Storage</h3>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>at {booking.name}</div>
            {bookSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
                <h3 style={{ fontWeight: 700, color: 'var(--primary)' }}>Booking Successful!</h3>
                <p style={{ color: 'var(--text-muted)' }}>Your storage has been booked. You'll receive confirmation shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleBook}>
                <div className="mb-3"><label className="form-label-custom">Crop Name *</label><input className="form-control-custom" placeholder="e.g. Tomatoes" value={bookForm.cropName} onChange={e => setBookForm(f => ({ ...f, cropName: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">Quantity (Tons) *</label><input type="number" step="0.1" className="form-control-custom" placeholder="5.0" value={bookForm.quantityTons} onChange={e => setBookForm(f => ({ ...f, quantityTons: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">Start Date *</label><input type="date" className="form-control-custom" value={bookForm.startDate} onChange={e => setBookForm(f => ({ ...f, startDate: e.target.value }))} required /></div>
                <div className="mb-3"><label className="form-label-custom">End Date *</label><input type="date" className="form-control-custom" value={bookForm.endDate} onChange={e => setBookForm(f => ({ ...f, endDate: e.target.value }))} required /></div>
                {calcCost() > 0 && (
                  <div style={{ padding: '0.75rem', background: 'var(--primary-pale)', borderRadius: 'var(--radius-md)', marginBottom: '1rem', fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    💰 Estimated Cost: ₹{calcCost().toFixed(2)}
                  </div>
                )}
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="submit" className="btn-primary-custom flex-fill" disabled={bookLoading}>{bookLoading ? '⏳ Booking...' : '✅ Confirm Booking'}</button>
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
export default ColdStorage;
