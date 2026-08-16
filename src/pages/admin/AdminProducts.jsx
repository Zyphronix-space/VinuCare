import { useState, useEffect, useContext } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import { ShopContext } from '../shop/ShopContext';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';

const API_BASE = `${API_BASE_URL}/api/admin/products`;

const CATEGORY_OPTIONS = [
  { id: 'dogs', label: 'Dogs' },
  { id: 'cats', label: 'Cats' },
  { id: 'birds', label: 'Birds' },
  { id: 'fish', label: 'Fish' },
  { id: 'rabbits', label: 'Rabbits' },
  { id: 'cows', label: 'Cattle' },
  { id: 'goats', label: 'Goats' },
];

const EMPTY_FORM = { name: '', cat: 'dogs', brand: '', price: '', stock: '', image: '', description: '' };

export default function AdminProducts({ initialLowStockOnly = false }) {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const { refreshProducts } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('all');
  const [lowStockOnly, setLowStockOnly] = useState(initialLowStockOnly);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [restockAmount, setRestockAmount] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
      setError('Failed to load products: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  const filtered = products.filter(p => {
    const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
    const matchesCat = catFilter === 'all' || p.cat === catFilter;
    const matchesStock = !lowStockOnly || p.stock <= 10;
    return matchesQuery && matchesCat && matchesStock;
  });

  // Adds the entered quantity straight into the form's stock field — it's
  // just part of the edit until Save is clicked, same as any other field,
  // rather than a separate immediate write (keeps one save action per
  // product edit instead of two different ways to change stock).
  function applyRestock() {
    const delta = Number(restockAmount);
    if (!delta) return;
    setForm(f => ({ ...f, stock: Number(f.stock || 0) + delta }));
    setRestockAmount('');
  }

  function openAdd() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setRestockAmount('');
    setModalOpen(true);
  }

  function openEdit(product) {
    setEditingId(product.id);
    setForm({
      name: product.name,
      cat: product.cat,
      brand: product.brand || '',
      price: product.price,
      stock: product.stock,
      image: product.image || '',
      description: product.description || '',
    });
    setRestockAmount('');
    setModalOpen(true);
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Delete product?',
      message: 'Delete this product from the shop? This cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setProducts(prev => prev.filter(p => p.id !== id));
      refreshProducts();
      success('Product deleted.');
    } catch (err) {
      console.error('Failed to delete product:', err);
      notifyError('Failed to delete product: ' + err.message);
    }
  }

  // Reads a locally-picked file and stores it as a data URL. Since there's
  // no cloud image storage configured yet, this saves straight into the
  // database (image column is LONGTEXT to accommodate it).
  function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.price) return;
    const payload = { ...form, price: Number(form.price), stock: Number(form.stock) || 0 };

    try {
      if (editingId) {
        const res = await fetch(`${API_BASE}/${editingId}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        setProducts(prev => prev.map(p => (p.id === editingId ? { ...p, ...payload } : p)));
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        const created = await res.json();
        setProducts(prev => [created, ...prev]);
      }
      refreshProducts();
      setModalOpen(false);
      success(editingId ? 'Product updated.' : 'Product added.');
    } catch (err) {
      console.error('Failed to save product:', err);
      notifyError('Failed to save product: ' + err.message);
    }
  }

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Products</h1>
          <p>Add new products, update prices and images, or remove discontinued items.</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ Add Product</button>
      </div>

      <div className="admin-panel">
        <div className="admin-panel-head">
          <input
            className="admin-search"
            placeholder="Search products…"
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <div className="admin-tabs">
            <button
              type="button"
              className={`admin-tab-btn${catFilter === 'all' ? ' active' : ''}`}
              onClick={() => setCatFilter('all')}
            >
              All categories
            </button>
            {CATEGORY_OPTIONS.map(c => (
              <button
                key={c.id}
                type="button"
                className={`admin-tab-btn${catFilter === c.id ? ' active' : ''}`}
                onClick={() => setCatFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
            <button
              type="button"
              className={`admin-tab-btn${lowStockOnly ? ' active' : ''}`}
              onClick={() => setLowStockOnly(v => !v)}
            >
              Low stock only
            </button>
          </div>
        </div>

        {error && <div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div>}

        {!error && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Brand</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={6} /> : (
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-cell-main">
                        {p.image ? <img className="admin-thumb" src={p.image} alt={p.name} /> : <div className="admin-thumb" />}
                        {p.name}
                      </div>
                      <div className="admin-cell-sub" style={{ marginLeft: 50 }}>{p.id}</div>
                    </td>
                    <td>{CATEGORY_OPTIONS.find(c => c.id === p.cat)?.label || p.cat}</td>
                    <td>{p.brand || '—'}</td>
                    <td>Rs. {Number(p.price).toLocaleString('en-LK')}</td>
                    <td>
                      {p.stock}
                      {p.stock <= 10 && <span className="admin-badge badge-suspended" style={{ marginLeft: 8 }}>Low</span>}
                    </td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && filtered.length === 0 && <div className="admin-empty">No products match that search.</div>}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{editingId ? 'Edit Product' : 'Add Product'}</h3>
            <form onSubmit={handleSave}>
              <div className="admin-field">
                <label>Product name</label>
                <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Category</label>
                  <select value={form.cat} onChange={e => setForm({ ...form, cat: e.target.value })}>
                    {CATEGORY_OPTIONS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Brand</label>
                  <input value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} placeholder="e.g. Royal Canin" />
                </div>
              </div>
              <div className="admin-field-row">
                <div className="admin-field">
                  <label>Price (Rs.)</label>
                  <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                </div>
                <div className="admin-field">
                  <label>Stock quantity</label>
                  <input type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} />
                  {editingId && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, width: '100%' }}>
                      <input
                        type="number"
                        placeholder="+ Qty"
                        value={restockAmount}
                        onChange={e => setRestockAmount(e.target.value)}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      <button type="button" className="admin-btn admin-btn-outline admin-btn-sm" style={{ flexShrink: 0 }} onClick={applyRestock}>Restock</button>
                    </div>
                  )}
                </div>
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Product image</label>
                <input type="file" accept="image/*" onChange={handleImagePick} />
                {form.image && <img className="admin-image-preview" src={form.image} alt="Preview" />}
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingId ? 'Save Changes' : 'Add Product'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}