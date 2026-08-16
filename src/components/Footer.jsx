import vinuLogo from '../assets/logo/vinucare-logo.png';
import { PinIcon, PhoneIcon, MailIcon, ClockIcon, AlertIcon } from './ui/Icons';

const footerLinkStyle = { display: 'flex', alignItems: 'center', gap: 8 };

export default function Footer({ onNavigate }) {
  return (
    <footer className="site-footer" id="siteFooter">
      <div className="footer-grid">
        <div className="footer-brand">
          <a className="logo" onClick={() => onNavigate('home')}>
            <div className="logo-mark">
              <img
                src={vinuLogo}
                alt="VinuCare"
                style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'block' }}
              />
            </div>
            <div>
              <div className="logo-text">Vinu<span>Care</span></div>
              <span className="logo-sub">Veterinary &amp; Pet Care</span>
            </div>
          </a>
          <p>Providing loving, professional veterinary care and pet services since 2016. Because every pet deserves to be treated like family.</p>
        </div>

        <div className="footer-col">
          <h4>Services</h4>
          <ul>
            <li><a onClick={() => onNavigate('services')}>Veterinary Care</a></li>
            <li><a onClick={() => onNavigate('services')}>Grooming</a></li>
            <li><a onClick={() => onNavigate('services')}>Boarding</a></li>
            <li><a onClick={() => onNavigate('services')}>Training</a></li>
            <li><a onClick={() => onNavigate('services')}>Emergency Care</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><a onClick={() => onNavigate('home')}>Home</a></li>
            <li><a onClick={() => onNavigate('shop')}>Pet Shop</a></li>
            <li><a onClick={() => onNavigate('appointments')}>Book Appointment</a></li>
            <li><a onClick={() => onNavigate('reviews')}>Reviews</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul>
            <li><a style={footerLinkStyle}><PinIcon size={15} /> VINU Care Agency, Thathsara, Kamburugamuwa</a></li>
            <li><a style={footerLinkStyle}><PhoneIcon size={15} /> +94 11 234 5678</a></li>
            <li><a style={footerLinkStyle}><MailIcon size={15} /> vinuagency@gmail.com</a></li>
            <li><a style={footerLinkStyle}><ClockIcon size={15} /> Mon–Sat: 8AM – 7PM</a></li>
            <li><a style={footerLinkStyle}><AlertIcon size={15} /> Emergency: +94 77 999 0000</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 VinuCare Veterinary &amp; Pet Care. All rights reserved.</span>
      </div>
    </footer>
  );
}