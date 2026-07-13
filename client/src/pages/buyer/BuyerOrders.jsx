import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const statusColors = { PENDING: '#f59e0b', ACCEPTED: '#3b82f6', DELIVERED: '#22c55e', REJECTED: '#ef4444', SHIPPED: '#8b5cf6', CANCELLED: '#6b7280' };

const BuyerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders?limit=50').then(r => setOrders(r.data.data?.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 My Orders</h1>
        <p className="page-subtitle">{orders.length} total orders</p>
      </div>
      {orders.length === 0 ? (
        <div className="glass-card p-5 text-center"><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div><h3>No orders yet</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map(order => (
            <div key={order.id} className="glass-card p-4">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{order.totalAmount.toLocaleString()}</span>
                  <span style={{ padding: '4px 12px', borderRadius: 50, background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontWeight: 700, fontSize: '0.8rem' }}>{order.status}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                {order.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.75rem', background: 'var(--primary-pale)', borderRadius: 8 }}>
                    <img src={item.product?.imageUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{item.product?.name}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>×{item.quantity} {item.product?.unit}</span>
                  </div>
                ))}
              </div>
              {order.payment && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  💳 Payment: <span style={{ fontWeight: 600, color: order.payment.status === 'SUCCESS' ? '#16a34a' : '#ef4444' }}>{order.payment.status}</span> via {order.payment.method}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default BuyerOrders;
