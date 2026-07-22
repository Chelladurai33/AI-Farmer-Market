import React, { useEffect, useState } from 'react';
import api from '../../lib/api';

const statusColors = { PENDING: '#f59e0b', ACCEPTED: '#3b82f6', DELIVERED: '#22c55e', REJECTED: '#ef4444', SHIPPED: '#8b5cf6', CANCELLED: '#6b7280' };

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchOrders = (status = '') => {
    setLoading(true);
    api.get(`/admin/orders?limit=50${status ? '&status=' + status : ''}`).then(r => setOrders(r.data.data?.orders || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchOrders(); }, []);

  return (
    <div>
      <div className="page-header d-flex align-items-center justify-content-between">
        <div><h1 className="page-title">📦 Orders ({orders.length})</h1></div>
        <select className="form-control-custom" style={{ width: 'auto' }} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); fetchOrders(e.target.value); }}>
          <option value="">All Status</option>
          {['PENDING','ACCEPTED','SHIPPED','DELIVERED','REJECTED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      {loading ? <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div> : (
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table className="table-custom">
            <thead><tr><th>Order ID</th><th>Buyer</th><th>Items</th><th>Amount</th><th>Payment</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td><code style={{ fontSize: '0.8rem' }}>#{o.id.slice(0, 8)}</code></td>
                  <td style={{ fontWeight: 600, fontSize: '0.875rem' }}>{o.buyer?.name}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{o.items?.length}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{o.totalAmount.toLocaleString()}</td>
                  <td><span style={{ fontSize: '0.75rem', padding: '2px 6px', borderRadius: 50, background: o.payment?.status === 'SUCCESS' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: o.payment?.status === 'SUCCESS' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{o.payment?.status || 'UNPAID'}</span></td>
                  <td><span style={{ padding: '3px 8px', borderRadius: 50, background: `${statusColors[o.status]}20`, color: statusColors[o.status], fontWeight: 600, fontSize: '0.75rem' }}>{o.status}</span></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
export default AdminOrders;
