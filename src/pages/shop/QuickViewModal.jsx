import { useContext, useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShopContext } from './ShopContext';

export default function QuickViewModal({ product, onClose, onViewDetails }) {
  const { addToCart } = useContext(ShopContext);
  const [added, setAdded] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const handleAdd = () => {
    addToCart(product.id);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  if (typeof document === 'undefined') return null;

  const modal = (
    <div className="quickview-overlay" onClick={onClose}>
      <div className="quickview-modal" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close" onClick={onClose}>×</button>

        <div className="quickview-img-wrap">
          <img ref={imgRef} src={product.img} alt={product.name} />
          {product.badge && <span className="detail-badge">{product.badge}</span>}
        </div>

        <div className="quickview-info">
          <h3>{product.name}</h3>
          <p className="quickview-desc">{product.desc}</p>
          <div className="quickview-price">Rs {product.price.toLocaleString()}.00</div>

          <div className="quickview-actions">
            <button className={`quickview-add-btn ${added ? 'added' : ''}`} onClick={handleAdd}>
              {added ? '✓ Added' : 'Add to Cart'}
            </button>
            <button className="quickview-details-btn" onClick={onViewDetails}>
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}