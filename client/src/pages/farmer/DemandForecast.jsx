import React, { useState, useEffect } from 'react';
import useAuthStore from '../../store/authStore';
import api from '../../lib/api';

const DISTRICTS = ['Chennai','Coimbatore','Madurai','Salem','Trichy','Tirunelveli','Erode','Vellore','Thanjavur','Tiruppur'];
const CROPS = ['Tomato','Onion','Potato','Brinjal','Cabbage','Mango','Banana','Rice','Wheat','Turmeric','Chilli'];

const DemandForecast = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ cropName: '', district: user?.district || '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/forecast/demand', form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Forecast failed. Please try again.');
    }
    setLoading(false);
  };

  const demandColors = { HIGH: '#22c55e', VERY_HIGH: '#16a34a', MEDIUM: '#f59e0b', LOW: '#ef4444', VERY_LOW: '#dc2626' };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📊 Demand Forecast</h1>
        <p className="page-subtitle">Understand market demand for your crops</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🔍 Forecast Demand</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-custom">Crop Name *</label>
              <select className="form-control-custom" value={form.cropName} onChange={e => setForm(f => ({ ...f, cropName: e.target.value }))} required>
                <option value="">Select crop</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="form-label-custom">District *</label>
              <select className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} required>
                <option value="">Select district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <button type="submit" className="btn-primary-custom w-100" disabled={loading}>
              {loading ? '🤖 Analyzing demand...' : '📊 Forecast Demand'}
            </button>
          </form>
        </div>

        {result ? (
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: `${demandColors[result.demandLevel]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem' }}>📊</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.25rem' }}>{result.cropName}</div>
                <span style={{ padding: '4px 12px', borderRadius: 50, background: `${demandColors[result.demandLevel]}20`, color: demandColors[result.demandLevel], fontWeight: 700, fontSize: '0.875rem' }}>
                  {result.demandLevel} DEMAND
                </span>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Demand Score</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: demandColors[result.demandLevel] }}>{result.demandScore}/100</span>
              </div>
              <div className="progress-bar-custom">
                <div className="progress-fill" style={{ width: `${result.demandScore}%` }} />
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>{result.reason}</p>

            {result.recommendations?.length > 0 && (
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.5rem' }}>💡 Recommendations</div>
                {result.recommendations.map((r, i) => (
                  <div key={i} style={{ padding: '0.5rem 0.75rem', background: 'var(--primary-pale)', borderRadius: 8, marginBottom: '0.4rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    ✓ {r}
                  </div>
                ))}
              </div>
            )}

            {result.peakDemandMonths?.length > 0 && (
              <div style={{ marginTop: '0.75rem' }}>
                <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>PEAK MONTHS</div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {result.peakDemandMonths.map(m => <span key={m} style={{ padding: '2px 10px', borderRadius: 50, background: 'var(--primary)', color: 'white', fontSize: '0.75rem', fontWeight: 600 }}>{m}</span>)}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-4 d-flex flex-column align-items-center justify-content-center text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📊</div>
            <h3 style={{ fontWeight: 700 }}>Market Demand Analyzer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Get AI-powered demand forecasts to understand when and where to sell your crops.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default DemandForecast;
