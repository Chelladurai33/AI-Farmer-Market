import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    api.get('/products/my').then(r => setProducts(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this crop?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/products/${id}`);
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert('Failed to delete product');
    }
    setDeletingId(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading your crops...</div>;

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div>
          <h1 className="page-title">🌿 My Crops</h1>
          <p className="page-subtitle">{products.length} product(s) listed</p>
        </div>
        <Link to="/farmer/products/add" className="btn-primary-custom">+ Add New Crop</Link>
      </div>

      {products.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🌱</div>
          <h3 style={{ fontWeight: 700 }}>No crops listed yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Start by adding your first crop to reach buyers!</p>
          <Link to="/farmer/products/add" className="btn-primary-custom">+ Add Your First Crop</Link>
        </div>
      ) : (
        <div className="row g-4">
          {products.map(product => (
            <div key={product.id} className="col-md-4 col-sm-6">
              <div className="product-card">
                <div style={{ overflow: 'hidden', height: 180 }}>
                  <img src={product.imageUrl} alt={product.name} className="product-card-img" />
                </div>
                <div className="product-card-body">
                  <div className="d-flex align-items-start justify-content-between mb-1">
                    <h5 style={{ fontWeight: 700, margin: 0, fontSize: '1rem' }}>{product.name}</h5>
                    <span className={`badge-custom ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                    📍 {product.district} • {product.category?.name}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)' }}>₹{product.expectedPrice}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>/{product.unit}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{product.quantity} {product.unit}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Link to={`/farmer/products/edit/${product.id}`} className="btn-outline-custom py-1 flex-fill text-center" style={{ fontSize: '0.8rem' }}>✏️ Edit</Link>
                    <button onClick={() => handleDelete(product.id)} disabled={deletingId === product.id}
                      style={{ flex: 1, padding: '0.35rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.08)', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                      {deletingId === product.id ? '⏳' : '🗑️ Delete'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default MyProducts;
