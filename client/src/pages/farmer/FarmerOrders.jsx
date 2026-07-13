import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const statusColors = { PENDING: '#f59e0b', ACCEPTED: '#3b82f6', DELIVERED: '#22c55e', REJECTED: '#ef4444', SHIPPED: '#8b5cf6', CANCELLED: '#6b7280' };

const FarmerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    api.get('/orders?limit=50').then(r => setOrders(r.data.data?.orders || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    } catch (err) { alert('Failed to update status'); }
    setUpdating(null);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading orders...</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📦 Orders</h1>
        <p className="page-subtitle">{orders.length} total orders</p>
      </div>
      {orders.length === 0 ? (
        <div className="glass-card p-5 text-center"><div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div><h3>No orders yet</h3><p style={{ color: 'var(--text-muted)' }}>Orders from buyers will appear here</p></div>
      ) : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="table-custom">
            <thead><tr><th>Order ID</th><th>Buyer</th><th>Items</th><th>Amount</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td><code style={{ fontSize: '0.8rem' }}>#{order.id.slice(0, 8)}</code></td>
                  <td><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{order.buyer?.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.buyer?.phone}</div></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{order.items?.length} item(s)</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{order.totalAmount.toLocaleString()}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: 50, background: `${statusColors[order.status]}20`, color: statusColors[order.status], fontWeight: 600 }}>{order.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    {order.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => updateStatus(order.id, 'ACCEPTED')} disabled={updating === order.id} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#16a34a', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✓ Accept</button>
                        <button onClick={() => updateStatus(order.id, 'REJECTED')} disabled={updating === order.id} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.15)', color: '#dc2626', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✗ Reject</button>
                      </div>
                    )}
                    {order.status === 'ACCEPTED' && (
                      <button onClick={() => updateStatus(order.id, 'SHIPPED')} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(139,92,246,0.15)', color: '#7c3aed', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>📦 Ship</button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button onClick={() => updateStatus(order.id, 'DELIVERED')} style={{ padding: '3px 10px', borderRadius: 6, border: 'none', background: 'rgba(34,197,94,0.15)', color: '#16a34a', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>✅ Delivered</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default FarmerOrders;
