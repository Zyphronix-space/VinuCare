import { useContext, useState } from 'react';
import { ShopContext } from './ShopContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import PaymentModal from '../../components/payment/PaymentModal';
import { CartIcon, HeartIcon } from '../../components/ui/Icons';
import { API_BASE_URL } from '../../config/api';

export default function CartPage({ onNavigate, isLoggedIn, setRedirectAfterLogin, user }) {
  const { cart, products, changeQty, removeFromCart, clearCart, getTotal, getTotalItems,
          wishlist, removeFromWishlist, addToCart } = useContext(ShopContext);
  const { success, error: notifyError } = useUIFeedback();
  const [payment, setPayment] = useState(null); // { orderId, amount } | null

  const total      = getTotal();
  const totalItems = getTotalItems();
  const itemIds    = Object.keys(cart).filter(id => cart[id] > 0);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      setRedirectAfterLogin('cart');
      onNavigate('login');
      return;
    }
    try {
      const items = itemIds.map(id => {
        const p = products.find(x => x.id === parseInt(id));
        return { id: p.id, name: p.name, qty: cart[id], price: p.price };
      });
      const grandTotal = total + 350;
      const res = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total: grandTotal, items }),
      });
      const data = await res.json();
      if (!res.ok) { notifyError(data.message || 'Order failed'); return; }
      clearCart();
      setPayment({ orderId: data.orderId, amount: grandTotal });
    } catch {
      notifyError('Cannot connect to server.');
    }
  };

  return (
   <>
   <div className="page active" style={{ paddingTop: 'calc(var(--nav-h) + 30px)', paddingBottom: '40px', paddingLeft: 'max(20px, (100% - 1200px)/2)', paddingRight: 'max(20px, (100% - 1200px)/2)', minHeight: '80vh' }}>

      <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', borderBottom: '2px solid var(--border-light)', paddingBottom: '15px' }}>
        <h3 style={{ margin: 0, fontSize: '1.8rem', display: 'flex', alignItems: 'center', gap: 10 }}><CartIcon size={24} /> Your Shopping Cart</h3>
        <span className="cart-count-pill">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>

      <div className="cart-page-wrapper" style={{ display: 'grid', gridTemplateColumns: itemIds.length > 0 ? '2fr 1fr' : '1fr', gap: '30px', alignItems: 'start' }}>

        <div className="cart-items-list" style={{ background: 'var(--white)', padding: '10px 20px', borderRadius: '12px', boxShadow: '0 4px 15px var(--shadow-xs)' }}>
          {itemIds.length === 0 ? (
            <div className="cart-empty-msg" style={{ textAlign: 'center', padding: '60px 20px', display: 'block' }}>
              <div style={{ opacity: 0.5, marginBottom: '15px', display: 'flex', justifyContent: 'center' }}><CartIcon size={56} /></div>
              <p style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: '0 0 20px 0' }}>Your cart is empty.</p>
              <button className="btn btn-primary" onClick={() => onNavigate('shop')}>Go to Shop</button>
            </div>
          ) : (
            itemIds.map(id => {
              const p = products.find(x => x.id === parseInt(id));
              if (!p) return null;
              const qty = cart[id];
              return (
                <div className="cart-item" key={id} style={{ borderBottom: '1px solid var(--border-light)', padding: '20px 0' }}>
                  <div className="cart-item-img"><img src={p.img} alt={p.name} /></div>
                  <div className="cart-item-info">
                    <div className="cart-item-name" style={{ fontSize: '1.1rem', fontWeight: '600' }}>{p.name}</div>
                    <div className="cart-item-price">Rs. {(p.price * qty).toLocaleString('en-LK')}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => changeQty(p.id, -1)}>−</button>
                    <span className="qty-num">{qty}</span>
                    <button className="qty-btn" onClick={() => changeQty(p.id, 1)}>+</button>
                  </div>
                  <button className="remove-btn" onClick={() => removeFromCart(p.id)} title="Remove">✕</button>
                </div>
              );
            })
          )}
        </div>

        {itemIds.length > 0 && (
          <div className="cart-footer" style={{ background: 'var(--white)', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px var(--shadow-sm)', position: 'sticky', top: '100px' }}>
            <h4 style={{ margin: '0 0 15px 0', fontSize: '1.2rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '10px' }}>Order Summary</h4>
            <div className="cart-subtotal"><span>Subtotal</span><span>Rs. {total.toLocaleString('en-LK')}</span></div>
            <div className="cart-subtotal"><span>Shipping</span><span>Rs. 350</span></div>
            <div className="cart-total" style={{ borderTop: '1px solid var(--border-light)', paddingTop: '15px', marginTop: '10px' }}>
              <span>Total</span><strong>Rs. {(total + 350).toLocaleString('en-LK')}</strong>
            </div>
            <button className="checkout-btn" style={{ marginTop: '20px' }} onClick={handleCheckout}>Checkout →</button>
            <button className="clear-btn" style={{ marginTop: '10px', width: '100%' }} onClick={clearCart}>Clear Cart</button>
          </div>
        )}
      </div>

      {wishlist.length > 0 && (
        <div className="wishlist-section" style={{ marginTop: '40px' }}>
          <div className="cart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--border-light)', paddingBottom: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: 10 }}><HeartIcon size={20} /> Your Wishlist</h3>
            <span className="cart-count-pill">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</span>
          </div>

          <div
            className="wishlist-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}
          >
            {wishlist.map(id => {
              const p = products.find(x => x.id === id);
              if (!p) return null;
              return (
                <div
                  key={id}
                  className="wishlist-item"
                  style={{ background: 'var(--white)', borderRadius: '12px', boxShadow: '0 4px 15px var(--shadow-xs)', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}
                >
                  <img src={p.img} alt={p.name} style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ fontWeight: 600 }}>{p.name}</div>
                  <div style={{ color: 'var(--text-light)' }}>Rs. {p.price.toLocaleString('en-LK')}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                    <button
                      className="btn btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => addToCart(p.id)}
                    >
                      Add to Cart
                    </button>
                    <button
                      className="remove-btn"
                      title="Remove from wishlist"
                      onClick={() => removeFromWishlist(p.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>

    <PaymentModal
      open={!!payment}
      onClose={() => setPayment(null)}
      orderType="shop"
      orderId={payment?.orderId}
      amount={payment?.amount || 0}
      itemsDescription="VinuCare shop order"
      user={user}
      onPaid={() => success('Payment successful! Thank you for shopping at VinuCare!', 6000)}
    />
    </>
  );
}