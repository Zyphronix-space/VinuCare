import { useContext } from 'react';
import { ShopContext } from './ShopContext';
import { useUIFeedback } from '../../context/UIFeedbackContext';

export default function CartSidebar() {
  const { cart, products, changeQty, removeFromCart, clearCart, getTotal, getTotalItems } = useContext(ShopContext);
  const { success } = useUIFeedback();

  const total = getTotal();
  const totalItems = getTotalItems();
  const itemIds = Object.keys(cart).filter(id => cart[id] > 0);

  const handleCheckout = () => {
    success(`🎉 Order placed! Total: Rs. ${(total + 350).toLocaleString('en-LK')}\nThank you for shopping at VinuCare! 🐾`, 6000);
    clearCart();
  };

  return (
    <div className="cart-sidebar">
      <div className="cart-header">
        <h3>🛒 Your Cart</h3>
        <span className="cart-count-pill">{totalItems} {totalItems === 1 ? 'item' : 'items'}</span>
      </div>
      
      <div className="cart-items-list">
        {itemIds.length === 0 ? (
          <div className="cart-empty-msg">
            <div className="empty-icon">🛒</div>
            <p>Your cart is empty.<br />Add some products!</p>
          </div>
        ) : (
          itemIds.map(id => {
            const p = products.find(x => x.id === parseInt(id));
            if (!p) return null;
            const qty = cart[id];
            return (
              <div className="cart-item" key={id}>
                <div className="cart-item-img"><img src={p.img} alt={p.name} /></div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{p.name}</div>
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
        <div className="cart-footer">
          <div className="cart-subtotal"><span>Subtotal</span><span>Rs. {total.toLocaleString('en-LK')}</span></div>
          <div className="cart-subtotal"><span>Shipping</span><span>Rs. 350</span></div>
          <div className="cart-total"><span>Total</span><strong>Rs. {(total + 350).toLocaleString('en-LK')}</strong></div>
          <button className="checkout-btn" onClick={handleCheckout}>Checkout →</button>
          <button className="clear-btn" onClick={clearCart}>Clear Cart</button>
        </div>
      )}
    </div>
  );
}