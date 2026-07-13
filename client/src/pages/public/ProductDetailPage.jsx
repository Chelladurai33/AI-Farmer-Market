import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => setProduct(r.data.data)).catch(() => navigate('/marketplace')).finally(() => setLoading(false));
  }, [id]);

  const addToCart = () => {
    if (!user || user.role !== 'BUYER') { navigate('/login'); return; }
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.productId === product.id);
    let newCart;
    if (existing) newCart = cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i);
    else newCart = [...cart, { productId: product.id, name: product.name, price: product.expectedPrice, unit: product.unit, quantity: 1, imageUrl: product.imageUrl, farmerId: product.farmer?.id }];
    localStorage.setItem('cart', JSON.stringify(newCart));
    navigate('/buyer/cart');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;
  if (!product) return null;

  const avgRating = product.reviews?.length ? product.reviews.reduce((a, r) => a + r.rating, 0) / product.reviews.length : 0;

  return (
    <div style={{ minHeight: 'calc(100vh - 70px)', background: 'var(--bg)', padding: '2rem 0' }}>
      <div className="container">
        <Link to="/marketplace" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: '1.5rem' }}>← Back to Marketplace</Link>
        <div className="row g-5">
          <div className="col-md-5">
            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', borderRadius: 'var(--radius-xl)', objectFit: 'cover', maxHeight: 400, boxShadow: 'var(--shadow-lg)' }} />
          </div>
          <div className="col-md-7">
            <div style={{ marginBottom: '0.5rem' }}><span className="badge-custom badge-primary">{product.category?.name}</span></div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>{product.name}</h1>
            {avgRating > 0 && <div style={{ color: '#f59e0b', marginBottom: '0.75rem' }}>{'⭐'.repeat(Math.round(avgRating))} <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>({product.reviews?.length} reviews)</span></div>}

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', marginBottom: '0.25rem' }}>₹{product.expectedPrice}<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/{product.unit}</span></div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              {[
                { icon: '📦', label: 'Available', value: `${product.quantity} ${product.unit}` },
                { icon: '📍', label: 'Location', value: `${product.village || product.district}, ${product.state}` },
                { icon: '📅', label: 'Harvest Date', value: new Date(product.harvestDate).toLocaleDateString('en-IN') },
                { icon: '✅', label: 'Status', value: product.isActive ? 'Available' : 'Unavailable' },
              ].map(d => (
                <div key={d.label} style={{ padding: '0.6rem 0.75rem', background: 'var(--primary-pale)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{d.icon} {d.label}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>{d.value}</div>
                </div>
              ))}
            </div>

            {product.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1.25rem' }}>{product.description}</p>}

            <div className="glass-card p-3 mb-3" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 }}>{product.farmer?.name?.[0]}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{product.farmer?.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {product.farmer?.district}</div>
              </div>
              {product.farmer?.phone && <a href={`tel:${product.farmer.phone}`} className="btn-outline-custom ms-auto" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>📞 Contact</a>}
            </div>

            {product.isActive && user?.role === 'BUYER' && (
              <button onClick={addToCart} className="btn-primary-custom" style={{ fontSize: '1rem', padding: '0.875rem 2rem', width: '100%' }}>🛒 Add to Cart</button>
            )}
            {!user && <Link to="/login" className="btn-primary-custom" style={{ display: 'block', textAlign: 'center', fontSize: '1rem', padding: '0.875rem 2rem' }}>🔑 Login to Order</Link>}
          </div>
        </div>

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>⭐ Reviews</h2>
            <div className="row g-3">
              {product.reviews.map(r => (
                <div key={r.id} className="col-md-4">
                  <div className="glass-card p-3">
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.5rem' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.875rem', fontWeight: 700 }}>{r.user?.name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.user?.name}</div>
                        <div style={{ color: '#f59e0b', fontSize: '0.8rem' }}>{'⭐'.repeat(r.rating)}</div>
                      </div>
                    </div>
                    {r.comment && <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>{r.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default ProductDetailPage;
