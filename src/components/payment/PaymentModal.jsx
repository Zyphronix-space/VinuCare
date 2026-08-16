import { useState } from 'react';
import { submitToPayHere } from './payhereRedirect';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { CardIcon, KeyIcon } from '../ui/Icons';
import '../../styles/payment.css';
import { API_BASE_URL } from '../../config/api';

// orderType: 'shop' | 'appointment'
// orderId:   the numeric id of the order/appointment row
// amount:    the amount in LKR (used for display + PayHere)
// itemsDescription: short text shown on PayHere's checkout page
export default function PaymentModal({ open, onClose, orderType, orderId, amount, itemsDescription, user, onPaid }) {
  const { error: notifyError } = useUIFeedback();
  const [view, setView] = useState('methods'); // 'methods' | 'card-loading'

  if (!open) return null;

  const formattedAmount = Number(amount).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  async function handleCard() {
    setView('card-loading');
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/payhere/hash`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderId, orderType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not start card checkout');

      // Redirects the whole browser tab to PayHere's hosted checkout —
      // control returns via /payment-return or /payment-cancel.
      submitToPayHere({
        checkoutUrl: data.checkoutUrl,
        merchantId: data.merchantId,
        hash: data.hash,
        amount: data.amount,
        currency: data.currency,
        orderId: data.orderId,
        rawOrderId: orderId,
        orderType,
        user,
        itemsDescription,
        notifyUrl: data.notifyUrl,
      });
    } catch (err) {
      console.error('PayHere start error:', err);
      notifyError(err.message || 'Could not start card checkout.');
      setView('methods');
    }
  }

  return (
    <div className="pm-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pm-box">
        <div className="pm-head">
          <h3>Card payment</h3>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close">×</button>
        </div>
        <p className="pm-amount">Amount due: <strong>Rs. {formattedAmount}</strong></p>

        {view === 'methods' && (
          <div className="pm-methods">
            <div className="pm-card-panel">
              <span className="pm-method-icon pm-icon-card"><CardIcon size={20} /></span>
              <span className="pm-method-info">
                <span className="pm-method-name">Pay by card</span>
                <span className="pm-method-sub">Visa and Mastercard accepted</span>
              </span>
            </div>

            <button type="button" className="pm-pay-btn" onClick={handleCard}>
              Continue to secure checkout
            </button>

            <p className="pm-secure-note">
              <KeyIcon size={14} />
              Processed securely by PayHere. Card details are never stored on our servers.
            </p>
          </div>
        )}

        {view === 'card-loading' && (
          <div className="pm-loading">
            <div className="pm-spinner" />
            <span>Redirecting you to secure checkout…</span>
          </div>
        )}
      </div>
    </div>
  );
}