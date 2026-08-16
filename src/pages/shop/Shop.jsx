import { useState, useContext, useMemo } from 'react';
import ExtraBanners from '../../components/ExtraBanners';
import ShopHero from './ShopHero';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import ProductDetail from './ProductDetail';
import ProductDetailSkeleton from './ProductDetailSkeleton';
import QuickViewModal from './QuickViewModal';
import CompareBar from './CompareBar';
import CompareModal from './CompareModal';
import { ShopContext } from './ShopContext';
import '../../styles/shop.css';
import '../../styles/product-detail.css';
import AllProductsImg from '../../assets/categories/all products.jpg';
import { SearchIcon } from '../../components/ui/Icons';
import GlassSelect from '../appointments/GlassSelect';

const CATEGORIES = [
  { id: 'all',   label: 'All Products', img: AllProductsImg },
  { id: 'dogs',  label: 'Dogs',         img: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200&h=200&fit=crop' },
  { id: 'cats',  label: 'Cats',         img: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&h=200&fit=crop' },
  { id: 'birds', label: 'Birds',        img: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=200&h=200&fit=crop' },
  { id: 'fish',  label: 'Fish',         img: 'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=200&h=200&fit=crop' },
  { id: 'rabbits', label: 'Rabbits',   img: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=200&h=200&fit=crop' },
  { id: 'cows',  label: 'Cattle',       img: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=200&h=200&fit=crop' },
  { id: 'goats', label: 'Goats',        img: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200&h=200&fit=crop' },
];

const SORT_OPTIONS = [
  { id: 'default',    label: 'Featured' },
  { id: 'price-asc',  label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'rating',     label: 'Top Rated' },
  { id: 'name',       label: 'Name A–Z' },
];

export default function Shop({ onNavigate, selectedProductId, isActive = true }) {
  const { products, loading, currentCategory, setCurrentCategory, currentBrand, setCurrentBrand } = useContext(ShopContext);
  const [sort, setSort] = useState('default');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // The detail product is now derived from the URL (selectedProductId),
  // not local-only state — this keeps back/forward buttons in sync.
  const detailProduct = selectedProductId
    ? products.find(p => String(p.id) === String(selectedProductId)) || null
    : null;

  const filtered = products
    .filter(p => currentCategory === 'all' || p.cat === currentCategory)
    .filter(p => currentBrand === 'all' || p.brand === currentBrand);

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'price-asc')  return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'rating')     return parseFloat(b.rating) - parseFloat(a.rating);
    if (sort === 'name')       return a.name.localeCompare(b.name);
    return 0;
  });

  const countFor = (id) => id === 'all' ? products.length : products.filter(p => p.cat === id).length;

  const brands = useMemo(() => {
    const set = new Set(products.map(p => p.brand).filter(Boolean));
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [products]);
  const brandCountFor = (brand) => brand === 'all' ? products.length : products.filter(p => p.brand === brand).length;

  const openDetail = (product) => {
    setQuickViewProduct(null);
    onNavigate('shop', product.id);
    window.scrollTo(0, 0);
  };

  const categoryLabelFor = (catId) => CATEGORIES.find(c => c.id === catId)?.label || 'Products';

  // Product deep-linked via URL but the catalog fetch hasn't resolved yet —
  // show the detail-shaped skeleton instead of falling through to the
  // full shop grid below, which would flash before the real detail swaps in.
  if (loading && selectedProductId && !detailProduct) {
    return (
      <div id="page-shop" className="page active">
        <ProductDetailSkeleton />
      </div>
    );
  }

  // FULL PRODUCT DETAIL VIEW
  if (detailProduct) {
    return (
      <div id="page-shop" className="page active">
        <ProductDetail
          product={detailProduct}
          categoryLabel={categoryLabelFor(detailProduct.cat)}
          onHome={() => onNavigate && onNavigate('home')}
          onBackToShop={() => onNavigate('shop')}
        />

        {isActive && (
          <>
            <CompareBar onOpenCompare={() => setShowCompareModal(true)} />
            {showCompareModal && (
              <CompareModal
                onClose={() => setShowCompareModal(false)}
                onOpenDetail={(product) => { setShowCompareModal(false); openDetail(product); }}
              />
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div id="page-shop" className="page active">
      <ShopHero />
      <ExtraBanners page="shop" />

      <div className="shop-layout">

        {/* SIDEBAR */}
        <button
          type="button"
          className="shop-sidebar-toggle"
          onClick={() => setSidebarOpen(o => !o)}
          aria-expanded={sidebarOpen}
        >
          Categories — {categoryLabelFor(currentCategory)} {sidebarOpen ? '▲' : '▼'}
        </button>

        <aside className={`shop-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-title">Categories</div>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`sidebar-cat-btn ${currentCategory === cat.id ? 'active' : ''}`}
              onClick={() => { setCurrentCategory(cat.id); setSidebarOpen(false); }}
            >
              <div className="sidebar-cat-img-wrap">
                <img src={cat.img} alt={cat.label} />
              </div>
              <div className="sidebar-cat-info">
                <span className="sidebar-cat-name">{cat.label}</span>
                <span className="sidebar-cat-count">{countFor(cat.id)} items</span>
              </div>
              {currentCategory === cat.id && <span className="sidebar-active-dot" />}
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT */}
        <main className="shop-main">
          {/* TOP BAR */}
          <div className="shop-topbar">
            <div className="shop-result-count">
              <span className="count-num">{sorted.length}</span> products found
              {currentCategory !== 'all' && (
                <span className="count-cat"> in {CATEGORIES.find(c => c.id === currentCategory)?.label}</span>
              )}
              {currentBrand !== 'all' && (
                <span className="shop-brand-chip">
                  Brand: {currentBrand}
                  <button type="button" onClick={() => setCurrentBrand('all')} aria-label="Clear brand filter">×</button>
                </span>
              )}
            </div>
            <div className="shop-sort-wrap">
              {brands.length > 0 && (
                <>
                  <label>Brand:</label>
                  <GlassSelect
                    value={currentBrand}
                    onChange={e => setCurrentBrand(e.target.value)}
                    options={[
                      { value: 'all', label: `All Brands (${brandCountFor('all')})` },
                      ...brands.map(b => ({ value: b, label: `${b} (${brandCountFor(b)})` })),
                    ]}
                  />
                </>
              )}
              <label>Sort by:</label>
              <GlassSelect
                value={sort}
                onChange={e => setSort(e.target.value)}
                options={SORT_OPTIONS.map(o => ({ value: o.id, label: o.label }))}
              />
            </div>
          </div>

          {/* PRODUCT GRID */}
          {loading && products.length === 0 ? (
            <div className="products-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="shop-empty">
              <div style={{ opacity: 0.5 }}><SearchIcon size={40} /></div>
              <p>No products in this category yet.</p>
            </div>
          ) : (
            <div className="products-grid">
              {sorted.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={() => setQuickViewProduct(product)}
                  onOpenDetail={() => openDetail(product)}
                />
              ))}
            </div>
          )}
        </main>

      </div>

      {isActive && quickViewProduct && (
        <QuickViewModal
          product={quickViewProduct}
          onClose={() => setQuickViewProduct(null)}
          onViewDetails={() => openDetail(quickViewProduct)}
        />
      )}

      {isActive && (
        <>
          <CompareBar onOpenCompare={() => setShowCompareModal(true)} />
          {showCompareModal && (
            <CompareModal
              onClose={() => setShowCompareModal(false)}
              onOpenDetail={(product) => { setShowCompareModal(false); openDetail(product); }}
            />
          )}
        </>
      )}
    </div>
  );
}