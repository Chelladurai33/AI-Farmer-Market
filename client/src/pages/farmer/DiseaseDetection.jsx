import React, { useState, useRef, useEffect } from 'react';
import api from '../../lib/api';

const DiseaseDetection = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    api.get('/disease-detection/history').then(r => setHistory(r.data.data || [])).catch(() => {});
  }, []);

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  const handleAnalyze = async () => {
    if (!image) { setError('Please upload an image first'); return; }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', image);
      const res = await api.post('/disease-detection/analyze', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setResult(res.data.data);
      const hist = await api.get('/disease-detection/history');
      setHistory(hist.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Analysis failed. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔬 Crop Disease Detection</h1>
        <p className="page-subtitle">Upload a leaf photo for instant AI-powered disease diagnosis</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Upload */}
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem' }}>📷 Upload Leaf Photo</h3>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem', marginBottom: '1rem', color: '#dc2626', fontSize: '0.875rem' }}>⚠️ {error}</div>}

          <div
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <img src={preview} alt="Uploaded leaf" style={{ maxWidth: '100%', maxHeight: 250, borderRadius: 8, objectFit: 'cover' }} />
            ) : (
              <div>
                <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>🍃</div>
                <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem' }}>Drop leaf photo here</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>or click to browse · PNG, JPG up to 5MB</div>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="btn-primary-custom flex-fill" onClick={handleAnalyze} disabled={loading || !image}>
              {loading ? '🤖 Analyzing with AI...' : '🔬 Analyze Disease'}
            </button>
            {image && <button onClick={() => { setImage(null); setPreview(''); setResult(null); }} className="btn-outline-custom">Clear</button>}
          </div>
        </div>

        {/* Result */}
        {loading ? (
          <div className="glass-card p-4 d-flex flex-column align-items-center justify-content-center text-center">
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'float 2s ease-in-out infinite' }}>🔬</div>
            <h3 style={{ fontWeight: 700 }}>Analyzing...</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Gemini AI is examining your crop leaf. This may take 10-30 seconds.</p>
          </div>
        ) : result ? (
          <div className="glass-card p-4">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: result.isHealthy ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                {result.isHealthy ? '✅' : '⚠️'}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{result.cropName}</div>
                <div style={{ fontSize: '0.875rem', color: result.isHealthy ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                  {result.isHealthy ? 'Healthy Plant' : `Disease: ${result.diseaseName}`}
                </div>
              </div>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Confidence</div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{(result.confidence * 100).toFixed(0)}%</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {[
                { label: '🔍 Symptoms', value: result.symptoms },
                { label: '🧪 Causes', value: result.causes },
                { label: '💊 Treatment', value: result.treatment },
                { label: '🌿 Organic Alternative', value: result.organicAlt },
                { label: '🛡️ Prevention', value: result.prevention },
                { label: '⏱️ Recovery Time', value: result.recoveryTime },
              ].filter(f => f.value).map(f => (
                <div key={f.label} style={{ padding: '0.5rem 0.75rem', background: 'var(--primary-pale)', borderRadius: 8 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--primary)', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.value}</div>
                </div>
              ))}
            </div>
            {result.reportPdfUrl && (
              <a href={result.reportPdfUrl} download="disease-report.pdf" className="btn-outline-custom" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
                📄 Download PDF Report
              </a>
            )}
          </div>
        ) : (
          <div className="glass-card p-4 d-flex flex-column align-items-center justify-content-center text-center">
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌿</div>
            <h3 style={{ fontWeight: 700 }}>AI Disease Analyzer</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Upload a leaf photo and our AI will diagnose diseases, suggest treatments, and generate a report.</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="glass-card p-4">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>📜 Detection History</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '0.75rem' }}>
            {history.map(h => (
              <div key={h.id} style={{ padding: '0.75rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', gap: '0.75rem' }}>
                <img src={h.imageUrl} alt={h.cropName} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{h.cropName}</div>
                  <div style={{ fontSize: '0.75rem', color: h.isHealthy ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{h.isHealthy ? 'Healthy' : h.diseaseName}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{new Date(h.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
export default DiseaseDetection;
