import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const CountUp = ({ end, duration = 2000, suffix = '' }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count.toLocaleString()}{suffix}</span>;
};

const FeatureCard = ({ icon, title, desc, color }) => (
  <div className="glass-card p-4 h-100" style={{ borderTop: `3px solid ${color}` }}>
    <div style={{ width: 56, height: 56, borderRadius: 16, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', marginBottom: '1rem' }}>
      {icon}
    </div>
    <h4 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.1rem' }}>{title}</h4>
    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>{desc}</p>
  </div>
);

const LandingPage = () => {
  const [stats, setStats] = useState({ farmers: 0, buyers: 0, products: 0, orders: 0 });

  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data.data)).catch(() => {});
  }, []);

  const features = [
    { icon: '📈', title: 'AI Price Prediction', desc: 'Get tomorrow and next-week price forecasts for your crops powered by Google Gemini AI.', color: '#1B7A3D' },
    { icon: '🔬', title: 'Disease Detection', desc: 'Upload leaf photos and get instant AI-powered disease diagnosis with treatment plans.', color: '#8BC34A' },
    { icon: '❄️', title: 'Cold Storage Finder', desc: 'Discover nearby cold storages and compare store-vs-sell profitability with AI insights.', color: '#3b82f6' },
    { icon: '🌤️', title: 'Weather Dashboard', desc: '7-day forecasts with AI-generated farming advice tailored to your crops and location.', color: '#f59e0b' },
    { icon: '📊', title: 'Demand Forecasting', desc: 'Understand market demand trends and identify the best time to sell your produce.', color: '#ec4899' },
    { icon: '💬', title: 'Bilingual AI Chat', desc: 'Get farming advice in English or Tamil from our intelligent AgroBot assistant.', color: '#8b5cf6' },
  ];

  const testimonials = [
    { name: 'Rajan K.', role: 'Tomato Farmer, Madurai', text: 'The price prediction helped me sell at the right time — I earned 30% more than last season!', avatar: '👨‍🌾' },
    { name: 'Priya S.', role: 'Buyer, Chennai', text: 'Fresh produce delivered from farms directly. No middlemen, so prices are great!', avatar: '👩‍💼' },
    { name: 'Murugan S.', role: 'Mango Farmer, Coimbatore', text: 'Disease detection caught early blight on my mango crop. Saved my entire harvest!', avatar: '👨‍🌾' },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container position-relative" style={{ zIndex: 10 }}>
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.15)', borderRadius: 50, padding: '6px 16px', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
                <span>🤖</span>
                <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.85rem', fontWeight: 500 }}>AI-Powered Farming Platform</span>
              </div>
              <h1 className="hero-title mb-4">
                Empower Your Farm with{' '}
                <span style={{ color: '#8BC34A' }}>AI Intelligence</span>
              </h1>
              <p className="hero-subtitle mb-5">
                Connect directly with buyers, predict crop prices, detect diseases early, and maximize your profits — all in one intelligent platform built for Indian farmers.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register?role=FARMER" className="btn-primary-custom" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700 }}>
                  🌾 I'm a Farmer
                </Link>
                <Link to="/register?role=BUYER" className="btn-outline-custom" style={{ borderColor: 'white', color: 'white' }}>
                  🛒 I'm a Buyer
                </Link>
                <Link to="/marketplace" style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 4, padding: '0.75rem 0' }}>
                  View Marketplace →
                </Link>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block">
              <div style={{ position: 'relative' }}>
                {/* Feature preview cards */}
                <div className="glass-card p-4 mb-3" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}>
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <span style={{ fontSize: '1.5rem' }}>📈</span>
                    <strong>Live Price Prediction</strong>
                  </div>
                  <div className="d-flex justify-content-between">
                    <div><div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Tomato - Madurai</div><div style={{ fontSize: '1.25rem', fontWeight: 700 }}>₹27/kg</div></div>
                    <div><div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Tomorrow</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8BC34A' }}>₹31/kg ↑</div></div>
                    <div><div style={{ opacity: 0.7, fontSize: '0.75rem' }}>Next Week</div><div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#8BC34A' }}>₹34/kg ↑</div></div>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="glass-card p-3" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>✅</div>
                    <div style={{ fontWeight: 700 }}>Healthy Leaf</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Disease: None</div>
                  </div>
                  <div className="glass-card p-3" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>🌤️</div>
                    <div style={{ fontWeight: 700 }}>28°C — Good</div>
                    <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>Coimbatore Today</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Stats */}
      <section style={{ background: 'var(--primary)', padding: '3rem 0' }}>
        <div className="container">
          <div className="row g-4 text-center text-white">
            {[
              { value: stats.farmers, label: 'Farmers', suffix: '+', icon: '👨‍🌾' },
              { value: stats.buyers, label: 'Buyers', suffix: '+', icon: '🛒' },
              { value: stats.products, label: 'Listed Crops', suffix: '+', icon: '🌿' },
              { value: stats.orders, label: 'Orders Placed', suffix: '+', icon: '📦' },
            ].map((s, i) => (
              <div key={i} className="col-6 col-md-3">
                <div style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>{s.icon}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                  <CountUp end={s.value || 150 + i * 50} suffix={s.suffix} />
                </div>
                <div style={{ opacity: 0.8, fontSize: '0.95rem' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '6rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-divider">
            <div className="section-label">AI-Powered Features</div>
            <h2 className="section-title">Everything Farmers Need</h2>
            <p className="section-subtitle">From price prediction to disease detection — our AI tools help you farm smarter and earn more.</p>
          </div>
          <div className="row g-4">
            {features.map((f, i) => (
              <div key={i} className="col-md-4 col-sm-6">
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section style={{ padding: '5rem 0', background: 'var(--primary-pale)' }}>
        <div className="container">
          <div className="section-divider">
            <div className="section-label">Process</div>
            <h2 className="section-title">How It Works</h2>
          </div>
          <div className="row g-4">
            {[
              { step: '01', icon: '📝', title: 'Register & Verify', desc: 'Create your farmer or buyer account in minutes. Get verified to unlock all features.' },
              { step: '02', icon: '🌿', title: 'List Your Crops', desc: 'Farmers post their produce with photos, quantity, price and location details.' },
              { step: '03', icon: '🤝', title: 'Connect & Trade', desc: 'Buyers browse, filter and order directly from farmers. No middlemen, better profits.' },
              { step: '04', icon: '🤖', title: 'AI Advisory', desc: 'Use AI tools for price prediction, disease detection, and weather-based farming advice.' },
            ].map((item, i) => (
              <div key={i} className="col-md-3 col-sm-6">
                <div className="glass-card p-4 text-center h-100">
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-dark)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>STEP {item.step}</div>
                  <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{item.icon}</div>
                  <h5 style={{ fontWeight: 700, marginBottom: '0.5rem' }}>{item.title}</h5>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '5rem 0', background: 'var(--bg)' }}>
        <div className="container">
          <div className="section-divider">
            <div className="section-label">Success Stories</div>
            <h2 className="section-title">What Farmers Say</h2>
          </div>
          <div className="row g-4">
            {testimonials.map((t, i) => (
              <div key={i} className="col-md-4">
                <div className="glass-card p-4 h-100">
                  <div style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--accent)' }}>"</div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{t.text}</p>
                  <div className="d-flex align-items-center gap-3">
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>{t.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.role}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'var(--gradient-hero)', padding: '5rem 0', textAlign: 'center', color: 'white' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'Poppins', fontSize: '2.5rem', fontWeight: 800, marginBottom: '1rem' }}>Ready to Transform Your Farm?</h2>
          <p style={{ opacity: 0.85, fontSize: '1.1rem', marginBottom: '2rem', maxWidth: 600, margin: '0 auto 2rem' }}>
            Join thousands of Indian farmers already selling smarter with AI.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link to="/register?role=FARMER" className="btn-primary-custom" style={{ background: 'white', color: 'var(--primary)', fontWeight: 700, fontSize: '1rem' }}>
              🌾 Start as Farmer
            </Link>
            <Link to="/register?role=BUYER" className="btn-outline-custom" style={{ borderColor: 'white', color: 'white', fontSize: '1rem' }}>
              🛒 Start as Buyer
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
