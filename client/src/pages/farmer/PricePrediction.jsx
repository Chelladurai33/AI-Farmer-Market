import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

const DISTRICTS = ['Chennai','Coimbatore','Madurai','Salem','Trichy','Tirunelveli','Erode','Vellore','Thanjavur','Tiruppur'];
const CROPS = ['Tomato','Onion','Potato','Brinjal','Cabbage','Carrot','Mango','Banana','Rice','Wheat','Turmeric','Chilli','Groundnut'];

const PricePrediction = () => {
  const { user } = useAuthStore();
  const [form, setForm] = useState({ cropName: '', district: user?.district || '', currentPrice: '', harvestDate: '', quantity: '', unit: 'kg' });
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/predictions/price/history').then(r => setHistory(r.data.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/predictions/price', { ...form, currentPrice: parseFloat(form.currentPrice), quantity: parseFloat(form.quantity) });
      setResult(res.data.data);
      const hist = await api.get('/predictions/price/history');
      setHistory(hist.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Prediction failed. Please try again.');
    }
    setLoading(false);
  };

  const chartData = result ? [
    { label: 'Current', price: result.currentPrice },
    { label: 'Tomorrow', price: result.predictedTomorrow },
    { label: 'Next Week', price: result.predictedNextWeek },
  ] : [];

  const trendColor = result?.demandTrend === 'RISING' ? '#22c55e' : result?.demandTrend === 'FALLING' ? '#ef4444' : '#f59e0b';

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📈 Crop Price Prediction</h1>
        <p className="page-subtitle">AI-powered price forecasts to help you sell at the right time</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Form */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>🔍 Get Price Prediction</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>⚠️ {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label-custom">Crop Name *</label>
              <select className="form-control-custom" value={form.cropName} onChange={e => setForm(f => ({ ...f, cropName: e.target.value }))} required>
                <option value="">Select crop</option>
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label-custom">District *</label>
              <select className="form-control-custom" value={form.district} onChange={e => setForm(f => ({ ...f, district: e.target.value }))} required>
                <option value="">Select district</option>
                {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="row g-2 mb-3">
              <div className="col-6"><label className="form-label-custom">Current Price (₹/kg) *</label><input type="number" className="form-control-custom" placeholder="25" value={form.currentPrice} onChange={e => setForm(f => ({ ...f, currentPrice: e.target.value }))} required min="1" /></div>
              <div className="col-6"><label className="form-label-custom">Quantity (kg) *</label><input type="number" className="form-control-custom" placeholder="500" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} required min="1" /></div>
            </div>
            <div className="mb-3">
              <label className="form-label-custom">Harvest Date *</label>
              <input type="date" className="form-control-custom" value={form.harvestDate} onChange={e => setForm(f => ({ ...f, harvestDate: e.target.value }))} required />
            </div>
            <button type="submit" className="btn-primary-custom w-100" disabled={loading}>
              {loading ? '🤖 Analyzing market data...' : '📈 Get AI Prediction'}
            </button>
          </form>
        </div>

        {/* Result */}
        {result ? (
          <div>
            <div className="glass-card p-4 mb-3">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{result.cropName} · {result.district}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>Price Forecast</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', padding: '4px 12px', borderRadius: 50, background: `${trendColor}20`, color: trendColor, fontWeight: 700 }}>
                    {result.demandTrend === 'RISING' ? '↑' : result.demandTrend === 'FALLING' ? '↓' : '→'} {result.demandTrend}
                  </span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>Confidence: {(result.confidence * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                {[
                  { label: 'Current', value: `₹${result.currentPrice}`, color: 'var(--text-muted)' },
                  { label: 'Tomorrow', value: `₹${result.predictedTomorrow?.toFixed(1)}`, color: result.predictedTomorrow > result.currentPrice ? '#22c55e' : '#ef4444' },
                  { label: 'Next Week', value: `₹${result.predictedNextWeek?.toFixed(1)}`, color: result.predictedNextWeek > result.currentPrice ? '#22c55e' : '#ef4444' },
                ].map(p => (
                  <div key={p.label} style={{ textAlign: 'center', padding: '0.75rem', background: 'var(--primary-pale)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{p.label}</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: p.color }}>{p.value}</div>
                  </div>
                ))}
              </div>

              <ResponsiveContainer width="100%" height={140}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={11} />
                  <YAxis stroke="var(--text-muted)" fontSize={11} />
                  <Tooltip formatter={v => `₹${v.toFixed(2)}`} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Line type="monotone" dataKey="price" stroke="#1B7A3D" strokeWidth={2.5} dot={{ fill: '#1B7A3D', r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-4">
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem' }}>💡 AI Recommendation</h4>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>{result.recommendation}</p>
              <div style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: `${trendColor}15`, borderRadius: 'var(--radius-md)', fontSize: '0.8rem', color: trendColor, fontWeight: 600 }}>
                🎯 Best selling time: {result.bestSellingTime?.replace('_', ' ')}
              </div>
            </div>
          </div>
        ) : (
          <div className="glass-card p-4 d-flex flex-column align-items-center justify-content-center" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
            <h3 style={{ fontWeight: 700 }}>AI Price Analyst</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Fill in the form to get AI-powered price predictions for your crop</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📜 Prediction History</h3>
          <table className="table-custom">
            <thead><tr><th>Crop</th><th>District</th><th>Current</th><th>Tomorrow</th><th>Next Week</th><th>Trend</th><th>Date</th></tr></thead>
            <tbody>
              {history.map(h => (
                <tr key={h.id}>
                  <td style={{ fontWeight: 600 }}>{h.cropName}</td>
                  <td>{h.district}</td>
                  <td>₹{h.currentPrice}</td>
                  <td style={{ color: h.predictedTomorrow > h.currentPrice ? '#22c55e' : '#ef4444', fontWeight: 600 }}>₹{h.predictedTomorrow?.toFixed(1)}</td>
                  <td style={{ color: h.predictedNextWeek > h.currentPrice ? '#22c55e' : '#ef4444', fontWeight: 600 }}>₹{h.predictedNextWeek?.toFixed(1)}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: 50, background: '#1B7A3D20', color: '#1B7A3D', fontWeight: 600 }}>{h.demandTrend}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default PricePrediction;
