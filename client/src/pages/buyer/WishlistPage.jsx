import React from 'react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlist] = React.useState([]);
  return (
    <div>
      <div className="page-header"><h1 className="page-title">❤️ Wishlist</h1></div>
      <div className="glass-card p-5 text-center">
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❤️</div>
        <h3>No items in wishlist</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Browse and add your favourite crops!</p>
        <Link to="/marketplace" className="btn-primary-custom">Browse Marketplace</Link>
      </div>
    </div>
  );
};
export default WishlistPage;
