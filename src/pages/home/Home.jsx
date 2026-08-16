import '../../styles/home.css';
import teamData from '../team/teamData';
import heroAvatar1 from '../../assets/images/hero-avatar-1.jpg';
import heroAvatar2 from '../../assets/images/hero-avatar-2.jpg';
import heroAvatar3 from '../../assets/images/hero-avatar-3.jpg';
import aboutMain from '../../assets/images/about-main.avif';
import aboutAccent from '../../assets/images/about-accent.jpg';
import serviceCheckup from '../../assets/images/service-checkup.jpg';
import serviceGrooming from '../../assets/images/service-grooming.jpg';
import serviceBoarding from '../../assets/images/service-boarding.jpg';
import serviceTraining from '../../assets/images/service-training.jpg';
import serviceSpa from '../../assets/images/service-spa.jpg';
import serviceEmergency from '../../assets/images/service-emergency.jpg';
import stats1 from '../../assets/images/stats-1.jpg';
import stats2 from '../../assets/images/stats-2.avif';
import stats3 from '../../assets/images/stats-3.jpg';
import whyMain from '../../assets/images/why-main.jpg';
import whySub from '../../assets/images/why-sub.jpg';
import clinicInterior from '../../assets/images/clinic-interior.jpg';
import bannerNewpatient from '../../assets/images/banner-newpatient.jpg';
import bannerGrooming from '../../assets/images/banner-grooming.webp';
import bannerBoarding from '../../assets/images/banner-boarding.jpg';
import drools   from '../../assets/brands/Drools.webp';
import hills    from '../../assets/brands/hills logo.jpg';
import meo from '../../assets/brands/meo-logo.webp';
import pedigree from '../../assets/brands/pedigree.png';
import royalCanin from '../../assets/brands/royal-canin.webp';
import whiskas  from '../../assets/brands/whiskas.png';
import heroVideo from '../../assets/video/hero-clinic.mp4';
import { useState, useEffect, useContext } from 'react';
import { ShopContext } from '../shop/ShopContext';
import {
  PawIcon, StethoscopeIcon, AwardIcon, TagIcon, BuildingIcon, ScissorsIcon,
  SpaIcon, AlertIcon, PinIcon, PhoneIcon, MailIcon, ClockIcon, CarIcon,
  MicroscopeIcon, DiagnosticsIcon, DeviceIcon, ChatIcon, CheckBadgeIcon,
  ThermometerIcon, ScalpelIcon, DogIcon,
} from '../../components/ui/Icons';
import LeafletMap from '../../components/LeafletMap';
import { API_BASE_URL } from '../../config/api';
import ExtraBanners from '../../components/ExtraBanners';
import Skeleton from '../../components/ui/Skeleton';

// teamData.js is plain data (no JSX allowed there), so its `icon` field is
// a short key resolved to a real icon component here.
const TEAM_ICONS = { stethoscope: StethoscopeIcon, scalpel: ScalpelIcon };

// Subscription plans previewed in the hero float cards
const subPlans = [
  { icon: <PawIcon size={20} />, name: 'Basic Care',    detail: 'Monthly wellness check',  price: 'Rs 2,900/mo', color: 'var(--lavender-400)' },
  { icon: <StethoscopeIcon size={20} />, name: 'Standard Care', detail: 'Wellness + grooming',      price: 'Rs 5,900/mo', color: 'var(--teal-400, #38b2ac)' },
  { icon: <AwardIcon size={20} />, name: 'Premium Care',  detail: 'All-inclusive plan',        price: 'Rs 9,900/mo', color: 'var(--amber-400, #f6ad55)' },
];

// Current promotions — wide photo banners, Chewy-style
const offers = [
  {
    tag: 'New Patients', bg: '#3730A3', accentBtn: '#fff', accentText: '#3730A3', icon: <PawIcon size={22} />,
    title: 'First Wellness Exam, On Us',
    desc: 'Complete health check, vaccination review and microchipping for new patients.',
    price: 'Rs 2,900', was: 'Rs 7,500',
    cta: 'Book Now',
    img: bannerNewpatient,
    alt: 'Happy dog and cat sitting together',
  },
  {
    tag: 'Bundle Deal', bg: '#0F766E', accentBtn: '#fff', accentText: '#0F766E', icon: <TagIcon size={22} />,
    title: 'Grooming + Dental, Bundled',
    desc: 'Full grooming session combined with professional dental scaling for a healthy, fresh pup.',
    price: 'Rs 6,500', was: 'Rs 11,000',
    cta: 'Book Now',
    img: bannerGrooming,
    alt: 'Dog being groomed and bathed',
  },
  {
    tag: 'Monthly Special', bg: '#B45309', accentBtn: '#fff', accentText: '#B45309', icon: <BuildingIcon size={22} />,
    title: '5 Nights of Boarding Bliss',
    desc: '5 nights of supervised boarding with daily enrichment activities and bedtime story updates.',
    price: 'Rs 14,900', was: 'Rs 22,000',
    cta: 'Reserve a Spot',
    img: bannerBoarding,
    alt: 'Dog relaxing happily at a boarding facility',
  },
];

// Services overview — same banner treatment as Special Offers
const servicesBanners = [
  {
    id: 1, tag: 'Most Popular', bg: '#3730A3', icon: <StethoscopeIcon size={22} />,
    title: 'Veterinary Check-ups',
    desc: 'Comprehensive wellness exams, vaccinations, blood panels and preventive care from our licensed vets.',
    cta: 'View Service', img: serviceCheckup, alt: 'Veterinary checkup',
  },
  {
    id: 2, tag: 'Grooming', bg: '#0F766E', icon: <ScissorsIcon size={22} />,
    title: 'Grooming & Styling',
    desc: 'Professional bathing, breed-specific cuts, nail trimming and ear cleaning using premium pet-safe products.',
    cta: 'View Service', img: serviceGrooming, alt: 'Dog grooming',
  },
  {
    id: 4, tag: 'Boarding', bg: '#B45309', icon: <BuildingIcon size={22} />,
    title: 'Boarding & Daycare',
    desc: 'Safe, comfortable stays with 24/7 supervision, individual playtime and daily photo updates to keep you connected.',
    cta: 'View Service', img: serviceBoarding, alt: 'Pet boarding',
  },
  {
    id: 5, tag: 'Training', bg: '#5B21B6', icon: <DogIcon size={22} />,
    title: 'Training & Behaviour',
    desc: 'Positive reinforcement training for puppies and adults — obedience, socialisation and behaviour correction.',
    cta: 'View Service', img: serviceTraining, alt: 'Dog training',
  },
  {
    id: 6, tag: 'Spa', bg: '#9D174D', icon: <SpaIcon size={22} />,
    title: 'Spa & Wellness',
    desc: 'Aromatherapy baths, therapeutic massage, mud treatments and paw care for a fully pampered companion.',
    cta: 'View Service', img: serviceSpa, alt: 'Cat wellness spa',
  },
  {
    id: 3, tag: '24/7 Available', bg: '#065F46', icon: <AlertIcon size={22} />,
    title: 'Emergency Care',
    desc: 'Rapid response emergency consultations with on-site diagnostic equipment and intensive care facilities.',
    cta: 'View Service', img: serviceEmergency, alt: 'Emergency vet care',
  },
];

// Team — same banner treatment as Special Offers. Content lives in
// teamData.js (shared with the Team detail page) instead of here.

export default function Home({ onNavigate }) {
  const { setCurrentCategory, setCurrentBrand } = useContext(ShopContext);
  const [homeReviews, setHomeReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/reviews`)
      .then(res => {
        if (!res.ok) throw new Error('Server responded ' + res.status);
        return res.json();
      })
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        const sorted = [...list].sort((a, b) => {
          const dateA = new Date(a.createdAt || a.created_at || a.date || 0);
          const dateB = new Date(b.createdAt || b.created_at || b.date || 0);
          return dateB - dateA;
        });
        setHomeReviews(sorted.slice(0, 3));
        setReviewsLoading(false);
      })
      .catch(() => {
        setReviewsLoading(false);
        setReviewsError(true);
      });
  }, []);

  // Admin-customizable promo banners (Admin > Banners). Falls back to the
  // hardcoded defaults above whenever a slot hasn't been customized yet.
  const [bannerOverrides, setBannerOverrides] = useState({});
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/banners`)
      .then(res => res.json())
      .then(data => {
        const map = {};
        for (const b of Array.isArray(data) ? data : []) map[b.bannerKey] = b;
        setBannerOverrides(map);
      })
      .catch(() => {});
  }, []);

  const displayOffers = offers.map((offer, i) => {
    const ov = bannerOverrides[`home_offer_${i + 1}`];
    if (!ov) return offer;
    return {
      ...offer,
      tag: ov.tag || offer.tag,
      title: ov.title || offer.title,
      desc: ov.description || offer.desc,
      price: ov.price || offer.price,
      was: ov.originalPrice || offer.was,
      cta: ov.ctaText || offer.cta,
      img: ov.image || offer.img,
      alt: ov.alt || offer.alt,
    };
  });

  return (
    <div id="page-home" className="page active">

      {/* Shared photo-banner styles, reused by Services, Stats, Team & Why Choose Us */}
      <style>{`
        .photo-banner-list {
          display: flex; flex-direction: column; gap: 14px;
        }
        .photo-banner {
          border-radius: 20px; overflow: hidden;
          display: flex; align-items: stretch; flex-wrap: wrap;
          min-height: 220px; cursor: pointer;
        }
        .photo-banner.reverse { flex-direction: row-reverse; }
        .photo-banner-text {
          flex: 1 1 320px; padding: 36px 40px;
          display: flex; flex-direction: column; justify-content: center;
          color: #fff;
        }
        .services-section .photo-banner {
          min-height: 160px;
        }
        .services-section .photo-banner-text {
          padding: 24px 28px;
        }
        .services-section .photo-banner-text h3 {
          font-size: clamp(1.1rem,1.8vw,1.4rem) !important;
        }
        .services-section .photo-banner-text p {
          margin-bottom: 12px !important;
          font-size: .85rem;
        }
        .services-section .photo-banner-img {
          min-height: 160px;
        }
        /* Team cards — liquid glass overlay treatment, matching the
           Services grid cards (see services.css .svc-card). Both cards
           sit in a 2-col grid so their image areas line up exactly. */
        .team-section .photo-banner-list {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }
        .team-section .photo-banner,
        .team-section .photo-banner.reverse {
          position: relative;
          flex-direction: column;
          align-items: flex-end !important;
          justify-content: flex-end;
          isolation: isolate;
          min-height: 560px;
          height: 560px !important;
          border-radius: 22px;
        }
        .team-section .photo-banner-img {
          position: absolute;
          inset: 0;
          z-index: 0;
          order: unset;
          flex: none;
          width: 100%;
          height: 100%;
          align-self: auto;
        }
        .team-section .photo-banner-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 8%;
          transition: transform .5s ease;
        }
        .team-section .photo-banner:hover .photo-banner-img img {
          transform: scale(1.06);
        }
        /* single smooth gradient — clear over the face, shading in only
           behind the text near the bottom, no hard seam */
        .team-section .photo-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: linear-gradient(180deg,
            rgba(10,8,20,0) 0%,
            rgba(10,8,20,0) 44%,
            rgba(10,8,20,.5) 62%,
            rgba(10,8,20,.82) 78%,
            rgba(10,8,20,.94) 100%);
          transition: background .3s ease;
        }
        .team-section .photo-banner:hover::before {
          background: linear-gradient(180deg,
            rgba(10,8,20,0) 0%,
            rgba(10,8,20,0) 38%,
            rgba(10,8,20,.55) 58%,
            rgba(10,8,20,.86) 76%,
            rgba(10,8,20,.96) 100%);
        }
        /* text panel — transparent, just sits on the shared gradient above */
        .team-section .photo-banner-text {
          position: relative;
          z-index: 2;
          order: unset;
          flex: none !important;
          width: 100%;
          height: fit-content !important;
          padding: 20px 26px 26px !important;
          justify-content: flex-start !important;
          background: none;
        }
        .team-section .photo-banner-text h3 {
          font-size: clamp(1.1rem,1.8vw,1.4rem) !important;
        }
        .team-section .photo-banner-text p {
          margin-bottom: 12px !important;
          font-size: .85rem;
        }
        @media (max-width: 720px) {
          .team-section .photo-banner-list {
            grid-template-columns: 1fr;
          }
          .team-section .photo-banner,
          .team-section .photo-banner.reverse {
            min-height: 420px;
            height: 420px !important;
          }
        }
        @media (max-width: 480px) {
          .photo-banner-text { padding: 22px 20px; }
          .services-section .photo-banner-text { padding: 20px 18px; }
          .team-section .photo-banner-text { padding: 16px 18px 20px !important; }
          .services-section .glass-icon-badge + .photo-banner-text .photo-banner-tag { margin-left: 0; margin-top: 30px; }
        }
        .photo-banner-tag {
          align-self: flex-start;
          padding: 4px 12px !important; border-radius: 999px !important;
          font-size: .75rem !important; font-weight: 700 !important; letter-spacing: .04em !important;
          margin-bottom: 14px !important;
          color: #fff !important;
          background: linear-gradient(135deg, rgba(255,255,255,0.38), rgba(255,255,255,0.14)) !important;
          border: 1px solid rgba(255,255,255,0.45) !important;
          backdrop-filter: blur(10px) saturate(160%) !important;
          -webkit-backdrop-filter: blur(10px) saturate(160%) !important;
          box-shadow: 0 4px 14px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.35) !important;
        }
        .photo-banner { position: relative; }
        .glass-icon-badge {
          position: absolute; top: 18px; left: 18px; z-index: 3;
          width: 46px; height: 46px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          background: linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.12));
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
          box-shadow: 0 6px 18px rgba(0,0,0,0.22), inset 0 1px 1px rgba(255,255,255,0.45);
        }
        .team-section .glass-icon-badge { top: 16px; left: 16px; }
        .services-section .glass-icon-badge + .photo-banner-text .photo-banner-tag {
          margin-left: 56px;
        }
        .photo-banner-img { flex: 1 1 280px; min-height: 220px; }
        .photo-banner-img img { width: 100%; height: 100%; object-fit: cover; display: block; }

        .services-toggle-wrap {
          display: flex; justify-content: center; margin: 0 0 28px;
        }
        .services-toggle-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 28px; border-radius: 999px;
          font-weight: 700; font-size: .95rem;
          background: var(--lavender-400, #6b21a8); color: #fff; border: none;
          cursor: pointer; transition: transform .15s ease, box-shadow .15s ease;
        }
        .services-toggle-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(107,33,168,.28); }
        .services-toggle-chevron { transition: transform .25s ease; display: inline-flex; }
        .services-toggle-chevron.open { transform: rotate(180deg); }
        .services-collapse {
          display: grid;
          grid-template-rows: 0fr;
          transition: grid-template-rows .35s ease;
        }
        .services-collapse.open { grid-template-rows: 1fr; }
        .services-collapse > div { overflow: hidden; }

        .hero-video {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover; z-index: 0;
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-video { display: none; }
        }
      `}</style>

      {/* HERO */}
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline poster={aboutMain}>
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">Now Accepting New Patients</div>
          <h1>Expert Veterinary &amp; Pet Care You Can <em>Trust</em></h1>
          <p>Comprehensive health services, grooming, boarding and a curated pet store — all under one compassionate roof.</p>
          <div className="hero-btns">
            <button className="btn btn-white" onClick={() => onNavigate('shop')}>Shop</button>
          </div>
          <div className="hero-trust">
            <div className="trust-avatars">
              <img src={heroAvatar1} alt="Happy pet owner" />
              <img src={heroAvatar2} alt="Happy pet owner" />
              <img src={heroAvatar3} alt="Happy pet owner" />
            </div>
            <div className="trust-text">
              <p>Trusted by 5,000+ Pet Families</p>
              <span>⭐⭐⭐⭐⭐ 4.9 average rating</span>
            </div>
          </div>
        </div>
        <div className="hero-float-card">
          {subPlans.map((plan, i) => (
            <div
              className="float-card"
              key={plan.name}
              onClick={() => {
                const target = document.getElementById(`offer-${i}`);
                if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                else onNavigate('appointments');
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="float-card-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off-white)', fontSize: '1.4rem' }}>
                {plan.icon}
              </div>
              <div className="float-card-text">
                <strong>{plan.name}</strong>
                <span>{plan.detail}</span>
                <span style={{ fontWeight: 700, color: '#6b21a8', fontSize: '.8rem' }}>{plan.price}</span>
              </div>
              <div className="float-dot" style={{ background: plan.color }}></div>
            </div>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <div className="trust-strip">
        <div className="trust-item"><div className="trust-icon"><StethoscopeIcon size={22} /></div><div><strong>Licensed Vets</strong><span>Board-certified professionals</span></div></div>
        <div className="trust-item"><div className="trust-icon"><BuildingIcon size={22} /></div><div><strong>Full Clinic</strong><span>On-site lab &amp; diagnostics</span></div></div>
        <div className="trust-item"><div className="trust-icon"><ClockIcon size={22} /></div><div><strong>Emergency Care</strong><span>24/7 urgent support</span></div></div>
        <div className="trust-item"><div className="trust-icon"><CheckBadgeIcon size={22} /></div><div><strong>Certified Groomers</strong><span>5+ years experience</span></div></div>
        <div className="trust-item"><div className="trust-icon"><CarIcon size={22} /></div><div><strong>Free Pick-up</strong><span>Within 10km radius</span></div></div>
      </div>

      {/* ABOUT */}
      <section className="about-section">
        <div className="about-img-wrap">
          <div className="about-main-img">
            <img src={aboutMain} alt="Veterinarian examining dog" loading="lazy" />
          </div>
          <div className="about-accent-img">
            <img src={aboutAccent} alt="Pet care" loading="lazy" />
          </div>
          <div className="about-caption">VinuCare · Est. 2016</div>
        </div>
        <div className="about-text">
          <span className="pill-tag">About VinuCare</span>
          <h2>A Clinic That Feels Like <em>Home</em> for Your Pet</h2>
          <p>Founded in 2016 as a single-vet practice, VinuCare has grown into a full-service clinic without losing the part that mattered most — knowing every animal that walks through our doors by name.</p>
          <p>Led by Dr. Nimali Ekanayake and a small team of specialists, we handle everything from routine wellness checks to orthopedic surgery, under one roof.</p>
          <div className="about-capabilities">
            <span className="capability-chip"><span className="chip-icon"><MicroscopeIcon size={15} /></span>On-site diagnostic lab</span>
            <span className="capability-chip"><span className="chip-icon"><AwardIcon size={15} /></span>AVMA-accredited</span>
            <span className="capability-chip"><span className="chip-icon"><ScissorsIcon size={15} /></span>Certified grooming</span>
            <span className="capability-chip"><span className="chip-icon"><ThermometerIcon size={15} /></span>Climate-controlled boarding</span>
            <span className="capability-chip"><span className="chip-icon"><PawIcon size={15} /></span>Fear-free certified</span>
          </div>
          <button className="btn btn-primary" onClick={() => onNavigate('appointments')}>Schedule a Visit</button>
        </div>
      </section>

      {/* SERVICES OVERVIEW — photo-banner style */}
      <section className="services-section">
        <div className="section-header">
          <span className="pill-tag">Our Services</span>
          <h2>Complete Care for Every Pet</h2>
          <p>From routine wellness exams to specialist treatments, we cover every aspect of your pet's health and wellbeing.</p>
        </div>
        <div className="services-toggle-wrap">
          <button
            type="button"
            className="services-toggle-btn"
            aria-expanded={servicesOpen}
            onClick={() => setServicesOpen(o => !o)}
          >
            {servicesOpen ? 'View Less' : 'View More'}
            <span className={`services-toggle-chevron${servicesOpen ? ' open' : ''}`}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </span>
          </button>
        </div>
        <div className={`services-collapse${servicesOpen ? ' open' : ''}`}>
          <div>
            <div className="photo-banner-list">
              {servicesBanners.map((svc, i) => (
                <div
                  key={svc.title}
                  className={`photo-banner${i % 2 === 1 ? ' reverse' : ''}`}
                  style={{ background: svc.bg }}
                  onClick={() => onNavigate('services', svc.id)}
                >
                  <div className="glass-icon-badge">{svc.icon}</div>
                  <div className="photo-banner-text">
                    <span className="photo-banner-tag">{svc.tag}</span>
                    <h3 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', margin: '0 0 8px', lineHeight: 1.2 }}>{svc.title}</h3>
                    <p style={{ opacity: 0.9, margin: '0 0 18px', maxWidth: '380px' }}>{svc.desc}</p>
                    <button
                      className="btn"
                      style={{ background: '#fff', color: svc.bg, fontWeight: 700, alignSelf: 'flex-start' }}
                      onClick={(e) => { e.stopPropagation(); onNavigate('services', svc.id); }}
                    >
                      {svc.cta} →
                    </button>
                  </div>
                  <div className="photo-banner-img">
                    <img src={svc.img} alt={svc.alt} loading="lazy" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* GROWTH TIMELINE — replaces the generic stat-grid banner */}
      <section className="growth-section">
        <div className="growth-photostrip">
          <img src={stats1} alt="Clinic waiting room" loading="lazy" />
          <img src={stats2} alt="Pets at home" loading="lazy" />
          <img src={stats3} alt="Clinic team" loading="lazy" />
        </div>
        <div className="growth-inner">
          <div className="growth-header">
            <span className="photo-banner-tag" style={{ position: 'static' }}>Since 2016</span>
            <h2>How Far We've Come</h2>
            <p>A single-vet practice that grew one referral at a time — here's the shape of that growth.</p>
          </div>
          <div className="growth-timeline">
            <div className="timeline-node">
              <div className="timeline-dot" />
              <div className="timeline-year">2016</div>
              <div className="timeline-label">Founded as a single-vet practice</div>
            </div>
            <div className="timeline-node">
              <div className="timeline-dot" />
              <div className="timeline-year">2019</div>
              <div className="timeline-label">Opened our on-site diagnostic lab &amp; surgical suite</div>
            </div>
            <div className="timeline-node">
              <div className="timeline-dot" />
              <div className="timeline-year">2022</div>
              <div className="timeline-label">Crossed 5,000 pet families served</div>
            </div>
            <div className="timeline-node">
              <div className="timeline-dot" />
              <div className="timeline-year">Today</div>
              <div className="timeline-label">14 clinicians, one 98% satisfaction rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM — photo-banner style */}
      <section className="team-section">
        <div className="section-header">
          <span className="pill-tag">Our Team</span>
          <h2>Meet Our Veterinary Professionals</h2>
          <p>A dedicated team of certified vets, groomers and carers who treat your pets as their own.</p>
        </div>
        <div className="photo-banner-list">
          {teamData.map((member, i) => {
            const MemberIcon = TEAM_ICONS[member.icon];
            return (
            <div
              key={member.name}
              className={`photo-banner${i % 2 === 1 ? ' reverse' : ''}`}
              style={{ background: member.bg, cursor: 'pointer' }}
              role="button"
              tabIndex={0}
              onClick={() => onNavigate && onNavigate('team', member.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onNavigate && onNavigate('team', member.id);
                }
              }}
            >
              <div className="glass-icon-badge">{MemberIcon && <MemberIcon size={20} />}</div>
              <div className="photo-banner-text">
                <span className="photo-banner-tag">{member.tag}</span>
                <h3 style={{ fontSize: 'clamp(1.4rem,2.4vw,1.9rem)', margin: '0 0 8px' }}>{member.name}</h3>
                <p style={{ opacity: 0.9, margin: 0 }}>{member.role}</p>
                <p style={{ opacity: 0.8, margin: '12px 0 0', fontSize: '.9rem', lineHeight: 1.6, maxWidth: '90%' }}>{member.bio}</p>
                <button
                  className="btn"
                  style={{ background: '#fff', color: member.bg, fontWeight: 700, alignSelf: 'flex-start', marginTop: '16px' }}
                  onClick={(e) => { e.stopPropagation(); onNavigate('team', member.id); }}
                >
                  View Profile →
                </button>
              </div>
              <div className="photo-banner-img">
                <img src={member.img} alt={member.name} loading="lazy" />
              </div>
            </div>
            );
          })}
        </div>
      </section>

      {/* OFFERS */}
      <section className="offers-section">
        <div className="section-header">
          <span className="pill-tag">Special Offers</span>
          <h2>Current Promotions</h2>
          <p>Exclusive deals for new and returning pet families.</p>
        </div>
        <div className="photo-banner-list">
          {displayOffers.map((offer, i) => (
            <div
              key={offer.title}
              id={`offer-${i}`}
              className="photo-banner"
              onClick={() => onNavigate('appointments')}
              style={{
                background: offer.bg, borderRadius: '20px', overflow: 'hidden',
                display: 'flex', alignItems: 'stretch', cursor: 'pointer',
                minHeight: '50px', flexWrap: 'wrap', scrollMarginTop: '100px'
              }}
            >
              <div className="glass-icon-badge">{offer.icon}</div>
              <div style={{
                flex: '1 1 320px', padding: '24px 28px',
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                color: '#fff'
              }}>
                <span className="photo-banner-tag" style={{ marginBottom: '10px', marginLeft: '56px' }}>{offer.tag}</span>
                <h3 style={{ fontSize: 'clamp(1.1rem,1.8vw,1.4rem)', margin: '0 0 6px', lineHeight: 1.2 }}>{offer.title}</h3>
                <p style={{ opacity: 0.9, margin: '0 0 12px', maxWidth: '380px', fontSize: '.85rem' }}>{offer.desc}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800 }}>{offer.price}</span>
                  <s style={{ opacity: 0.7 }}>{offer.was}</s>
                  <button
                    className="btn"
                    style={{ background: offer.accentBtn, color: offer.accentText, fontWeight: 700, marginLeft: 'auto' }}
                    onClick={(e) => { e.stopPropagation(); onNavigate('appointments'); }}
                  >
                    {offer.cta}
                  </button>
                </div>
              </div>
              <div style={{ flex: '1 1 280px', minHeight: '160px' }}>
                <img
                  src={offer.img}
                  alt={offer.alt}
                  loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              </div>
            </div>
          ))}
        </div>
        <ExtraBanners page="home" excludeKeys={['home_offer_1','home_offer_2','home_offer_3']} />
      </section>

      {/* WHY CHOOSE US — photo-banner style */}
      <section style={{ padding: '100px 5%' }}>
        <div className="section-header">
          <span className="pill-tag">Why VinuCare</span>
          <h2>The Standard of Care Your Pet Deserves</h2>
          <p>We combine clinical excellence with genuine compassion — because your pet's comfort matters as much as their health.</p>
        </div>
        <div
          className="photo-banner reverse"
          style={{ background: '#4C1D95', minHeight: '420px', cursor: 'default' }}
        >
          <div className="photo-banner-text" style={{ flex: '1 1 420px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 28px' }}>
              <div><div style={{ marginBottom: '6px' }}><StethoscopeIcon size={24} /></div><h4 style={{ margin: '0 0 4px' }}>Fear-Free Certified</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Protocols designed to reduce anxiety and create positive vet experiences.</p></div>
              <div><div style={{ marginBottom: '6px' }}><DiagnosticsIcon size={24} /></div><h4 style={{ margin: '0 0 4px' }}>In-House Diagnostics</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>On-site blood work, urinalysis and imaging for same-day results.</p></div>
              <div><div style={{ marginBottom: '6px' }}><DeviceIcon size={24} /></div><h4 style={{ margin: '0 0 4px' }}>Digital Health Records</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Access your pet's full health history and reports anytime online.</p></div>
              <div><div style={{ marginBottom: '6px' }}><ChatIcon size={24} /></div><h4 style={{ margin: '0 0 4px' }}>Post-Visit Follow-Up</h4><p style={{ opacity: 0.85, fontSize: '.9rem', margin: 0 }}>Our team checks in after every appointment to ensure recovery.</p></div>
            </div>
          </div>
          <div className="photo-banner-img">
            <img src={whyMain} alt="Vet with pet owner" loading="lazy" />
          </div>
        </div>
      </section>

      {/* HOME REVIEWS */}
      <section className="home-reviews-section" style={{ background: 'var(--off-white)' }}>
        <div className="section-header">
          <span className="pill-tag">Testimonials</span>
          <h2>What Pet Parents Say About Us</h2>
        </div>
        <div className="reviews-row">
          {reviewsLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div className="rev-card" key={i}>
                <div className="rev-header">
                  <Skeleton circle width="46px" height="46px" />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height="0.95rem" style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height="0.78rem" />
                  </div>
                </div>
                <Skeleton width="90px" height="0.9rem" style={{ margin: '10px 0' }} />
                <Skeleton width="100%" height="0.85rem" style={{ marginBottom: 6 }} />
                <Skeleton width="80%" height="0.85rem" style={{ marginBottom: 10 }} />
                <Skeleton width="70px" height="1.4rem" radius="20px" />
              </div>
            ))
          ) : reviewsError ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#888', width: '100%' }}>Couldn't load reviews right now. Please try again later.</p>
          ) : homeReviews.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#888', width: '100%' }}>No reviews yet. Be the first!</p>
          ) : (
            homeReviews.map((review, i) => {
              const name = review.name || 'Anonymous';
              const petLabel = review.pet || 'Pet Owner';
              const text = review.review || '';
              const service = review.service || 'General';
              const stars = '⭐'.repeat((review.stars?.match(/[★⭐]/g) || []).length || 5);
              const initial = name.trim().charAt(0).toUpperCase() || '?';

              return (
                <div className="rev-card" key={review.id || review._id || i}>
                  <div className="rev-header">
                    <div className="rev-avatar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#6b21a8', color: '#fff', fontWeight: 700 }}>{initial}</div>
                    <div><div className="rev-name">{name}</div><div className="rev-pet" style={{ display: 'flex', alignItems: 'center', gap: 5 }}><PawIcon size={12} /> {petLabel}</div></div>
                  </div>
                  <div className="rev-stars">{stars}</div>
                  <p className="rev-text">{text}</p>
                  <span className="rev-service">{service}</span>
                </div>
              );
            })
          )}
        </div>
        <div style={{ textAlign: 'center' }}><button className="btn btn-outline" onClick={() => onNavigate('reviews')}>Read All Reviews →</button></div>
      </section>
      {/* SHOP BY BRAND */}
      <section className="brands-section">
        <div className="section-header">
          <span className="pill-tag">Trusted Partners</span>
          <h2>Shop by Brand</h2>
          <p>We stock only the most trusted and vet-recommended pet nutrition brands in Sri Lanka.</p>
        </div>
          <div className="brands-scroll">
          {[
            { name: 'Royal Canin', color: '#c8102e', img: royalCanin },
            { name: 'Pedigree',    color: '#1455a3', img: pedigree   },
            { name: 'Whiskas',     color: '#7b2d8b', img: whiskas    },
            { name: 'Me-O',        color: '#f47920', img: meo        },
            { name: 'Drools',      color: '#2ecc71', img: drools     },
            { name: 'Hills',       color: '#003087', img: hills      },
          ].map(brand => (
            <div
              className="brand-tile"
              key={brand.name}
              onClick={() => { setCurrentBrand(brand.name); setCurrentCategory('all'); onNavigate('shop'); }}
            >
              <div style={{
                width: '64px', height: '64px', borderRadius: '14px',
                background: brand.color, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden'
              }}>
                {brand.img
                  ? <img src={brand.img} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  : <span style={{ color: '#fff', fontWeight: '800', fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                      {brand.name.slice(0, 2).toUpperCase()}
                    </span>
                }
              </div>
              <span className="brand-tile-name">{brand.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CONTACT */}
      <section className="contact-section">
        <div className="section-header">
          <span className="pill-tag">Find Us</span>
          <h2>Visit Our Clinic</h2>
          <p>Conveniently located with ample parking. Walk-ins welcome for urgent care.</p>
        </div>
        <div className="contact-inner">
          <div>
            <div className="contact-map">
              <LeafletMap address="VINU Care Agency, Kamburugamuwa" title="VinuCare Location" />
            </div>
            <div className="contact-clinic-img">
              <img src={clinicInterior} alt="Clinic interior" loading="lazy" />
            </div>
          </div>
          <div className="contact-info">
            <h2>Get in Touch</h2>
            <p>We're here to answer questions, schedule appointments and support you every step of the way.</p>
            <div className="contact-items">
              <div className="contact-item"><div className="contact-item-icon"><PinIcon size={20} /></div><div><strong>Address</strong><span>VINU Care Agency, Thathsara, Kamburugamuwa</span></div></div>
              <div className="contact-item"><div className="contact-item-icon"><PhoneIcon size={20} /></div><div><strong>Phone</strong><span>+94 78 941 6906</span></div></div>
              <div className="contact-item"><div className="contact-item-icon"><MailIcon size={20} /></div><div><strong>Email</strong><span>vinuagency@gmail.com</span></div></div>
              <div className="contact-item"><div className="contact-item-icon"><ClockIcon size={20} /></div><div><strong>Hours</strong><span>Mon–Sat 8AM–7PM · Sun 9AM–3PM</span></div></div>
              <div className="contact-item"><div className="contact-item-icon"><AlertIcon size={20} /></div><div><strong>Emergency</strong><span>24/7 Urgent Care Line: +94 71 422 9609</span></div></div>
            </div>
            <button className="btn btn-primary" onClick={() => onNavigate('appointments')}>Book Appointment →</button>
          </div>
        </div>
      </section>

    </div>
  );
}