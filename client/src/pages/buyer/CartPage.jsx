import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const CartPage = () => {
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('cart') || '[]'));
  const navigate = useNavigate();

  const updateQty = (productId, qty) => {
    if (qty < 1) return removeItem(productId);
    const newCart = cart.map(i => i.productId === productId ? { ...i, quantity: qty } : i);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const removeItem = (productId) => {
    const newCart = cart.filter(i => i.productId !== productId);
    setCart(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🛍️ Shopping Cart</h1>
        <p className="page-subtitle">{cart.length} item(s) in your cart</p>
      </div>

      {cart.length === 0 ? (
        <div className="glass-card p-5 text-center">
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
          <h3 style={{ fontWeight: 700 }}>Your cart is empty</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse the marketplace to add items</p>
          <Link to="/marketplace" className="btn-primary-custom">🛒 Browse Marketplace</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', alignItems: 'start' }}>
          <div className="glass-card" style={{ overflow: 'hidden' }}>
            {cart.map((item, i) => (
              <div key={item.productId} style={{ display: 'flex', gap: '1rem', padding: '1rem', borderBottom: i < cart.length - 1 ? '1px solid var(--border-light)' : 'none', alignItems: 'center' }}>
                <img src={item.imageUrl} alt={item.name} style={{ width: 70, height: 70, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700 }}>{item.name}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 700 }}>₹{item.price}/{item.unit}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>-</button>
                  <span style={{ minWidth: 24, textAlign: 'center', fontWeight: 700 }}>{item.quantity}</span>
                  <button onClick={() => updateQty(item.productId, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontWeight: 700, fontSize: '1rem' }}>+</button>
                </div>
                <div style={{ fontWeight: 800, color: 'var(--primary)', minWidth: 70, textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString()}</div>
                <button onClick={() => removeItem(item.productId)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
              </div>
            ))}
          </div>
          <div className="glass-card p-4" style={{ minWidth: 250 }}>
            <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Order Summary</h4>
            <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '0.75rem' }}>
              {cart.map(i => <div key={i.productId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>{i.name} x{i.quantity}</span>
                <span>₹{(i.price * i.quantity).toLocaleString()}</span>
              </div>)}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.1rem', marginBottom: '1.25rem' }}>
              <span>Total</span>
              <span style={{ color: 'var(--primary)' }}>₹{total.toLocaleString()}</span>
            </div>
            <button onClick={() => navigate('/buyer/checkout')} className="btn-primary-custom w-100">Proceed to Checkout →</button>
          </div>
        </div>
      )}
    </div>
  );
};
export default CartPage;
