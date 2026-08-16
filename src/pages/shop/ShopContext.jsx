import { createContext, useState, useEffect, useRef } from 'react';
import { AUTH_CHANGED_EVENT } from '../../lib/authEvents';
import { API_BASE_URL } from '../../config/api';

export const ShopContext = createContext();

const API_BASE = `${API_BASE_URL}/api/admin/products`;

// The wishlist used to live under one global localStorage key shared by
// the whole browser, regardless of who was logged in — so every account
// on the same browser saw (and silently overwrote) the same list, and
// switching accounts without a full page reload left the previous user's
// wishlist showing until a refresh. Scoping the key by user id fixes both:
// each account gets its own persisted list, and the auth-changed listener
// below reloads it the moment the logged-in identity actually changes.
function currentUserKey() {
  try {
    const stored = localStorage.getItem('user');
    const parsed = stored ? JSON.parse(stored) : null;
    return parsed?.id != null ? String(parsed.id) : 'guest';
  } catch {
    return 'guest';
  }
}

function wishlistStorageKey(userKey) {
  return `vinucare_wishlist_${userKey}`;
}

function loadWishlistFor(userKey) {
  try {
    const saved = localStorage.getItem(wishlistStorageKey(userKey));
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const ShopProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState({});
  const [currentCategory, setCurrentCategory] = useState('all');
  const [currentBrand, setCurrentBrand] = useState('all');
  const [isAnimating, setIsAnimating] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const userKeyRef = useRef(currentUserKey());
  const [wishlist, setWishlist] = useState(() => loadWishlistFor(userKeyRef.current));
  const MAX_COMPARE = 4;

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    localStorage.setItem(wishlistStorageKey(userKeyRef.current), JSON.stringify(wishlist));
  }, [wishlist]);

  // Reload the wishlist whenever the logged-in identity changes — a login,
  // logout, or account switch in this same tab (AUTH_CHANGED_EVENT, see
  // lib/authEvents.js) or in another tab (the native `storage` event, which
  // only fires for tabs *other* than the one that made the change).
  useEffect(() => {
    function syncToCurrentUser() {
      const nextKey = currentUserKey();
      if (nextKey !== userKeyRef.current) {
        userKeyRef.current = nextKey;
        setWishlist(loadWishlistFor(nextKey));
      }
    }
    window.addEventListener(AUTH_CHANGED_EVENT, syncToCurrentUser);
    window.addEventListener('storage', syncToCurrentUser);
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, syncToCurrentUser);
      window.removeEventListener('storage', syncToCurrentUser);
    };
  }, []);

  async function loadProducts() {
    setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      const mapped = data.map(p => ({
        id: p.id,
        name: p.name,
        desc: p.description || '',
        price: Number(p.price) || 0,
        img: p.image || '',
        cat: p.cat,
        brand: p.brand || null,
        stock: p.stock,
        badge: p.stock <= 10 ? 'Low Stock' : null,
        rating: '4.8',
      }));
      setProducts(mapped);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setLoading(false);
    }
  }

  const addToCart = (id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const changeQty = (id, delta) => {
    setCart((prev) => {
      if (!prev[id]) return prev;
      const newQty = prev[id] + delta;
      const updatedCart = { ...prev };
      if (newQty <= 0) {
        delete updatedCart[id];
      } else {
        updatedCart[id] = newQty;
      }
      return updatedCart;
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => {
      const updatedCart = { ...prev };
      delete updatedCart[id];
      return updatedCart;
    });
  };

  const clearCart = () => setCart({});

  const isCompared = (id) => compareList.includes(id);

  const toggleCompare = (id) => {
    setCompareList((prev) => {
      if (prev.includes(id)) {
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= MAX_COMPARE) {
        return prev; // cap reached, ignore add
      }
      return [...prev, id];
    });
  };

  const removeFromCompare = (id) => {
    setCompareList((prev) => prev.filter((x) => x !== id));
  };

  const clearCompare = () => setCompareList([]);

  const isWishlisted = (id) => wishlist.includes(id);

  const toggleWishlist = (id) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const removeFromWishlist = (id) => {
    setWishlist((prev) => prev.filter((x) => x !== id));
  };

  const getTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const product = products.find((x) => x.id === parseInt(id));
      return product ? sum + product.price * qty : sum;
    }, 0);
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((a, b) => a + b, 0);
  };

  return (
    <ShopContext.Provider value={{
      products, loading, cart, currentCategory, setCurrentCategory,
      currentBrand, setCurrentBrand,
      addToCart, changeQty, removeFromCart, clearCart, getTotal, getTotalItems,
      isAnimating, refreshProducts: loadProducts,
      compareList, isCompared, toggleCompare, removeFromCompare, clearCompare,
      maxCompare: MAX_COMPARE,
      wishlist, isWishlisted, toggleWishlist, removeFromWishlist
    }}>
      {children}
    </ShopContext.Provider>
  );
};