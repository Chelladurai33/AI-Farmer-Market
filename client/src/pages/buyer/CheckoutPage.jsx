import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const CheckoutPage = () => {
  const [cart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const [method, setMethod] = useState('UPI');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    setError('');
    try {
      const orderRes = await api.post('/orders', {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price }))
      });
      const orderId = orderRes.data.data.id;
      await api.post('/payments', { orderId, method });
      localStorage.removeItem('cart');
      setSuccess(true);
      setTimeout(() => navigate('/buyer/orders'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Order failed. Please try again.');
    }
    setLoading(false);
  };

  if (success) return (
    <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
      <h2 style={{ fontWeight: 800, color: 'var(--primary)' }}>Order Placed!</h2>
      <p style={{ color: 'var(--text-muted)' }}>Your payment was successful. Redirecting to orders...</p>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">💳 Checkout</h1>
      </div>
      {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', marginBottom: '1rem', color: '#dc2626' }}>⚠️ {error}</div>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem' }}>
        <div>
          <div className="glass-card p-4 mb-3">
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>📦 Order Items</h4>
            {cart.map(item => (
              <div key={item.productId} style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', alignItems: 'center' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: 50, height: 50, borderRadius: 8, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>₹{item.price}/{item.unit} × {item.quantity}</div>
                </div>
                <div style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div className="glass-card p-4">
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>💳 Payment Method</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              {[{ value: 'UPI', icon: '📱', label: 'UPI' }, { value: 'CARD', icon: '💳', label: 'Card' }, { value: 'NETBANKING', icon: '🏦', label: 'Net Banking' }, { value: 'COD', icon: '💵', label: 'Cash on Delivery' }].map(m => (
                <button key={m.value} onClick={() => setMethod(m.value)}
                  style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: `2px solid ${method === m.value ? 'var(--primary)' : 'var(--border)'}`, background: method === m.value ? 'var(--primary-pale)' : 'transparent', cursor: 'pointer', fontWeight: 600, transition: 'all 0.2s', color: method === m.value ? 'var(--primary)' : 'var(--text-secondary)' }}>
                  <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{m.icon}</div>
                  <div style={{ fontSize: '0.875rem' }}>{m.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="glass-card p-4" style={{ minWidth: 250 }}>
          <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Total</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}><span style={{ color: 'var(--text-muted)' }}>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.875rem' }}><span style={{ color: 'var(--text-muted)' }}>Delivery</span><span style={{ color: 'var(--success)' }}>FREE</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.2rem', margin: '1rem 0 1.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
            <span>Total</span><span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
          </div>
          <button onClick={handleOrder} className="btn-primary-custom w-100" disabled={loading || cart.length === 0}>
            {loading ? '⏳ Processing...' : `✅ Place Order (₹${total.toLocaleString()})`}
          </button>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>🔒 Secured by 256-bit SSL</div>
        </div>
      </div>
    </div>
  );
};
export default CheckoutPage;
