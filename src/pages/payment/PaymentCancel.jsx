import { useMemo } from 'react';
import '../../styles/payment.css';

export default function PaymentCancel({ onNavigate }) {
  const { orderType } = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return { orderType: params.get('orderType') || '' };
  }, []);

  const destination = orderType === 'appointment' ? 'appointments' : 'shop';

  return (
    <div className="page active pr-wrap">
      <div className="pr-card">
        <div className="pr-icon pr-icon-pending">!</div>
        <h1>Payment cancelled</h1>
        <p>No worries — your {orderType === 'appointment' ? 'appointment' : 'order'} is still saved. You can complete payment any time from your account.</p>
        <div className="pr-actions">
          <button className="uf-btn uf-btn-primary" onClick={() => onNavigate(destination)}>
            Back to {destination === 'shop' ? 'Shop' : 'Appointments'}
          </button>
          <button className="uf-btn uf-btn-ghost" onClick={() => onNavigate('home')}>Go to Home</button>
        </div>
      </div>
    </div>
  );
}