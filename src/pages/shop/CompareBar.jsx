import { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { ShopContext } from './ShopContext';

let injected = false;
function injectStyles() {
  if (injected || typeof document === 'undefined') return;
  if (document.getElementById('vc-compare-bar-styles')) { injected = true; return; }
  const style = document.createElement('style');
  style.id = 'vc-compare-bar-styles';
  style.textContent = `
    @keyframes vcCompareBarIn {
      from { opacity: 0; transform: translateY(-16px) scale(.96); }
      to   { opacity: 1; transform: translateY(0) scale(1); }
    }
    .vc-compare-bar {
      position: fixed;
      left: 22px;
      top: calc(var(--nav-h, 72px) + 14px);
      z-index: 2147483000;
      animation: vcCompareBarIn .3s cubic-bezier(.22,1,.36,1);
      background: rgba(var(--glass-rgb), 0.82);
      backdrop-filter: blur(34px) saturate(200%);
      -webkit-backdrop-filter: blur(34px) saturate(200%);
      border: 1px solid var(--border);
      border-radius: 18px;
      box-shadow: 0 20px 50px var(--shadow-lg), inset 0 1px 0 rgba(var(--glass-rgb), 0.6);
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      width: 280px;
      max-width: calc(100vw - 32px);
      color: var(--text-dark);
      font-family: inherit;
      overflow: hidden;
      transition: background-color .35s ease, border-color .35s ease;
    }
    .vc-compare-bar::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      background: linear-gradient(180deg, rgba(var(--glass-rgb), 0.35) 0%, rgba(var(--glass-rgb), 0) 30%);
      pointer-events: none;
    }
    .vc-compare-bar > * { position: relative; z-index: 1; }
    .vc-compare-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .vc-compare-label {
      font-size: .82rem;
      font-weight: 700;
      letter-spacing: .01em;
      color: var(--text-dark);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .vc-compare-dismiss {
      background: var(--lavender-100);
      border: none;
      color: var(--text-mid);
      width: 22px;
      height: 22px;
      border-radius: 50%;
      font-size: 13px;
      line-height: 1;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background .15s ease;
    }
    .vc-compare-dismiss:hover { background: var(--lavender-200); }
    .vc-compare-chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .vc-compare-chip {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 12px;
      overflow: visible;
      background: var(--lavender-50);
      border: 1px solid var(--border);
    }
    .vc-compare-chip img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 11px;
      display: block;
    }
    .vc-compare-chip button {
      position: absolute;
      top: -6px;
      right: -6px;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: #e5335a;
      color: #fff;
      border: 2px solid var(--white);
      font-size: 10px;
      line-height: 13px;
      cursor: pointer;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform .15s ease;
    }
    .vc-compare-chip button:hover { transform: scale(1.12); }
    .vc-compare-hint {
      font-size: .74rem;
      color: var(--text-mid);
    }
    .vc-compare-actions { display: flex; gap: 8px; }
    .vc-compare-cta {
      flex: 1;
      background: linear-gradient(135deg, #8b5cf6, #6D28D9);
      color: #fff;
      border: 1px solid rgba(255,255,255,0.15);
      border-radius: 11px;
      padding: 10px 14px;
      font-weight: 700;
      font-size: .82rem;
      cursor: pointer;
      white-space: nowrap;
      transition: filter .15s ease, transform .15s ease;
      box-shadow: 0 6px 16px rgba(76,29,149,0.35);
    }
    .vc-compare-cta:hover:not(:disabled) { filter: brightness(1.12); transform: translateY(-1px); }
    .vc-compare-cta:disabled {
      background: var(--lavender-100);
      color: var(--text-light);
      cursor: not-allowed;
      box-shadow: none;
    }
    .vc-compare-clear {
      background: var(--lavender-50);
      color: var(--text-mid);
      border: 1px solid var(--border);
      border-radius: 11px;
      padding: 10px 14px;
      font-size: .8rem;
      font-weight: 600;
      cursor: pointer;
      white-space: nowrap;
      transition: background .15s ease;
    }
    .vc-compare-clear:hover { background: var(--lavender-100); }
    @media (max-width: 560px) {
      .vc-compare-bar { right: 14px; left: 14px; top: calc(var(--nav-h, 72px) + 10px); width: auto; }
    }
  `;
  document.head.appendChild(style);
  injected = true;
}

export default function CompareBar({ onOpenCompare }) {
  const { products, compareList, removeFromCompare, clearCompare, maxCompare } = useContext(ShopContext);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    injectStyles();
    setMounted(true);
  }, []);

  if (!mounted || compareList.length === 0) return null;

  const compareProducts = compareList
    .map((id) => products.find((p) => p.id === id))
    .filter(Boolean);

  const canCompare = compareProducts.length >= 2;

  const bar = (
    <div className="vc-compare-bar">
      <div className="vc-compare-top-row">
        <span className="vc-compare-label">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" />
            <polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" />
          </svg>
          Compare ({compareProducts.length}/{maxCompare})
        </span>
        <button className="vc-compare-dismiss" onClick={clearCompare} title="Clear comparison">×</button>
      </div>

      <div className="vc-compare-chips">
        {compareProducts.map((p) => (
          <div key={p.id} className="vc-compare-chip" title={p.name}>
            <img src={p.img} alt={p.name} />
            <button onClick={() => removeFromCompare(p.id)} title={`Remove ${p.name}`}>×</button>
          </div>
        ))}
      </div>

      {!canCompare && <span className="vc-compare-hint">Add one more to compare</span>}

      <div className="vc-compare-actions">
        <button
          className="vc-compare-cta"
          onClick={() => canCompare && onOpenCompare()}
          disabled={!canCompare}
        >
          Compare Now
        </button>
        <button className="vc-compare-clear" onClick={clearCompare}>
          Clear
        </button>
      </div>
    </div>
  );

  return createPortal(bar, document.body);
}