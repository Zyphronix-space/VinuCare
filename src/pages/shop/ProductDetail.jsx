import { useState, useContext, useRef } from 'react';
import { ShopContext } from './ShopContext';
import { TruckIcon, BoltIcon, CashIcon } from '../../components/ui/Icons';

export default function ProductDetail({ product, categoryLabel, onHome, onBackToShop }) {
  const { addToCart, changeQty } = useContext(ShopContext);
  const [qty, setQty] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const imgRef = useRef(null);

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const savings = hasDiscount ? product.originalPrice - product.price : 0;
  const sku = product.sku || `VC-${String(product.id).padStart(5, '0')}`;
  const rating = product.rating ? parseFloat(product.rating) : null;
  const reviewCount = product.reviewCount || product.reviews;

  const handleAddToCart = () => {
    addToCart(product.id);
    if (qty > 1) changeQty(product.id, qty - 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="product-detail-page">
      {/* BREADCRUMB */}
      <div className="detail-breadcrumb">
        <span onClick={onHome}>Home</span>
        <span className="crumb-sep">›</span>
        <span onClick={onBackToShop}>Shop</span>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* GALLERY */}
        <div className="detail-gallery">
          <button type="button" className="detail-cat-tag" onClick={onBackToShop}>
            ← Back to Shop
          </button>
          <div className="detail-main-img-wrap">
            <img ref={imgRef} src={product.img} alt={product.name} className="detail-main-img" />
            {product.badge && <span className="detail-badge">{product.badge}</span>}
          </div>
          <div className="detail-zoom-hint">
            Zoom the image with the mouse
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
          <div className="detail-thumbs">
            <div className="detail-thumb active">
              <img src={product.img} alt={product.name} />
            </div>
          </div>
        </div>

        {/* INFO */}
        <div className="detail-info">
          <h1 className="detail-title">{product.name}</h1>

          {rating && (
            <div className="detail-rating-row">
              <span className="detail-stars">
                {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
              </span>
              {reviewCount && <span className="detail-review-count">{reviewCount} reviews</span>}
            </div>
          )}

          <div className="detail-meta-row">
            <span className="meta-label">Availability</span>
            <span className="meta-value in-stock">In stock</span>
          </div>
          <div className="detail-meta-row">
            <span className="meta-label">Product Type</span>
            <span className="meta-value">{categoryLabel}</span>
          </div>
          <div className="detail-meta-row">
            <span className="meta-label">SKU</span>
            <span className="meta-value">{sku}</span>
          </div>

          <p className="detail-desc">{product.desc}</p>

          <div className="detail-price-block">
            {hasDiscount && (
              <span className="detail-price-old">Rs {product.originalPrice.toLocaleString()}.00</span>
            )}
            <span className="detail-price-now">Rs {product.price.toLocaleString()}.00</span>
          </div>
          {hasDiscount && (
            <div className="detail-savings">(You save: Rs {savings.toLocaleString()}.00)</div>
          )}

          <div className="detail-qty-label">Quantity:</div>
          <div className="detail-qty-selector">
            <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
            <input
              type="text"
              value={qty}
              readOnly
            />
            <button onClick={() => setQty(q => q + 1)}>+</button>
          </div>

          <div className="detail-subtotal">
            Subtotal: <strong>Rs {(product.price * qty).toLocaleString()}.00</strong>
          </div>

          <button
            className={`detail-add-btn ${justAdded ? 'added' : ''}`}
            onClick={handleAddToCart}
          >
            {justAdded ? '✓ Added to Cart' : 'Add to Cart'}
          </button>

          <div className="detail-tags-row">
            <span className="detail-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><TruckIcon size={14} /> Free Delivery</span>
            <span className="detail-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><BoltIcon size={14} /> Fast Delivery</span>
            <span className="detail-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><CashIcon size={14} /> Cash on Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}