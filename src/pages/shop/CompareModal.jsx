import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShopContext } from './ShopContext';

let injected = false;
function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById('vc-compare-modal-styles')) { injected = true; return; }
  const style = document.createElement('style');
  style.id = 'vc-compare-modal-styles';
  style.textContent = `
    @keyframes vcModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
    .vc-compare-overlay {
      position: fixed;
      inset: 0;
      background: rgba(24, 16, 42, 0.4);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      z-index: 2147483001;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow-y: auto;
      padding: 40px 20px;
      animation: vcModalFadeIn .2s ease;
    }
    @keyframes vcModalGrowFromBottom {
      from { opacity: 0; transform: translateY(70px) scale(.94); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .vc-compare-modal {
      background: rgba(var(--glass-rgb), 0.55);
      backdrop-filter: blur(34px) saturate(200%);
      -webkit-backdrop-filter: blur(34px) saturate(200%);
      border: 1px solid var(--border);
      border-radius: 26px;
      width: 100%;
      max-width: 980px;
      margin: auto;
      position: relative;
      padding: 30px;
      box-shadow: 0 30px 80px var(--shadow-lg), inset 0 1px 0 rgba(var(--glass-rgb), 0.5);
      animation: vcModalGrowFromBottom .38s cubic-bezier(.22,1,.36,1);
      transform-origin: center bottom;
      overflow-x: auto;
    }
    .vc-compare-modal::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(180deg, rgba(var(--glass-rgb), 0.35) 0%, rgba(var(--glass-rgb), 0) 30%);
      pointer-events: none;
    }
    .vc-compare-modal > * { position: relative; z-index: 1; }
    .vc-compare-close {
      position: absolute;
      top: 14px;
      right: 14px;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: 1px solid var(--border);
      background: rgba(var(--glass-rgb), 0.6);
      font-size: 20px;
      cursor: pointer;
      line-height: 42px;
      text-align: center;
      padding: 0;
      color: var(--lavender-700);
      transition: background .15s ease;
      z-index: 20;
    }
    .vc-compare-close:hover { background: var(--lavender-100); }
    .vc-compare-title {
      font-size: 1.35rem;
      font-weight: 800;
      margin: 0 0 22px;
      color: var(--text-dark);
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .vc-compare-table { width: 100%; border-collapse: collapse; }
    .vc-compare-th {
      text-align: center;
      padding: 10px;
      vertical-align: top;
      min-width: 190px;
    }
    .vc-compare-img {
      width: 92px;
      height: 92px;
      object-fit: cover;
      border-radius: 16px;
      margin: 0 auto 10px;
      display: block;
      box-shadow: 0 6px 16px var(--shadow-md);
    }
    .vc-compare-pname { font-weight: 700; font-size: .95rem; margin-bottom: 6px; color: var(--text-dark); }
    .vc-compare-remove {
      background: transparent;
      border: none;
      color: #d1335a;
      font-size: .74rem;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 0 8px;
    }
    .vc-compare-view-btn {
      background: var(--lavender-50);
      color: var(--lavender-700);
      border: 1px solid var(--border);
      border-radius: 9px;
      padding: 7px 13px;
      font-size: .76rem;
      font-weight: 700;
      cursor: pointer;
      transition: background .15s ease;
    }
    .vc-compare-view-btn:hover { background: var(--lavender-100); }
    .vc-compare-label-cell {
      text-align: left;
      padding: 13px 10px;
      font-weight: 700;
      color: var(--text-mid);
      font-size: .82rem;
      white-space: nowrap;
      border-top: 1px solid var(--border);
    }
    .vc-compare-cell {
      text-align: center;
      padding: 13px 10px;
      border-top: 1px solid var(--border);
      font-size: .9rem;
      color: var(--text-mid);
    }
    .vc-compare-price { font-weight: 800; color: var(--text-dark); }
    .vc-compare-add-btn {
      margin-top: 4px;
      background: linear-gradient(135deg, #6D28D9, #4C1D95);
      color: #fff;
      border: none;
      border-radius: 10px;
      padding: 9px 16px;
      font-size: .82rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 8px 18px rgba(76,29,149,0.3);
      transition: filter .15s ease;
    }
    .vc-compare-add-btn:hover { filter: brightness(1.1); }
    .vc-compare-add-btn.added {
      background: #2fa84f;
      box-shadow: 0 8px 18px rgba(47,168,79,0.35);
    }
    @media (max-width: 640px) {
      .vc-compare-modal { padding: 20px; border-radius: 18px; }
      .vc-compare-th, .vc-compare-cell, .vc-compare-label-cell { min-width: 140px; padding: 9px 6px; }
    }
  `;
  document.head.appendChild(style);
  injected = true;
}

export default function CompareModal({ onClose, onOpenDetail }) {
  const { products, compareList, removeFromCompare, addToCart } = useContext(ShopContext);
  const [addedIds, setAddedIds] = useState({});

  const handleAdd = (id) => {
    addToCart(id);
    setAddedIds((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 1200);
  };

  useEffect(() => {
    injectStyles();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const compareProducts = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  if (compareProducts.length === 0 || typeof document === 'undefined') return null;

  const rows = [
    { label: 'Price', render: (p) => (
      <span className="vc-compare-price">Rs {p.price.toLocaleString()}.00</span>
    )},
    { label: 'Rating', render: (p) => p.rating ? `★ ${p.rating}` : '—' },
    { label: 'Category', render: (p) => p.cat || '—' },
    { label: 'Availability', render: (p) => (p.stock > 0 ? 'In stock' : 'Out of stock') },
    { label: 'Description', render: (p) => (
      <span style={{ color: '#6b6480' }}>{p.desc || '—'}</span>
    )},
  ];

  const modal = (
    <div className="vc-compare-overlay" onClick={onClose}>
      <div className="vc-compare-modal" onClick={(e) => e.stopPropagation()}>
        <button className="vc-compare-close" onClick={onClose}>×</button>
        <h2 className="vc-compare-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4C1D95" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
          </svg>
          Compare Products
        </h2>

        <table className="vc-compare-table">
          <thead>
            <tr>
              <th className="vc-compare-th" style={{ minWidth: '110px' }}></th>
              {compareProducts.map((p) => (
                <th key={p.id} className="vc-compare-th">
                  <img src={p.img} alt={p.name} className="vc-compare-img" />
                  <div className="vc-compare-pname">{p.name}</div>
                  <button className="vc-compare-remove" onClick={() => removeFromCompare(p.id)}>
                    Remove
                  </button>
                  {onOpenDetail && (
                    <div>
                      <button className="vc-compare-view-btn" onClick={() => onOpenDetail(p)}>
                        View Details
                      </button>
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="vc-compare-label-cell">{row.label}</td>
                {compareProducts.map((p) => (
                  <td key={p.id} className="vc-compare-cell">{row.render(p)}</td>
                ))}
              </tr>
            ))}
            <tr>
              <td className="vc-compare-label-cell"></td>
              {compareProducts.map((p) => (
                <td key={p.id} className="vc-compare-cell">
                  <button
                    className={`vc-compare-add-btn ${addedIds[p.id] ? 'added' : ''}`}
                    onClick={() => handleAdd(p.id)}
                  >
                    {addedIds[p.id] ? '✓ Added' : 'Add to Cart'}
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}