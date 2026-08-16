import { useState, useContext, useRef } from 'react';
import { ShopContext } from './ShopContext';

export default function ProductCard({ product, onQuickView, onOpenDetail }) {
  const { addToCart, isCompared, toggleCompare, maxCompare, compareList, isWishlisted, toggleWishlist } = useContext(ShopContext);
  const [added, setAdded] = useState(false);
  const imgRef = useRef(null);
  const compared = isCompared(product.id);
  const wishlisted = isWishlisted(product.id);

  const handleAdd = (e) => {
    e.stopPropagation();
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const handleQuickView = (e) => {
    e.stopPropagation();
    onQuickView && onQuickView();
  };

  const handleCompare = (e) => {
    e.stopPropagation();
    if (!compared && compareList.length >= maxCompare) {
      return; // at cap — CompareBar communicates the limit
    }
    toggleCompare(product.id);
  };

  return (
    <div className="product-card">
      <div
        className="product-img-wrap"
        onClick={onOpenDetail}
        style={{ cursor: 'pointer' }}
      >
        <img ref={imgRef} src={product.img} alt={product.name} loading="lazy" />
        {product.badge && <span className="product-badge">{product.badge}</span>}

        {/* Quick View overlay */}
        <div className="product-quickview">
          <button className="quickview-btn" onClick={handleQuickView}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            Quick View
          </button>
        </div>

        {/* Action buttons */}
        <div className="product-actions">
          <button
            className={`action-btn ${added ? 'action-active' : ''}`}
            onClick={handleAdd}
            title="Add to Cart"
          >
            <span className="action-btn-icon-swap">
              <svg className="icon-cart" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              <svg className="icon-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </span>
          </button>
          <button
            className={`action-btn ${wishlisted ? 'action-wish' : ''}`}
            onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
            title="Wishlist"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#e55' : 'none'} stroke={wishlisted ? '#e55' : 'currentColor'} strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </button>
          <button
            className={`action-btn ${compared ? 'action-compare-active' : ''}`}
            title={compared ? 'Remove from Compare' : 'Add to Compare'}
            onClick={handleCompare}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={compared ? '#16a34a' : 'currentColor'} strokeWidth="2">
              <polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/>
              <polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="product-body">
        <div className="product-name" onClick={onOpenDetail} style={{ cursor: 'pointer' }}>
          {product.name}
        </div>
        <div className="product-desc">{product.desc}</div>
        <div className="product-price-wrap">
          <span className="product-currency">Rs.</span>
          <span className="product-price">{product.price.toLocaleString()}.00</span>
        </div>
      </div>
    </div>
  );
}