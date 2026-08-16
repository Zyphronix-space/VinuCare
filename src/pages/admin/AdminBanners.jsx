import { useState, useEffect } from 'react';
import { useUIFeedback } from '../../context/UIFeedbackContext';
import { API_BASE_URL } from '../../config/api';
import SkeletonTableRows from '../../components/ui/SkeletonTableRows';
import bannerNewpatient from '../../assets/images/banner-newpatient.jpg';
import bannerGrooming from '../../assets/images/banner-grooming.webp';
import bannerBoarding from '../../assets/images/banner-boarding.jpg';

const API_BASE = `${API_BASE_URL}/api/admin/banners`;

// Default photo shown in the admin preview + used live on the site whenever
// a slot hasn't been customized (image is null in the DB). Keeping this in
// sync with each page's hardcoded fallback (Home.jsx / *Hero.jsx) is what
// stops the preview column from just showing an empty box.
const DEFAULT_PREVIEWS = {
  home_offer_1: bannerNewpatient,
  home_offer_2: bannerGrooming,
  home_offer_3: bannerBoarding,
  services_hero: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=1400&auto=format&fit=crop&q=70',
  shop_hero: 'https://images.unsplash.com/photo-1601758125946-6ec2ef64daf8?w=1400&auto=format&fit=crop&q=70',
  appointments_hero: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=1200&auto=format&fit=crop&q=70',
  reviews_hero: 'https://images.unsplash.com/photo-1522276498395-f4f68f7f8454?w=1400&auto=format&fit=crop&q=70',
};

// Aspect-ratio / min-width rules matched to the actual CSS box each type of
// banner renders into, so an admin can't upload a photo that will look
// badly cropped or stretched. Custom-added ("offer") sections use the same
// rule as the home offer cards regardless of which page they're added to,
// since ExtraBanners.jsx renders them all in that same 180px-tall card style.
function specFor(banner) {
  if (banner.type === 'hero') {
    return { minRatio: 2.2, maxRatio: 6, minWidth: 1200, hint: 'Very wide landscape photo (e.g. 1600×500px or wider) — tall or square photos will be cropped down to almost nothing.' };
  }
  return { minRatio: 1.3, maxRatio: 2.1, minWidth: 600, hint: 'Landscape photo, close to 16:9 (e.g. 800×450px or larger).' };
}

const PAGE_LABELS = { home: 'Home', services: 'Services', shop: 'Shop', appointments: 'Appointments', reviews: 'Reviews' };
const PAGE_ORDER = ['home', 'services', 'shop', 'appointments', 'reviews'];

function readImageDims(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read that image file'));
    };
    img.src = url;
  });
}

const EMPTY_FORM = { tag: '', title: '', description: '', price: '', originalPrice: '', ctaText: '', image: '', alt: '' };

export default function AdminBanners() {
  const { confirm, success, error: notifyError } = useUIFeedback();
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalKey, setModalKey] = useState(null); // existing banner_key being edited, or null
  const [addingPage, setAddingPage] = useState(null); // page a new banner is being added to, or null
  const [form, setForm] = useState(EMPTY_FORM);
  const [imgWarning, setImgWarning] = useState(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, { credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setBanners(await res.json());
    } catch (err) {
      console.error('Failed to load banners:', err);
      setError('Failed to load banners: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  function openEdit(banner) {
    setModalKey(banner.bannerKey);
    setAddingPage(null);
    setImgWarning(null);
    setForm({
      tag: banner.tag || '',
      title: banner.title || '',
      description: banner.description || '',
      price: banner.price || '',
      originalPrice: banner.originalPrice || '',
      ctaText: banner.ctaText || '',
      image: banner.image || '',
      alt: banner.alt || '',
    });
  }

  function openAdd(page) {
    setModalKey(null);
    setAddingPage(page);
    setImgWarning(null);
    setForm(EMPTY_FORM);
  }

  function closeModal() {
    setModalKey(null);
    setAddingPage(null);
  }

  async function handleImagePick(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImgWarning(null);
    const banner = modalKey ? banners.find(b => b.bannerKey === modalKey) : { type: 'offer' };
    const spec = specFor(banner);

    try {
      const { width, height } = await readImageDims(file);
      const ratio = width / height;
      if (width < spec.minWidth || ratio < spec.minRatio || ratio > spec.maxRatio) {
        setImgWarning(
          `This image is ${width}×${height} (ratio ${ratio.toFixed(2)}:1) — this isn't the right type of photo for this banner. ${spec.hint} Upload rejected so it doesn't break the layout.`
        );
        e.target.value = '';
        return;
      }
    } catch (err) {
      setImgWarning(err.message);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (modalKey) {
        const res = await fetch(`${API_BASE}/${modalKey}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        setBanners(prev => prev.map(b => (b.bannerKey === modalKey ? { ...b, ...form } : b)));
        success('Banner updated.');
      } else {
        const res = await fetch(API_BASE, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...form, page: addingPage }),
        });
        if (!res.ok) throw new Error('Server responded ' + res.status);
        const created = await res.json();
        setBanners(prev => [...prev, created]);
        success('Banner section added.');
      }
      closeModal();
    } catch (err) {
      console.error('Failed to save banner:', err);
      notifyError('Failed to save banner: ' + err.message);
    }
  }

  async function handleDelete(banner) {
    const ok = await confirm({
      title: 'Delete banner section?',
      message: `Remove "${banner.title}" from the ${PAGE_LABELS[banner.page] || banner.page} page? This cannot be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    try {
      const res = await fetch(`${API_BASE}/${banner.bannerKey}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error('Server responded ' + res.status);
      setBanners(prev => prev.filter(b => b.bannerKey !== banner.bannerKey));
      success('Banner deleted.');
    } catch (err) {
      console.error('Failed to delete banner:', err);
      notifyError('Failed to delete banner: ' + err.message);
    }
  }

  const editingBanner = modalKey ? banners.find(b => b.bannerKey === modalKey) : null;
  const editingSpec = modalKey ? specFor(editingBanner) : addingPage ? specFor({ type: 'offer' }) : null;
  const showPriceFields = modalKey ? editingBanner?.type === 'offer' : !!addingPage;

  const grouped = PAGE_ORDER.map(page => ({
    page,
    label: PAGE_LABELS[page],
    hero: banners.find(b => b.page === page && b.type === 'hero'),
    offers: banners.filter(b => b.page === page && b.type === 'offer').sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)),
  })).filter(g => g.hero || g.offers.length > 0 || PAGE_ORDER.includes(g.page));

  return (
    <>
      <div className="admin-topbar">
        <div>
          <h1>Banners</h1>
          <p>Customize each page's hero banner, and add or remove promo banner sections.</p>
        </div>
      </div>

      {error && <div className="admin-panel"><div className="admin-error" style={{ color: 'red', padding: '12px' }}>{error}</div></div>}

      {!error && grouped.map(g => (
        <div className="admin-panel" key={g.page} style={{ marginBottom: 24 }}>
          <div className="admin-panel-head">
            <h3 style={{ margin: 0 }}>{g.label}</h3>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Preview</th>
                  <th>Title</th>
                  <th></th>
                </tr>
              </thead>
              {loading ? <SkeletonTableRows columns={4} rows={2} /> : (
              <tbody>
                {g.hero && (
                  <tr>
                    <td>Hero Banner</td>
                    <td>
                      <img
                        className="admin-thumb"
                        src={g.hero.image || DEFAULT_PREVIEWS[g.hero.bannerKey]}
                        alt={g.hero.alt || g.hero.title}
                      />
                    </td>
                    <td>{g.hero.title}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(g.hero)}>Edit</button>
                      </div>
                    </td>
                  </tr>
                )}
                {g.offers.map(b => (
                  <tr key={b.bannerKey}>
                    <td>Promo Section</td>
                    <td>
                      {b.image || DEFAULT_PREVIEWS[b.bannerKey] ? (
                        <img className="admin-thumb" src={b.image || DEFAULT_PREVIEWS[b.bannerKey]} alt={b.alt || b.title} />
                      ) : (
                        <div className="admin-thumb" title="No image uploaded yet" />
                      )}
                    </td>
                    <td>{b.title}</td>
                    <td>
                      <div className="admin-table-actions">
                        <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openEdit(b)}>Edit</button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              )}
            </table>
            {!loading && (
              <div style={{ padding: '14px 18px' }}>
                <button className="admin-btn admin-btn-outline admin-btn-sm" onClick={() => openAdd(g.page)}>
                  + Add Promo Banner Section
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {(modalKey || addingPage) && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3>{modalKey ? `Edit ${editingBanner?.type === 'hero' ? 'Hero Banner' : 'Promo Section'}` : `Add Promo Section — ${PAGE_LABELS[addingPage]}`}</h3>
            <form onSubmit={handleSave}>
              <div className="admin-field">
                <label>Tag</label>
                <input value={form.tag} onChange={e => setForm({ ...form, tag: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Title</label>
                <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="admin-field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              {showPriceFields && (
                <>
                  <div className="admin-field-row">
                    <div className="admin-field">
                      <label>Price</label>
                      <input value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="Rs 2,900" />
                    </div>
                    <div className="admin-field">
                      <label>Original price (was)</label>
                      <input value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: e.target.value })} placeholder="Rs 7,500" />
                    </div>
                  </div>
                  <div className="admin-field">
                    <label>Button text</label>
                    <input value={form.ctaText} onChange={e => setForm({ ...form, ctaText: e.target.value })} placeholder="Book Now" />
                  </div>
                </>
              )}
              <div className="admin-field">
                <label>Banner image</label>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-light)', margin: '2px 0 8px' }}>{editingSpec?.hint}</p>
                <input type="file" accept="image/*" onChange={handleImagePick} />
                {imgWarning && (
                  <div className="admin-error" style={{ color: '#b42318', fontSize: '0.85rem', marginTop: 8 }}>{imgWarning}</div>
                )}
                {form.image && <img className="admin-image-preview" src={form.image} alt="Preview" />}
              </div>
              <div className="admin-field">
                <label>Image alt text</label>
                <input value={form.alt} onChange={e => setForm({ ...form, alt: e.target.value })} placeholder="Describes the photo for accessibility" />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn-outline" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
