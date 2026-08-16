import { useEffect, useMemo, useState } from 'react';
import '../../styles/payment.css';
import { API_BASE_URL } from '../../config/api';

// PayHere sends the browser back here right after checkout, but its
// notify_url webhook (which actually marks the order/appointment as paid)
// runs server-to-server and can arrive a moment later. So this page polls
// /api/payments/status a few times before giving up.
export default function PaymentReturn({ onNavigate }) {
  const { orderType, orderId } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      orderType: params.get('orderType') || '',
      orderId: params.get('orderId') || '',
    };
  }, []);

  const [status, setStatus] = useState('checking'); // 'checking' | 'paid' | 'pending' | 'error'

  useEffect(() => {
    if (!orderType || !orderId) {
      setStatus('error');
      return;
    }

    let cancelled = false;
    let attempts = 0;

    async function poll() {
      attempts += 1;
      try {
        const res = await fetch(
          `${API_BASE_URL}/api/payments/status?orderType=${orderType}&orderId=${orderId}`,
          { credentials: 'include' }
        );
        const data = await res.json();
        if (cancelled) return;

        if (res.ok && data.payment_status === 'paid') {
          setStatus('paid');
          return;
        }
        if (attempts >= 5) {
          setStatus('pending');
          return;
        }
        setTimeout(poll, 2000);
      } catch {
        if (!cancelled) setStatus('error');
      }
    }

    poll();
    return () => { cancelled = true; };
  }, [orderType, orderId]);

  const destination = orderType === 'appointment' ? 'appointments' : 'shop';

  return (
    <div className="page active pr-wrap">
      <div className="pr-card">
        {status === 'checking' && (
          <>
            <div className="pm-spinner" style={{ margin: '0 auto 18px' }} />
            <h1>Confirming your payment…</h1>
            <p>This usually takes just a few seconds.</p>
          </>
        )}

        {status === 'paid' && (
          <>
            <div className="pr-icon pr-icon-success">✓</div>
            <h1>Payment successful!</h1>
            <p>Thanks — your {orderType === 'appointment' ? 'appointment' : 'order'} has been paid for.</p>
            <div className="pr-actions">
              <button className="uf-btn uf-btn-primary" onClick={() => onNavigate('home')}>Go to Home</button>
            </div>
          </>
        )}

        {status === 'pending' && (
          <>
            <div className="pr-icon pr-icon-pending">…</div>
            <h1>Payment still processing</h1>
            <p>We haven't received final confirmation yet. This can take a minute — check back shortly, your order is already saved.</p>
            <div className="pr-actions">
              <button className="uf-btn uf-btn-primary" onClick={() => onNavigate('home')}>Go to Home</button>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="pr-icon pr-icon-failed">✕</div>
            <h1>Couldn't confirm payment</h1>
            <p>Something went wrong checking your payment status. If you were charged, contact us with your order details.</p>
            <div className="pr-actions">
              <button className="uf-btn uf-btn-primary" onClick={() => onNavigate(destination)}>Back to {destination === 'shop' ? 'Shop' : 'Appointments'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}